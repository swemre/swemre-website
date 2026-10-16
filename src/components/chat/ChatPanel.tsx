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

import {useEffect, useRef, useState, type KeyboardEvent} from 'react'
import {siteConfig} from '../../config/site'
import {useChat} from '../../hooks/useChat'
import {useSound} from '../../hooks/useSound'
import type {Conversation} from '../../types/type'
import {buttonClass} from '../../utils/buttonClass'
import {cn} from '../../utils/cn'
import {Icon} from '../Icon'
import {OwnerAvatar} from './OwnerAvatar'

const headerButton =
  'inline-grid size-8 place-items-center rounded-full text-cover-fg/80 transition-colors hover:bg-cover-fg/15 hover:text-cover-fg'

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})

const day = (iso: string) =>
  new Date(iso).toLocaleDateString([], {month: 'short', day: 'numeric'})

function ConversationList() {
  const chat = useChat()

  if (chat.conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <OwnerAvatar presence={chat.presence} size="lg" />
        <p className="font-semibold text-fg-strong">Say hello</p>
        <p className="text-sm text-fg-muted">
          Questions about a project, an article or working together? Start a
          conversation.
        </p>
        <button
          type="button"
          onClick={chat.start}
          className={buttonClass('primary', 'md', 'mt-2')}
        >
          <Icon name="plus" size={14} /> New conversation
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="min-h-0 flex-1 divide-y divide-border-muted overflow-y-auto">
        {chat.conversations.map(conversation => (
          <ConversationRow key={conversation.id} conversation={conversation} />
        ))}
      </ul>
      <div className="border-t border-border-muted p-3">
        <button
          type="button"
          onClick={chat.start}
          className={buttonClass('primary', 'md', 'w-full')}
        >
          <Icon name="plus" size={14} /> New conversation
        </button>
      </div>
    </div>
  )
}

function ConversationRow({conversation}: {conversation: Conversation}) {
  const chat = useChat()
  const last = conversation.messages[conversation.messages.length - 1]
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => chat.select(conversation.id)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted"
      >
        <OwnerAvatar size="sm" />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold text-fg-strong">
              {conversation.title}
            </span>
            <span className="shrink-0 text-2xs text-fg-subtle">
              {day(conversation.updatedAt)}
            </span>
          </span>
          <span className="block truncate text-xs text-fg-muted">
            {last?.author === 'visitor' && 'You: '}
            {last?.text}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => chat.remove(conversation.id)}
        aria-label={`Delete "${conversation.title}"`}
        className="absolute top-3 right-3 hidden size-7 place-items-center rounded-sm bg-overlay text-fg-muted shadow-xs group-hover:inline-grid hover:text-danger focus-visible:inline-grid"
      >
        <Icon name="trash" size={13} />
      </button>
    </li>
  )
}

function ConversationView({conversation}: {conversation: Conversation}) {
  const chat = useChat()
  const sound = useSound()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const count = conversation.messages.length

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [count])

  const submit = () => {
    if (!draft.trim()) return
    sound.play('send')
    chat.send(draft)
    setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {chat.presence === 'offline' && (
        <p className="flex items-center gap-2 border-b border-border-muted bg-attention-muted px-4 py-2 text-xs text-fg">
          <Icon name="clock" size={13} className="text-attention" />
          Emre is offline. Messages are kept on this device until chat goes
          live.
        </p>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {conversation.messages.map(message => {
          const mine = message.author === 'visitor'
          return (
            <div
              key={message.id}
              className={cn('flex items-end gap-2', mine && 'justify-end')}
            >
              {!mine && <OwnerAvatar size="sm" />}
              <div
                className={cn(
                  'max-w-bubble rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                  mine
                    ? 'rounded-br-xs bg-primary-solid text-cover-fg'
                    : 'rounded-bl-xs bg-surface-muted text-fg-strong',
                )}
              >
                {message.text}
                <span
                  className={cn(
                    'mt-1 flex items-center gap-1 text-2xs',
                    mine ? 'justify-end text-cover-fg/70' : 'text-fg-subtle',
                  )}
                >
                  {time(message.sentAt)}
                  {mine && message.delivery === 'queued' && (
                    <>
                      <Icon name="clock" size={10} /> Queued
                    </>
                  )}
                  {mine && message.delivery === 'sent' && (
                    <Icon name="check" size={10} />
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-end gap-2 border-t border-border-muted p-3">
        <textarea
          rows={1}
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          data-sound-enter="none"
          placeholder="Write a message…"
          aria-label="Message"
          className="max-h-32 min-h-9 flex-1 resize-none rounded-sm border border-border bg-inset px-3 py-2 text-sm text-fg-strong placeholder:text-fg-subtle focus:border-primary focus:outline-2 focus:outline-primary-muted"
        />
        <button
          type="button"
          onClick={submit}
          data-sound="none"
          disabled={!draft.trim()}
          aria-label="Send"
          className="inline-grid size-9 shrink-0 place-items-center rounded-sm bg-primary-solid text-cover-fg transition-colors hover:bg-primary-solid-hover disabled:opacity-40"
        >
          <Icon name="send" size={15} />
        </button>
      </div>
    </div>
  )
}

export function ChatPanel() {
  const chat = useChat()
  const active = chat.active

  return (
    <section
      aria-label="Chat"
      className="pointer-events-auto flex h-chat w-chat-panel animate-pop flex-col overflow-hidden rounded-md border border-border bg-overlay shadow-xl"
    >
      <header className="flex items-center gap-3 bg-primary-solid px-3 py-3 text-cover-fg">
        {active && (
          <button
            type="button"
            onClick={() => chat.select(null)}
            aria-label="All conversations"
            className={headerButton}
          >
            <Icon name="arrow-left" size={16} />
          </button>
        )}
        <OwnerAvatar presence={chat.presence} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{siteConfig.name}</p>
          <p className="truncate text-xs text-cover-fg/75">
            {chat.presence === 'online' ? 'Online' : 'Offline · replies later'}
          </p>
        </div>
        <button
          type="button"
          onClick={chat.start}
          aria-label="New conversation"
          className={headerButton}
        >
          <Icon name="plus" size={16} />
        </button>
        <button
          type="button"
          onClick={chat.close}
          aria-label="Close chat"
          data-sound="cancel"
          className={headerButton}
        >
          <Icon name="x" size={16} />
        </button>
      </header>

      {active ? (
        <ConversationView key={active.id} conversation={active} />
      ) : (
        <ConversationList />
      )}
    </section>
  )
}
