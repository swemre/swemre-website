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
import {useNavigate} from 'react-router-dom'
import {usePlayer} from '../../hooks/usePlayer'
import {useSearchResults} from '../../hooks/useSearchResults'
import type {SearchResult, SearchResultGroup} from '../../types/type'
import {cn} from '../../utils/cn'
import {Icon} from '../Icon'
import {Kbd} from '../Kbd'
import {Modal} from '../Modal'

function groupResults(results: SearchResult[]): SearchResultGroup[] {
  const groups: SearchResultGroup[] = []
  for (const result of results) {
    const category = result.document.category
    let group: SearchResultGroup | undefined = groups.find(
      g => g.category === category,
    )
    if (!group) {
      group = {category, items: []}
      groups.push(group)
    }
    group.items.push(result)
  }
  return groups
}

function SearchPanel({onClose}: {onClose: () => void}) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const {results, loading} = useSearchResults(query)
  const navigate = useNavigate()
  const player = usePlayer()
  const listRef = useRef<HTMLDivElement>(null)

  const groups = groupResults(results)
  const flat = groups.flatMap(group => group.items)
  const current = Math.min(activeIndex, flat.length - 1)

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${current}"]`)
      ?.scrollIntoView({block: 'nearest'})
  }, [current])

  const choose = (result: SearchResult | undefined) => {
    if (!result) return
    const action = result.document.action
    onClose()
    if (action.kind === 'navigate') void navigate(action.to)
    else if (action.kind === 'external') {
      window.open(action.href, '_blank', 'noopener,noreferrer')
    } else player.toggle(action.song)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(Math.min(current + 1, flat.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(flat[current])
    }
  }

  const offsets = groups.map((_, g) =>
    groups.slice(0, g).reduce((sum, group) => sum + group.items.length, 0),
  )

  return (
    <div className="flex max-h-palette flex-col">
      <label className="flex items-center gap-3 border-b border-border px-4">
        <Icon name="search" size={18} className="text-fg-subtle" />
        <input
          autoFocus
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={onKeyDown}
          placeholder="Search articles, projects, songs…"
          aria-label="Search"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={current >= 0 ? `search-${current}` : undefined}
          className="h-14 flex-1 bg-transparent text-base text-fg-strong outline-none placeholder:text-fg-subtle"
        />
        <Kbd>Esc</Kbd>
      </label>

      <div
        ref={listRef}
        id="search-results"
        role="listbox"
        className="flex-1 overflow-y-auto p-2"
      >
        {!loading && flat.length === 0 && (
          <p className="px-3 py-10 text-center text-sm text-fg-muted">
            {query.trim() ? `No results for “${query}”` : 'Nothing to show yet'}
          </p>
        )}
        {groups.map((group, g) => (
          <div key={group.category} className="pb-2">
            <p className="px-3 pt-2 pb-1 text-xs font-semibold text-fg-subtle">
              {group.category}
            </p>
            {group.items.map((result, r) => {
              const i = offsets[g] + r
              const active = i === current
              const doc = result.document
              return (
                <button
                  key={doc.key}
                  id={`search-${i}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-index={i}
                  onMouseMove={() => setActiveIndex(i)}
                  onClick={() => choose(result)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left',
                    active ? 'bg-primary-muted' : 'hover:bg-surface-muted',
                  )}
                >
                  <span
                    className={cn(
                      'inline-grid size-8 shrink-0 place-items-center rounded-sm border border-border-muted bg-surface',
                      doc.icon === 'spotify' ? 'text-spotify' : 'text-fg-muted',
                    )}
                  >
                    <Icon name={doc.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-sm font-medium',
                        active ? 'text-primary' : 'text-fg-strong',
                      )}
                    >
                      {doc.title}
                    </span>
                    {doc.subtitle && (
                      <span className="block truncate text-xs text-fg-muted">
                        {doc.subtitle}
                      </span>
                    )}
                  </span>
                  <Icon
                    name={
                      doc.action.kind === 'play-song'
                        ? 'play'
                        : doc.action.kind === 'external'
                          ? 'external'
                          : 'arrow-right'
                    }
                    size={14}
                    className={active ? 'text-primary' : 'text-transparent'}
                  />
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 border-t border-border bg-surface-muted px-4 py-2 text-xs text-fg-muted">
        <span className="inline-flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> to navigate
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>↵</Kbd> to select
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          <Kbd>Esc</Kbd> to close
        </span>
      </div>
    </div>
  )
}

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Search"
      placement="top"
      showClose={false}
      wide
      className="overflow-hidden"
    >
      <SearchPanel onClose={onClose} />
    </Modal>
  )
}
