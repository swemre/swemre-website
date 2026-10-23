/**
 * Copyright 2026 swemre (emre@swemre.com). All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 with the Commons Clause
 * License Condition v1.0 (the "License"). Personal use of this code and
 * content is permitted; any commercial gain requires prior written
 * permission from the copyright holder. See the LICENSE file for full terms.
 *
 * Contact: emre@swemre.com
 */

import type {
  ChatAuthor,
  ChatMessage,
  ChatPresence,
  Conversation,
} from '../types/type'
import {publicApi} from './publicApi'
import {LocalStorageService} from './LocalStorageService'

const GREETING =
  "Hi, I'm Emre. I'm not online right now, but leave a message and I'll get back to you as soon as I can."

const GREETING_ID = 'greeting'

interface ApiMessage {
  id: number
  author: 'VISITOR' | 'OWNER'
  text: string
  sentAt: string
}

interface ApiConversation {
  token: string
  messages: ApiMessage[]
}

const message = (
  author: ChatAuthor,
  text: string,
  delivery: ChatMessage['delivery'],
  id: string = crypto.randomUUID(),
): ChatMessage => ({
  id,
  author,
  text,
  sentAt: new Date().toISOString(),
  delivery,
})

const fromApi = (apiMessage: ApiMessage): ChatMessage => ({
  id: `remote-${apiMessage.id}`,
  author: apiMessage.author === 'OWNER' ? 'owner' : 'visitor',
  text: apiMessage.text,
  sentAt: apiMessage.sentAt,
  delivery: 'sent',
})

const titleFrom = (text: string) =>
  text.length > 40 ? `${text.slice(0, 40).trimEnd()}…` : text

const unsent = (item: ChatMessage) => item.delivery !== 'sent'

const markSending = (item: ChatMessage): ChatMessage =>
  item.delivery === 'queued' ? {...item, delivery: 'sending'} : item

// Local messages are kept after the server's list: the greeting is never stored by the API,
// and a message that has not been accepted yet stays until a later request delivers it.
const merge = (local: ChatMessage[], remote: ApiMessage[]): ChatMessage[] => [
  ...local.filter(item => item.id === GREETING_ID),
  ...remote.map(fromApi),
  ...local.filter(unsent),
]

// What the conversation's socket sends: a new message, or the owner coming online or going away
export type ChatSocketEvent =
  | {type: 'message'; message: ApiMessage}
  | {type: 'presence'; online: boolean}
  | {type: 'connected'}

const RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000]

export class ChatService extends LocalStorageService<Conversation> {
  private readonly delivering = new Map<string, Promise<void>>()

  constructor() {
    super('swemre:chat-conversations')
    // A message still sending when the page was closed waits for the next retry
    for (const conversation of this.rows) {
      conversation.messages = conversation.messages.map(item =>
        item.delivery === 'sending' ? {...item, delivery: 'queued'} : item,
      )
    }
  }

  // Refreshes every stored conversation so owner replies appear when the widget loads
  override async findAll(): Promise<Conversation[]> {
    await Promise.all(
      this.rows
        .filter(conversation => conversation.publicToken)
        .map(conversation => this.sync(conversation.id)),
    )
    return this.list()
  }

  async presence(): Promise<ChatPresence> {
    try {
      return (await publicApi.presence()) ? 'online' : 'offline'
    } catch {
      return 'offline'
    }
  }

  // A conversation only exists on the server after its first message, so starting one is local
  start(): Promise<Conversation> {
    const now = new Date().toISOString()
    return this.create({
      title: 'New conversation',
      createdAt: now,
      updatedAt: now,
      messages: [message('owner', GREETING, 'sent', GREETING_ID)],
    })
  }

