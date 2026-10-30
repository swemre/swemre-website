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

// Quick search (V4-Comp-SearchDialog): Ctrl/Cmd+K anywhere, grouped results from useSearch with
// the query marked, arrow keys move the active row, Enter opens it (or goes to /search?q= when
// nothing is active), Esc closes. Keyboard hints only on desktop and 4K; X instead of Esc on m/t.
import {
  Fragment,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import {useNavigate} from 'react-router-dom'
import {
  Anchor,
  Icon,
  Kbd,
  TextLink,
  hueRgb,
  useViewport,
} from '../design/index.tsx'
import {useSearch} from '../data/hooks.ts'
import type {SearchResult} from '../contract/view.ts'
import {useChrome} from './context.ts'
import {useFocusTrap, useScrollLock} from './hooks.ts'
import {t} from '../i18n/index.ts'

const PAD = {m: 64, t: 96, d: 96, '4k': 128} as const

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Wraps every query word found in text in mark.p2-mark. */
function marked(text: string, query: string): ReactNode {
  const words = query.trim().split(/\s+/).filter(Boolean).map(escapeRe)
  if (words.length === 0) return text
  const re = new RegExp(`(${words.join('|')})`, 'gi')
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="p2-mark">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

function lineOf(r: SearchResult) {
  if (r.kind === 'article') return r.summary ?? r.meta ?? ''
  const head = [r.meta, ...r.tags].filter(Boolean).join(' · ')
  return r.summary ? `${head}: ${r.summary}` : head
}

export function SearchDialog() {
  const chrome = useChrome()
  const vp = useViewport()
  const navigate = useNavigate()
  const wide = vp === 'd' || vp === '4k'
  const [q, setQ] = useState(chrome.searchSeed)
  const [active, setActive] = useState(0)
  const dialog = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const deferred = useDeferredValue(q.trim())
  const res = useSearch(deferred)
  const close = chrome.closeSearch

  useFocusTrap(dialog, true, close)
  useScrollLock(true)
  useEffect(() => {
    input.current?.focus()
    input.current?.select()
  }, [])

  const items: SearchResult[] =
    deferred && res.status === 'ready'
      ? res.data.groups.flatMap(g => g.items)
      : []
  const total = items.length
  const at = Math.min(active, Math.max(total - 1, 0))
  const nomatch = deferred !== '' && res.status === 'empty'
  const all = `/search?q=${encodeURIComponent(q.trim())}`

  const open = (href: string) => {
    close()
    void navigate(href)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && total) {
      e.preventDefault()
      setActive((at + 1) % total)
    } else if (e.key === 'ArrowUp' && total) {
      e.preventDefault()
      setActive((at - 1 + total) % total)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (total) open(items[at].href)
      else if (q.trim()) open(all)
    }
  }

  return (
    <div
      className="a2-scrim"
      onClick={close}
      style={{
        zIndex: 60,
        alignItems: 'flex-start',
        padding: vp === 'm' ? '64px 16px 0' : `${PAD[vp]}px 0 0`,
        background: 'var(--a2-scrim-search)',
      }}
    >
      <div
        ref={dialog}
        className="a2-dialog"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('qs.label')}
        style={{width: vp === 'm' ? '100%' : 720}}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            height: 64,
            padding: '0 24px',
            borderBottom: '1px solid var(--a2-line-blue)',
            flex: 'none',
          }}
        >
          <Icon name="search" size={20} />
          <input
            ref={input}
            className="pf-q"
            type="text"
            value={q}
            onChange={e => {
              setQ(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKey}
            placeholder={t('qs.placeholder')}
            aria-label={t('nav.search')}
            role="combobox"
            aria-expanded={total > 0}
            aria-controls="a2-qs-list"
            aria-activedescendant={total ? `a2-qs-${at}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          {deferred && (
            <span
              className="a2-mono"
              style={{whiteSpace: 'nowrap', marginLeft: 'auto'}}
              aria-live="polite"
            >
              {res.status === 'loading'
                ? t('qs.searching')
                : t('qs.results', {count: total})}
            </span>
          )}
          {wide && (
            <button
              type="button"
              className="pf-esc"
              onClick={close}
              aria-label={t('qs.close')}
              style={deferred ? undefined : {marginLeft: 'auto'}}
            >
              <Kbd>Esc</Kbd>
            </button>
          )}
        </div>
        <div className="a2-qs-body">
          {total > 0 && res.status === 'ready' && (
            <div
              style={{padding: 8}}
              id="a2-qs-list"
              role="listbox"
              aria-label={t('qs.list')}
            >
              {res.data.groups.map((g, gi) => (
                <Fragment key={g.kind}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '16px 16px 8px',
                    }}
                  >
                    <span className="a2-micro">
                      {g.kind === 'article'
                        ? t('nav.articles')
                        : t('nav.projects')}
                    </span>
                    <span className="a2-mono">{g.items.length}</span>
                  </div>
                  {g.items.map((r, j) => {
                    const i =
                      res.data.groups
                        .slice(0, gi)
                        .reduce((sum, x) => sum + x.items.length, 0) + j
                    const on = i === at
                    return (
                      <Anchor
                        key={r.href}
                        id={`a2-qs-${i}`}
                        href={r.href}
                        role="option"
                        aria-selected={on}
                        className={`p2-qitem${on ? ' is-active' : ''}`}
                        onMouseMove={() => !on && setActive(i)}
                        onClick={() => close()}
                        tabIndex={-1}
                      >
                        <span
                          className="a2-itile is-40"
                          style={{
                            background: hueRgb('blue', 0.16),
                            color: 'var(--a2-hue-blue)',
                          }}
                        >
                          <Icon
                            name={r.kind === 'article' ? 'file-text' : 'folder'}
                            size={20}
                          />
                        </span>
                        <span style={{minWidth: 0, flex: 1}}>
                          <span
                            className="a2-h4"
                            style={{
                              display: 'block',
                              fontSize: 16,
                              lineHeight: '24px',
                            }}
                          >
                            {marked(r.title, deferred)}
                          </span>
                          <span
                            className="a2-cap"
                            style={{
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {marked(lineOf(r), deferred)}
                          </span>
                        </span>
                        {on && wide && (
                          <span
                            className="a2-cap"
                            style={{
                              marginLeft: 'auto',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              flex: 'none',
                            }}
                          >
                            Open<Kbd>↵</Kbd>
                          </span>
                        )}
                      </Anchor>
                    )
                  })}
                </Fragment>
              ))}
            </div>
          )}
          {nomatch && (
            <div style={{padding: '48px 24px', textAlign: 'center'}}>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <span
                  className="a2-itile is-40"
                  style={{
                    background: hueRgb('blue', 0.16),
                    color: 'var(--a2-hue-blue)',
                  }}
                >
                  <Icon name="search-x" size={20} />
                </span>
              </div>
              <div className="a2-h4" style={{marginTop: 16}}>
                {t('qs.empty.title', {q: deferred})}
              </div>
              <p className="a2-small" style={{marginTop: 4}}>
                {t('qs.empty.copy')}
              </p>
            </div>
          )}
          {res.status === 'error' && deferred && (
            <div style={{padding: '48px 24px', textAlign: 'center'}}>
              <div className="a2-h4">{t('qs.error.title')}</div>
              <p className="a2-small" style={{marginTop: 4}}>
                {t('qs.error.before')}
                <button type="button" className="a2-ulink" onClick={res.retry}>
                  {t('qs.error.retry')}
                </button>
                {t('qs.error.after')}
              </p>
            </div>
          )}
        </div>
        <div
          className="a2-cap"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 24px',
            borderTop: '1px solid var(--a2-line-blue)',
            flex: 'none',
          }}
        >
          {wide && (
            <>
              <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                {t('qs.hint.navigate')}
              </span>
              <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <Kbd>↵</Kbd>
                {t('qs.hint.open')}
              </span>
              <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <Kbd>Esc</Kbd>
                {t('qs.hint.close')}
              </span>
            </>
          )}
          <TextLink
            label={q.trim() ? t('qs.all', {q: q.trim()}) : t('qs.seeAll')}
            href={q.trim() ? all : '/search'}
            onClick={close}
            style={{marginLeft: 'auto'}}
          />
        </div>
      </div>
    </div>
  )
}
