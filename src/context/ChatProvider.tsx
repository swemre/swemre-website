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

import {useCallback, useEffect, useState, type ReactNode} from 'react'
import {useService} from '../hooks/useService'
import type {ChatPresence, Conversation} from '../types/type'
import {ChatContext} from './ChatContext'

export function ChatProvider({children}: {children: ReactNode}) {
  const chat = useService('chat')
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [presence, setPresence] = useState<ChatPresence>('offline')

  useEffect(() => {
    let live = true
    void Promise.all([chat.findAll(), chat.presence()]).then(([all, p]) => {
      if (!live) return
      setConversations(all)
      setPresence(p)
    })
    return () => {
      live = false
    }
  }, [chat])

  const refresh = useCallback(
    async () => setConversations(await chat.list()),
    [chat],
  )

  const deliver = useCallback(
    async (id: string) => {
      await chat.deliver(id)
      await refresh()
    },
    [chat, refresh],
  )

  const retry = useCallback(
    async (id: string) => {
      if (!(await chat.markSending(id))) return
      await refresh()
      await deliver(id)
    },
    [chat, refresh, deliver],
  )

  const retryAll = useCallback(() => {
    for (const id of chat.pending()) void retry(id)
  }, [chat, retry])

  useEffect(() => {
    window.addEventListener('online', retryAll)
    return () => window.removeEventListener('online', retryAll)
  }, [retryAll])

  // One socket per conversation that exists on the server: owner replies and the owner's
  // presence arrive while the page is open, without reloading
  const tokens = conversations
    .filter(conversation => conversation.publicToken)
    .map(conversation => `${conversation.id}:${conversation.publicToken}`)
    .join(',')
  useEffect(() => {
    if (!tokens) return
    const stops = tokens.split(',').map(entry => {
      const [id, publicToken] = entry.split(':')
      return chat.connect(publicToken, event => {
        if (event.type === 'connected') {
          void retry(id)
          return
        }
        if (event.type === 'presence') {
          setPresence(event.online ? 'online' : 'offline')
          return
        }
        void chat.receive(id, event.message).then(refresh)
      })
    })
    return () => stops.forEach(stop => stop())
  }, [chat, tokens, retry, refresh])

  const open = () => {
    setIsOpen(true)
    retryAll()
  }

  const start = () => {
    void chat.start().then(async conversation => {
      await refresh()
      setActiveId(conversation.id)
    })
  }

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!activeId || !trimmed) return
    const id = activeId
    void chat.enqueue(id, trimmed).then(async () => {
      await refresh()
      await deliver(id)
    })
  }

  const remove = (id: string) => {
    void chat.remove(id).then(() => {
      if (activeId === id) setActiveId(null)
      return refresh()
    })
  }

  return (
    <ChatContext
      value={{
        isOpen,
        presence,
        conversations,
        active: conversations.find(c => c.id === activeId) ?? null,
        open,
        close: () => setIsOpen(false),
        toggle: () => (isOpen ? setIsOpen(false) : open()),
        select: setActiveId,
        start,
        send,
        retry: id => void retry(id),
        remove,
      }}
    >
      {children}
    </ChatContext>
  )
}
