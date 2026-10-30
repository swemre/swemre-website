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

// /search?q=&type= (boards Search, Search-empty): the big search box, the All / Articles /
// Projects tabs, results with the match highlighted, and the no-results state with topic chips
// and "Recently written". The submit updates the URL.
import {Fragment, useRef, useState, type FormEvent} from 'react'
import type {TemplateProps} from '../../contract/templates.ts'
import type {SearchKind, SearchResult} from '../../contract/view.ts'
import {
  useArticles,
  useProjects,
  useSearch,
  useTerms,
} from '../../data/hooks.ts'
import {Anchor, Button, Chip, Icon, Skeleton} from '../../design/index.tsx'
import {ListSection, StateLayout} from '../home/kit/list.tsx'
import {ListHeader} from '../home/kit/ListHeader.tsx'
import {StateNumber, StatePanel} from '../home/kit/StatePanel.tsx'
import {useQuery} from '../home/kit/url.ts'
import {useV} from '../home/kit/vp.ts'
import {intlLocale, t} from '../../i18n/index.ts'
import {tRich} from '../../i18n/rich.tsx'

type Tab = 'all' | 'articles' | 'projects'
const KIND: Record<Exclude<Tab, 'all'>, SearchKind> = {
  articles: 'article',
  projects: 'project',
}