  // The conversations as stored on this device, newest first, without asking the API
  async list(): Promise<Conversation[]> {
    const all = await super.findAll()
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  // Adds the visitor's message at once as sending; deliver() then posts it
  async enqueue(id: string, text: string): Promise<Conversation | undefined> {
    const conversation = await this.findById(id)
    if (!conversation) return undefined
    const firstFromVisitor = !conversation.messages.some(
      item => item.author === 'visitor',
    )
    return this.update(id, {
      title: firstFromVisitor ? titleFrom(text) : conversation.title,
      updatedAt: new Date().toISOString(),
      messages: [
        ...conversation.messages.map(markSending),
        message('visitor', text, 'sending'),
      ],
    })
  }

  // Shows queued messages as sending again before deliver() retries them
  async markSending(id: string): Promise<boolean> {
    const conversation = await this.findById(id)
    if (!conversation?.messages.some(unsent)) return false
    await this.update(id, {messages: conversation.messages.map(markSending)})
    return true
  }

  pending(): string[] {
    return this.rows
      .filter(conversation => conversation.messages.some(unsent))
      .map(conversation => conversation.id)
  }

  // Posts every unsent message of the conversation in order. Calls run one after another, so a
  // retry while a send is in flight never posts the same message twice.
  deliver(id: string): Promise<void> {
    const next = (this.delivering.get(id) ?? Promise.resolve()).then(() =>
      this.flush(id),
    )
    this.delivering.set(id, next)
    void next.finally(() => {
      if (this.delivering.get(id) === next) this.delivering.delete(id)
    })
    return next
  }

  private async flush(id: string): Promise<void> {
    for (;;) {
      const conversation = this.rows.find(row => row.id === id)
      const next = conversation?.messages.find(unsent)
      if (!conversation || !next) return
      try {
        const remote = await this.post(conversation.publicToken, next.text)
        const current = this.rows.find(row => row.id === id)
        if (!current) return
        await this.update(id, {
          publicToken: remote.token,
          updatedAt: new Date().toISOString(),
          messages: merge(
            current.messages.filter(item => item.id !== next.id),
            remote.messages,
          ),
        })
      } catch {
        // The API is unreachable or refused the message: keep it, and the rest, queued
        const current = this.rows.find(row => row.id === id)
        if (!current) return
        await this.update(id, {
          messages: current.messages.map(item =>
            unsent(item) ? {...item, delivery: 'queued'} : item,
          ),
        })
        return
      }
    }
  }

  // A conversation only exists on the server after its first message, which creates it
  private async post(
    publicToken: string | undefined,
    text: string,
  ): Promise<ApiConversation> {
    return publicApi.sendChatMessage<ApiConversation>(publicToken, text)
  }

  private async sync(id: string): Promise<void> {
    const conversation = this.rows.find(row => row.id === id)
    if (!conversation?.publicToken) return
    try {
      const remote = await publicApi.getConversation<ApiConversation>(
        conversation.publicToken,
      )
      const current = this.rows.find(row => row.id === id)
      if (!remote || !current) return
      await this.update(id, {
        messages: merge(current.messages, remote.messages),
      })
    } catch {
      // Keep the stored copy when the API cannot be reached
    }
  }

  // Keeps a socket open to the conversation, reconnecting with growing pauses, until the
  // returned function is called. Without a token the conversation is not on the server yet.
  connect(
    publicToken: string,
    onEvent: (event: ChatSocketEvent) => void,
  ): () => void {
    const url = publicApi.conversationSocketUrl(publicToken)
    let socket: WebSocket | null = null
    let attempt = 0
    let timer: number | undefined
    let stopped = false

    const open = () => {
      if (stopped) return
      socket = new WebSocket(url)
      socket.onopen = () => {
        attempt = 0
        onEvent({type: 'connected'})
      }
      socket.onmessage = event => {
        try {
          onEvent(JSON.parse(String(event.data)) as ChatSocketEvent)
        } catch {
          // A message this version does not understand is ignored
        }
      }
      socket.onclose = () => {
        if (stopped) return
        const delay =
          RECONNECT_DELAYS_MS[Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)]
        attempt += 1
        timer = window.setTimeout(open, delay)
      }
    }
    open()

    return () => {
      stopped = true
      window.clearTimeout(timer)
      socket?.close()
    }
  }

  // A message pushed over the socket joins the stored conversation once
  async receive(id: string, apiMessage: ApiMessage): Promise<void> {
    const conversation = this.rows.find(row => row.id === id)
    if (!conversation) return
    const received = fromApi(apiMessage)
    if (conversation.messages.some(item => item.id === received.id)) return
    await this.update(id, {
      updatedAt: received.sentAt,
      messages: [
        ...conversation.messages.filter(item => !unsent(item)),
        received,
        ...conversation.messages.filter(unsent),
      ],
    })
  }
}
