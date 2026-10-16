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
import {publicRequest, workspacePath} from './apiClient'
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

// Local messages are kept after the server's list: the greeting is never stored by the API,
// and a message that failed to send stays queued until the next successful request.
const merge = (local: ChatMessage[], remote: ApiMessage[]): ChatMessage[] => [
  ...local.filter(item => item.id === GREETING_ID),
  ...remote.map(fromApi),
  ...local.filter(item => item.delivery === 'queued'),
]

export class ChatService extends LocalStorageService<Conversation> {
  constructor() {
    super('swemre:chat-conversations')
  }

  // Refreshes every stored conversation so owner replies appear when the widget loads
  override async findAll(): Promise<Conversation[]> {
    await Promise.all(
      this.rows
        .filter(conversation => conversation.publicToken)
        .map(conversation => this.sync(conversation.id)),
    )
    const all = await super.findAll()
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async presence(): Promise<ChatPresence> {
    try {
      const status = await publicRequest<{online: boolean}>(
        `${workspacePath}/presence`,
      )
      return status?.online ? 'online' : 'offline'
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

  async send(id: string, text: string): Promise<Conversation | undefined> {
    const conversation = await this.findById(id)
    if (!conversation) return undefined

    const now = new Date().toISOString()
    const firstFromVisitor = !conversation.messages.some(
      item => item.author === 'visitor',
    )
    const title = firstFromVisitor ? titleFrom(text) : conversation.title

    try {
      if (!conversation.publicToken) {
        const created = await publicRequest<ApiConversation>(
          `${workspacePath}/conversations`,
          {method: 'POST', body: {text}},
        )
        if (!created) throw new Error('conversation was not created')
        return this.update(id, {
          publicToken: created.token,
          title,
          updatedAt: now,
          messages: merge(conversation.messages, created.messages),
        })
      }

      const updated = await publicRequest<ApiConversation>(
        `${workspacePath}/conversations/${conversation.publicToken}/message`,
        {method: 'POST', body: {text}},
      )
      if (!updated) throw new Error('conversation was not found')
      return this.update(id, {
        title,
        updatedAt: now,
        messages: merge(conversation.messages, updated.messages),
      })
    } catch {
      // The API is unreachable or refused the message: keep it visible as queued
      return this.update(id, {
        title,
        updatedAt: now,
        messages: [
          ...conversation.messages,
          message('visitor', text, 'queued'),
        ],
      })
    }
  }

  private async sync(id: string): Promise<void> {
    const conversation = this.rows.find(row => row.id === id)
    if (!conversation?.publicToken) return
    try {
      const remote = await publicRequest<ApiConversation>(
        `${workspacePath}/conversations/${conversation.publicToken}`,
      )
      if (!remote) return
      await this.update(id, {
        messages: merge(conversation.messages, remote.messages),
      })
    } catch {
      // Keep the stored copy when the API cannot be reached
    }
  }
}
