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
import type {ChatPresence, Conversation} from '../../types/type'
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
  const [confirming, setConfirming] = useState(false)
  const last = conversation.messages[conversation.messages.length - 1]

  if (confirming) {
    return (
      <li
        className="flex items-center gap-2 bg-danger-muted px-4 py-3"
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            setConfirming(false)
          }
        }}
      >
        <span className="min-w-0 flex-1 truncate text-sm text-fg-strong">
          Delete “{conversation.title}”?
        </span>
        <button
          type="button"
          autoFocus
          onClick={() => setConfirming(false)}
          data-sound="cancel"
          className={buttonClass('ghost', 'sm')}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => chat.remove(conversation.id)}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-danger px-3 text-sm font-medium text-fg-on-emphasis hover:opacity-90"
        >
          <Icon name="trash" size={13} /> Delete
        </button>
      </li>
    )
  }

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => chat.select(conversation.id)}
        className="flex w-full items-start gap-3 py-3 pr-12 pl-4 text-left transition-colors hover:bg-surface-muted"
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
        onClick={() => setConfirming(true)}
        aria-label={`Delete "${conversation.title}"`}
        className="absolute top-1/2 right-3 inline-grid size-8 -translate-y-1/2 place-items-center rounded-sm text-fg-muted opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-surface-muted hover:text-danger focus-visible:opacity-100 pointer-coarse:opacity-100"
      >
        <Icon name="trash" size={14} />
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
      {chat.presence === 'unreachable' && (
        <p
          role="status"
          className="flex items-center gap-2 border-b border-border-muted bg-attention-muted px-4 py-2 text-xs text-fg"
        >
          <Icon name="warning" size={13} className="text-attention" />
          The chat server cannot be reached. Your messages are kept here and
          sent when it is back.
        </p>
      )}
      {chat.presence === 'offline' && (
        <p className="flex items-center gap-2 border-b border-border-muted bg-attention-muted px-4 py-2 text-xs text-fg">
          <Icon name="clock" size={13} className="text-attention" />
          Emre is offline. Your messages are delivered and he will reply here
          later.
        </p>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
      >
        {conversation.messages.map(message => {
          const mine = message.author === 'visitor'
          const queued = mine && message.delivery === 'queued'
          const bubble = cn(
            'max-w-bubble rounded-lg px-3 py-2 text-left text-sm whitespace-pre-wrap',
            mine
              ? 'rounded-br-xs bg-primary-solid text-cover-fg'
              : 'rounded-bl-xs bg-surface-muted text-fg-strong',
            message.delivery === 'sending' && 'opacity-75',
          )
          const body = (
            <>
              {message.text}
              <span
                className={cn(
                  'mt-1 flex items-center gap-1 text-2xs',
                  mine ? 'justify-end text-cover-fg/70' : 'text-fg-subtle',
                )}
              >
                {time(message.sentAt)}
                {mine && message.delivery === 'sending' && (
                  <span className="inline-flex animate-pulse items-center gap-1">
                    <Icon name="clock" size={10} /> Sending…
                  </span>
                )}
                {queued && (
                  <span className="inline-flex items-center gap-1 font-medium text-cover-fg">
                    <Icon name="warning" size={10} /> Not sent · tap to retry
                  </span>
                )}
                {mine && message.delivery === 'sent' && (
                  <Icon name="check" size={10} />
                )}
              </span>
            </>
          )
          return (
            <div
              key={message.id}
              className={cn('flex items-end gap-2', mine && 'justify-end')}
            >
              {!mine && <OwnerAvatar size="sm" />}
              {queued ? (
                <button
                  type="button"
                  onClick={() => chat.retry(conversation.id)}
                  aria-label={`Retry sending: ${message.text}`}
                  className={cn(
                    bubble,
                    'outline-offset-2 hover:bg-primary-solid-hover',
                  )}
                >
                  {body}
                </button>
              ) : (
                <div className={bubble}>{body}</div>
              )}
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

const presenceLabel: Record<ChatPresence, string> = {
  online: 'Online',
  offline: 'Offline · replies later',
  unreachable: 'Server not reachable · messages wait here',
}

export function ChatPanel() {
  const chat = useChat()
  const active = chat.active

  return (
    <section
      aria-label="Chat"
      className="pointer-events-auto flex animate-pop flex-col overflow-hidden bg-overlay max-sm:fixed max-sm:inset-x-0 max-sm:top-0 max-sm:z-10 max-sm:h-dvh max-sm:w-full max-sm:pt-safe-top max-sm:pb-safe-bottom sm:h-chat sm:w-chat-panel sm:rounded-md sm:border sm:border-border sm:shadow-xl"
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
            {presenceLabel[chat.presence]}
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