/** The text with every case-insensitive occurrence of q wrapped in mark.p2-mark. */
function highlight(text: string, q: string) {
  const needle = q.trim()
  if (!needle) return text
  const re = new RegExp(
    `(${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  )
  return text.split(re).map((part, i) =>
    i % 2 ? (
      <mark key={i} className="p2-mark">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- same props as every template
export function SearchTemplate(_props: TemplateProps) {
  const query = useQuery()
  const q = query.get('q').trim()
  const tab: Tab =
    query.get('type') === 'articles' || query.get('type') === 'projects'
      ? (query.get('type') as Tab)
      : 'all'
  const results = useSearch(q)
  const groups = results.status === 'ready' ? results.data.groups : []
  const count = (k: SearchKind) =>
    groups.find(g => g.kind === k)?.items.length ?? 0
  const total = count('article') + count('project')
  const items: SearchResult[] = groups
    .filter(g => tab === 'all' || g.kind === KIND[tab])
    .flatMap(g => g.items)
  const settled = results.status === 'ready' || results.status === 'empty'

  const tabs = (
    <Tabs
      tab={tab}
      live={results.status === 'ready'}
      counts={{
        all: total,
        articles: count('article'),
        projects: count('project'),
      }}
      onTab={t => query.set({type: t === 'all' ? undefined : t})}
    />
  )
  return (
    <>
      <ListHeader
        eyebrow={t('search.eyebrow')}
        title={t('nav.search')}
        commit="5ea4c11"
        below={
          <SearchControls
            key={q}
            initial={q}
            onSubmit={nq => query.set({q: nq || undefined, type: undefined})}
            tabs={q ? tabs : undefined}
            summary={
              q && settled ? (
                <span className="a2-cap">
                  {tRich(
                    'search.summary',
                    {q},
                    {
                      count: (
                        <span className="a2-hi" style={{fontWeight: 600}}>
                          {t('qs.results', {count: total})}
                        </span>
                      ),
                    },
                  )}
                </span>
              ) : undefined
            }
          />
        }
      />
      {!q ? (
        <ListSection label="0x00">
          <NoResults q="" />
        </ListSection>
      ) : results.status === 'loading' ? (
        <ListSection label="loading">
          <span className="a2-sr" role="status">
            {t('search.searching')}
          </span>
          <div className="a2-rows" aria-hidden="true">
            <Skeleton pattern="row" count={4} />
          </div>
        </ListSection>
      ) : results.status === 'error' ? (
        <ListSection label="error">
          <StateLayout
            number={
              <StateNumber
                prefix="E"
                digits="503"
                error
                line={t('search.error.line')}
              />
            }
          >
            <StatePanel
              icon="cloud-off"
              title={t('search.error.title')}
              copy={t('search.error.copy')}
              command={`GET /api/public/v2/search?q=${encodeURIComponent(q)}`}
              result="503 Service Unavailable"
              actions={
                <>
                  <Button
                    label={t('form.retry')}
                    iconLeft="refresh"
                    onClick={results.retry}
                  />
                  <Button
                    label={t('nav.allArticles')}
                    kind="secondary"
                    iconLeft="file-text"
                    href="/articles"
                  />
                </>
              }
            />
          </StateLayout>
        </ListSection>
      ) : results.status === 'empty' || items.length === 0 ? (
        <ListSection label="0x00">
          <NoResults q={q} />
        </ListSection>
      ) : (
        <ListSection label="4f2c9b0" ready at={[84, 16]}>
          <ResultRows items={items} q={q} />
        </ListSection>
      )}
    </>
  )
}

function SearchControls({
  initial,
  onSubmit,
  tabs,
  summary,
}: {
  initial: string
  onSubmit(q: string): void
  tabs?: React.ReactNode
  summary?: React.ReactNode
}) {
  const v = useV()
  const m = v(true, false, false)
  const [text, setText] = useState(initial)
  const input = useRef<HTMLInputElement>(null)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(text.trim())
  }
  return (
    <>
      <form className="p2-big" role="search" onSubmit={submit}>
        <Icon name="search" size={22} style={{color: 'var(--a2-link)'}} />
        <input
          ref={input}
          type="search"
          name="q"
          aria-label={t('qs.placeholder')}
          placeholder={t('qs.placeholder')}
          value={text}
          onChange={e => setText(e.target.value)}
          className="pf-in"
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: v(20, 28, 28),
            lineHeight: '36px',
            fontWeight: 600,
            letterSpacing: '-.01em',
            color: 'var(--a2-text-hi)',
            background: 'transparent',
            border: 0,
            padding: 0,
            height: 'auto',
          }}
        />
        <span
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          {!m && text && (
            <Button
              label={t('search.clear')}
              kind="ghost"
              iconLeft="x"
              style={{color: 'var(--a2-text)'}}
              onClick={() => {
                setText('')
                input.current?.focus()
              }}
            />
          )}
          {m ? (
            <Button
              label={t('nav.search')}
              iconOnly
              iconLeft="arrow-right"
              type="submit"
            />
          ) : (
            <Button
              label={t('nav.search')}
              iconRight="arrow-right"
              type="submit"
            />
          )}
        </span>
      </form>
      {tabs && (
        <>
          <div className="a2-fhr" style={{marginTop: v(32, 32, 48)}} />
          <div
            style={{
              display: 'flex',
              marginTop: v(24, 24, 32),
              ...(m
                ? {flexDirection: 'column', alignItems: 'flex-start', gap: 16}
                : {alignItems: 'center', justifyContent: 'space-between'}),
            }}
          >
            {tabs}
            {summary}
          </div>
        </>
      )}
    </>
  )
}

function Tabs({
  tab,
  live,
  counts,
  onTab,
}: {
  tab: Tab
  live: boolean
  counts: Record<Tab, number>
  onTab(t: Tab): void
}) {
  const defs: {t: Tab; label: string; icon?: 'file-text' | 'folder'}[] = [
    {t: 'all', label: t('projects.year.all')},
    {t: 'articles', label: t('nav.articles'), icon: 'file-text'},
    {t: 'projects', label: t('nav.projects'), icon: 'folder'},
  ]
  return (
    <div
      className="a2-chips"
      style={{gap: 8}}
      role="group"
      aria-label={t('search.type')}
    >
      {defs.map(d =>
        live ? (
          <Chip
            key={d.t}
            label={d.label}
            icon={d.icon}
            count={counts[d.t]}
            active={tab === d.t}
            onClick={() => onTab(d.t)}
          />
        ) : (
          <Chip
            key={d.t}
            label={d.label}
            icon={d.icon}
            count={counts[d.t]}
            active={d.t === 'all'}
          />
        ),
      )}
    </div>
  )
}

function ResultRows({items, q}: {items: SearchResult[]; q: string}) {
  const v = useV()
  const articles = useArticles()
  const projects = useProjects()
  const read = (href: string) =>
    articles.status === 'ready'
      ? articles.data.find(a => a.href === href)?.readingTime
      : undefined
  const stack = (href: string) =>
    projects.status === 'ready'
      ? (projects.data.find(p => p.href === href)?.stack.map(t => t.name) ?? [])
      : []
  return (
    <div className="a2-rows">
      {items.map(r => {
        const mins = r.kind === 'article' ? read(r.href) : undefined
        const tags = r.kind === 'project' ? stack(r.href) : []
        return (
          <Anchor
            key={r.href}
            href={r.href}
            className="a2-arow p2-row"
            style={{alignItems: 'start'}}
          >
            <span
              className="a2-adate"
              style={{
                display: 'flex',
                flexDirection: v('row', 'column', 'column'),
                gap: v(16, 4, 4),
              }}
            >
              <span className="a2-micro" style={{color: 'var(--a2-soft)'}}>
                {r.kind === 'article'
                  ? t('reading.article')
                  : t('reading.project')}
              </span>
              {r.meta && <span className="a2-mono">{r.meta}</span>}
              {mins !== undefined && (
                <span
                  className="a2-mono"
                  style={{display: 'inline-flex', alignItems: 'center', gap: 8}}
                >
                  <Icon name="clock" size={12} />
                  {t('article.minRead', {count: mins})}
                </span>
              )}
            </span>
            <span style={{minWidth: 0}}>
              <h3 className="a2-h4">{highlight(r.title, q)}</h3>
              {r.summary && (
                <p className="a2-small" style={{marginTop: 8, maxWidth: 720}}>
                  {highlight(r.summary, q)}
                </p>
              )}
              {tags.length > 0 && (
                <span className="a2-chips" style={{marginTop: 16}}>
                  {tags.map(t => (
                    <span key={t} className="a2-badge">
                      {t}
                    </span>
                  ))}
                </span>
              )}
            </span>
            <span style={{color: 'var(--a2-text-lo)', paddingTop: 2}}>
              <Icon name="arrow-right" size={18} />
            </span>
          </Anchor>
        )
      })}
    </div>
  )
}

/** No results (or no query yet): the "0 results" state, topic chips and "Recently written". */
function NoResults({q}: {q: string}) {
  const v = useV()
  const terms = useTerms()
  const recent = useArticles({limit: 3})
  const topics = terms.status === 'ready' ? terms.data.slice(0, 5) : []
  const m = v(true, false, false)
  const panel = (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        flexDirection: m ? 'column' : undefined,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flex: 'none',
          display: 'grid',
          placeItems: 'center',
          width: 48,
          height: 48,
          borderRadius: 8,
          border: '2.5px solid var(--a2-blue)',
          color: 'var(--a2-pale)',
          background: 'var(--a2-tint)',
          boxShadow:
            '0 0 24px -4px var(--a2-focus-glow),inset 0 0 12px var(--a2-tint)',
        }}
      >
        <Icon name={q ? 'search-x' : 'search'} size={22} />
      </span>
      <div role="status">
        <h3 className="a2-h3">
          {q ? t('search.none', {q}) : t('search.what')}
        </h3>
        <p className="a2-body" style={{marginTop: 8}}>
          {q ? t('search.none.copy') : t('search.what.copy')}
        </p>
        {topics.length > 0 && (
          <div style={{marginTop: 24}}>
            <div className="a2-chips" style={{gap: 8}}>
              {topics.map(t => (
                <Chip
                  key={t.slug}
                  label={t.name}
                  count={t.count}
                  href={t.href}
                />
              ))}
            </div>
          </div>
        )}
        {q && (
          <p
            className="a2-mono"
            style={{
              marginTop: 24,
              whiteSpace: m ? 'normal' : 'nowrap',
              overflowWrap: 'anywhere',
            }}
          >
            <span className="a2-mint">$</span> grep -ri "{q.toLowerCase()}"
            ~/articles ~/projects
            <span className="a2-lo" style={{marginLeft: 16}}>
              {t('qs.results', {count: 0})}
            </span>
          </p>
        )}
      </div>
    </div>
  )
  return (
    <>
      <StateLayout
        number={
          <StateNumber
            prefix="0"
            digits="0"
            line={t('qs.results', {count: 0})}
          />
        }
      >
        {panel}
      </StateLayout>
      {recent.status === 'ready' && (
        <div style={{marginTop: v(48, 48, 64)}}>
          <StateLayout
            number={<span className="a2-micro">{t('search.recent')}</span>}
          >
            {recent.data.map(a => (
              <Anchor
                key={a.slug}
                href={a.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '24px 0',
                  borderTop: '1px solid var(--a2-line)',
                }}
              >
                <span
                  className="a2-h4"
                  style={{flex: 1, fontSize: 16, lineHeight: '24px'}}
                >
                  {a.title}
                </span>
                <span className="a2-mono">
                  {new Date(a.publishedAt).toLocaleDateString(
                    intlLocale('en-US'),
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    },
                  )}
                </span>
                <span style={{color: 'var(--a2-text-lo)'}}>
                  <Icon name="arrow-right" size={16} />
                </span>
              </Anchor>
            ))}
            <div style={{borderTop: '1px solid var(--a2-line)'}} />
          </StateLayout>
        </div>
      )}
    </>
  )
}
