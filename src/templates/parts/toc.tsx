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

// "On this page": the article aside (TOC, reading bar, share), its tablet button, and the
// single-page lists (sticky on desktop, a disclosure on tablet), all with the active heading.
import './parts.css'
import {useId, useState, type CSSProperties} from 'react'
import type {TocEntry} from '../body/index.ts'
import {useCopied} from './clipboard.ts'
import {LiveNote} from './copy.tsx'
import {Icon, type IconName} from '../../design/index.tsx'
import {scrollToId} from './scroll.ts'

const num = (i: number) => String(i + 1).padStart(2, '0')

function go(e: React.MouseEvent, id: string) {
  e.preventDefault()
  scrollToId(id)
}

/** The article TOC (.p2-toc): numbered, the current heading marked. */
export function ArticleTocList({
  entries,
  active,
  id,
}: {
  entries: TocEntry[]
  active: number
  id?: string
}) {
  return (
    <nav
      className="p2-toc"
      aria-label="On this page"
      id={id}
      style={{marginTop: 16}}
    >
      {entries.map((e, i) => (
        <a
          key={e.id}
          href={`#${e.id}`}
          className={i === active ? 'is-current' : ''}
          aria-current={i === active ? 'location' : undefined}
          onClick={ev => go(ev, i === 0 ? '' : e.id)}
        >
          <span>{num(i)}</span>
          {e.label}
        </a>
      ))}
    </nav>
  )
}

/** Tablet: the "On this page" button that opens the TOC. */
export function ArticleTocButton({
  entries,
  active,
}: {
  entries: TocEntry[]
  active: number
}) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const cur = entries[active]
  return (
    <div style={{marginBottom: 48}}>
      <button
        type="button"
        className="p2-otp"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(o => !o)}
      >
        <span className="a2-micro">On this page</span>
        <span
          className="a2-small a2-hi"
          style={{
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {cur && `${num(active)} ${cur.label}`}
        </span>
        <span className="a2-mono">{entries.length} sections</span>
        <Icon
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          style={{color: 'var(--a2-text-lo)'}}
        />
      </button>
      {open && <ArticleTocList entries={entries} active={active} id={listId} />}
    </div>
  )
}

const shareBox: CSSProperties = {
  display: 'inline-grid',
  placeItems: 'center',
  width: 32,
  height: 32,
  borderRadius: 6,
  border: '1px solid var(--a2-line-2)',
  color: 'var(--a2-text-mid)',
  background: 'transparent',
  padding: 0,
}

/** Share: Copy link, LinkedIn, Email, RSS. */
export function ShareLinks({title}: {title: string}) {
  const [copied, copy] = useCopied()
  const url = () => window.location.href.split('#')[0]
  const ext = (
    label: string,
    icon: IconName,
    href: () => string,
    newTab = true,
  ) => (
    <a
      href="#"
      aria-label={label}
      style={shareBox}
      onClick={e => {
        e.preventDefault()
        if (newTab) window.open(href(), '_blank', 'noopener,noreferrer')
        else window.location.href = href()
      }}
    >
      <Icon name={icon} size={16} />
    </a>
  )
  return (
    <div style={{display: 'flex', gap: 8, marginTop: 16}}>
      <button
        type="button"
        aria-label={copied ? 'Link copied' : 'Copy link'}
        style={{...shareBox, color: copied ? 'var(--a2-soft)' : shareBox.color}}
        onClick={() => copy(url())}
      >
        <Icon name={copied ? 'check' : 'copy'} size={16} />
      </button>
      {ext(
        'LinkedIn',
        'linkedin',
        () =>
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`,
      )}
      {ext(
        'Email',
        'mail',
        () =>
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url())}`,
        false,
      )}
      <a href="/rss.xml" aria-label="RSS" style={shareBox}>
        <Icon name="rss" size={16} />
      </a>
      <LiveNote text={copied ? 'Link copied' : ''} />
    </div>
  )
}

/** Desktop and 4K: the sticky article aside. */
export function ArticleAside({
  entries,
  active,
  progress,
  minutes,
  title,
}: {
  entries: TocEntry[]
  active: number
  progress: number
  minutes: number
  title: string
}) {
  const pct = Math.round(progress * 100)
  const left = Math.max(0, Math.ceil(minutes * (1 - progress)))
  return (
    <div style={{position: 'sticky', top: 96}}>
      <span className="a2-micro">On this page</span>
      <ArticleTocList entries={entries} active={active} />
      <div className="a2-hr" style={{margin: '32px 0'}} />
      <span className="a2-micro">Reading</span>
      <div
        className="p2-bar"
        style={{marginTop: 16}}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div style={{width: `${pct}%`}} />
      </div>
      <div
        style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}
      >
        <span className="a2-mono">{pct}%</span>
        <span className="a2-mono">{left} min left</span>
      </div>
      <div className="a2-hr" style={{margin: '32px 0'}} />
      <span className="a2-micro">Share</span>
      <ShareLinks title={title} />
    </div>
  )
}

/** The single-page list: numbered rows, the current one filled, then Back to top. */
export function PageTocNav({
  entries,
  active,
}: {
  entries: TocEntry[]
  active: number
}) {
  return (
    <nav aria-label="On this page">
      <span className="a2-micro">On this page</span>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          marginTop: 16,
        }}
      >
        {entries.map((e, i) => {
          const cur = i === active
          return (
            <a
              key={e.id}
              href={`#${e.id}`}
              className="a2-small"
              aria-current={cur ? 'location' : undefined}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                height: 36,
                padding: '0 16px',
                borderRadius: 6,
                ...(cur
                  ? {
                      background: 'var(--a2-tab-active)',
                      color: 'var(--a2-text-hi)',
                      boxShadow: 'inset 2px 0 0 var(--a2-soft)',
                    }
                  : {color: 'var(--a2-text-mid)'}),
              }}
              onClick={ev => go(ev, i === 0 ? '' : e.id)}
            >
              <span className="a2-mono" style={{fontSize: 12}}>
                {num(i)}
              </span>
              {e.label}
            </a>
          )
        })}
      </div>
      <div style={{marginTop: 24, paddingLeft: 16}}>
        <a className="a2-link" href="#top" onClick={ev => go(ev, '')}>
          Back to top
          <Icon name="chevron-up" size={14} />
        </a>
      </div>
    </nav>
  )
}

/** Tablet single page: the list inside a disclosure. */
export function PageTocDisclosure({
  entries,
  active,
}: {
  entries: TocEntry[]
  active: number
}) {
  return (
    <div style={{marginBottom: 48}}>
      <details
        className="p2-disc"
        style={{border: '1px solid var(--a2-line-3)', borderRadius: 8}}
      >
        <summary
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 48,
            padding: '0 16px',
            cursor: 'pointer',
            listStyle: 'none',
          }}
        >
          <span className="a2-micro">On this page</span>
          <span className="a2-mono" style={{marginLeft: 'auto'}}>
            {entries.length} sections
          </span>
          <Icon
            name="chevron-down"
            size={16}
            style={{color: 'var(--a2-text-lo)'}}
          />
        </summary>
        <div style={{padding: '0 16px 16px'}}>
          <PageTocNav entries={entries} active={active} />
        </div>
      </details>
    </div>
  )
}
