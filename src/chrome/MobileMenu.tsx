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

// MobileMenu = the command palette on mobile and tablet (V4-Comp-MobileMenu, -CommandPalette):
// ~/menu main, the ❯ prompt (Enter searches), the git-graph tree with HEAD on the current section
// and one expanded branch, and the $ actions (Subscribe, call back, language, theme). Mobile is
// full width inset 16; tablet a 448 panel right 48, top 80. Focus trap, scroll lock, Esc.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {Anchor, Icon, useTheme, useViewport} from '../design/index.tsx'
import {useArticles, useNav, useProjects} from '../data/hooks.ts'
import {sectionOf, useChrome, type Section} from './context.ts'
import {useFocusTrap, useScrollLock} from './hooks.ts'

type Branch = 'articles' | 'projects' | 'none'
interface Row {
  label: string
  href?: string
  path?: string
  count?: string | number
  child?: boolean
  branch?: Branch
  section?: Section
}

const mono: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  lineHeight: '16px',
  color: 'var(--a2-text-path)',
}

/** The git graph beside the tree: main line, the dashed branch with its dots, HEAD halo. */
function Graph({rows, head}: {rows: Row[]; head: number}) {
  const y = (i: number) => 22 + 52 * i
  const mains = rows.map((r, i) => (r.child ? -1 : i)).filter(i => i >= 0)
  const kids = rows.map((r, i) => (r.child ? i : -1)).filter(i => i >= 0)
  const h = rows.length * 52
  const soft = {fill: 'var(--a2-soft)'}
  return (
    <svg
      aria-hidden="true"
      width="56"
      height={h}
      viewBox={`0 0 56 ${h}`}
      style={{
        position: 'absolute',
        left: 4,
        top: 0,
        zIndex: 1,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <path
        d={`M20 22 V ${y(mains[mains.length - 1])}`}
        strokeWidth="1.5"
        style={{stroke: 'var(--a2-soft)', strokeOpacity: 0.5}}
      />
      {kids.length > 0 && (
        <path
          d={(() => {
            const p = y(kids[0] - 1)
            const last = y(kids[kids.length - 1])
            return `M20 ${p + 12} C 20 ${p + 32}, 40 ${p + 34}, 40 ${p + 52} V ${last} C 40 ${last + 18}, 20 ${last + 20}, 20 ${last + 40}`
          })()}
          strokeWidth="1.5"
          strokeDasharray="2 4"
          fill="none"
          style={{stroke: 'var(--a2-soft)', strokeOpacity: 0.55}}
        />
      )}
      {rows.map((r, i) =>
        r.child ? (
          <circle key={i} cx="40" cy={y(i)} r="2.5" style={soft} />
        ) : i === head ? (
          <g key={i}>
            <circle cx="20" cy={y(i)} r="9" opacity=".18" style={soft} />
            <circle
              cx="20"
              cy={y(i)}
              r="5"
              strokeWidth="1.6"
              style={{fill: 'var(--a2-soft)', stroke: 'var(--a2-soft)'}}
            />
          </g>
        ) : (
          <circle
            key={i}
            cx="20"
            cy={y(i)}
            r="5"
            strokeWidth="1.6"
            style={{fill: 'var(--a2-ground)', stroke: 'var(--a2-soft)'}}
          />
        ),
      )}
    </svg>
  )
}

function countOf<T>(l: {status: string; data?: T[]}): number | string {
  return l.status === 'ready' && l.data ? l.data.length : ''
}

export function MobileMenu() {
  const chrome = useChrome()
  const vp = useViewport()
  const {theme, toggle} = useTheme()
  const nav = useNav()
  const articles = useArticles()
  const projects = useProjects()
  const navigate = useNavigate()
  const current = sectionOf(useLocation().pathname)
  const [open, setOpen] = useState<Branch>(
    current === 'projects' ? 'projects' : 'articles',
  )
  const [q, setQ] = useState('')
  const panel = useRef<HTMLDivElement>(null)
  const close = useCallback(() => chrome.closeMenu(), [chrome])
  useFocusTrap(panel, true, close)
  useScrollLock(true)
  // Move focus into the palette (not the input: that would open the phone keyboard).
  useEffect(() => panel.current?.focus({preventScroll: true}), [])

  const mega = nav.mega
  const topics =
    mega.articles.status === 'ready'
      ? mega.articles.data.topics.slice(0, 3)
      : []
  const featured =
    mega.projects.status === 'ready'
      ? mega.projects.data.featured.slice(0, 3)
      : []
  const rows: Row[] = [{label: 'Home', href: '/', path: '~/', section: 'home'}]
  rows.push({
    label: 'Articles',
    path: '~/articles',
    branch: 'articles',
    section: 'articles',
  })
  if (open === 'articles') {
    rows.push({
      label: 'All articles',
      href: '/articles',
      count: countOf(articles as never),
      child: true,
    })
    topics.forEach(t =>
      rows.push({label: t.name, href: t.href, count: t.count, child: true}),
    )
  }
  rows.push({
    label: 'Projects',
    path: '~/projects',
    branch: 'projects',
    section: 'projects',
  })
  if (open === 'projects') {
    rows.push({
      label: 'All projects',
      href: '/projects',
      count: countOf(projects as never),
      child: true,
    })
    featured.forEach(p =>
      rows.push({label: p.title, href: p.href, count: '', child: true}),
    )
  }
  const head = rows.findIndex(r => !r.child && r.section === current)

  const rowStyle = (r: Row, active: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 44,
    padding: r.child ? '0 16px 0 64px' : '0 16px 0 48px',
    borderRadius: 6,
    textAlign: 'left',
    ...(active
      ? {
          background: 'var(--a2-tree-bg)',
          boxShadow: 'inset 0 0 0 1px var(--a2-tree-inset)',
        }
      : {}),
  })
  const tile: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 48,
    padding: '0 16px',
    borderRadius: 6,
    background: 'var(--a2-tile-bg)',
    border: '1px solid var(--a2-tile-line)',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--a2-text-hi)',
  }
  const pos: CSSProperties =
    vp === 'm'
      ? {left: 16, right: 16, top: 80}
      : {right: 48, width: 448, top: 80}
  return (
    <>
      <div
        className="a2-scrim"
        aria-hidden="true"
        onClick={close}
        style={{zIndex: 45, top: 64}}
      />
      <div
        ref={panel}
        tabIndex={-1}
        id="a2-menu"
        className="a2-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        style={{
          ...pos,
          zIndex: 55,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 16,
          borderRadius: 12,
          background: 'var(--a2-panel-grad)',
          border: '1px solid var(--a2-panel-line)',
          boxShadow:
            'var(--a2-shadow-panel),0 0 48px -12px var(--a2-panel-glow)',
        }}
      >
        <div
          style={{
            ...mono,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            <span className="a2-soft">~</span>/menu
          </span>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
            <Icon name="git-branch" size={14} />
            main
          </span>
        </div>
        <form
          role="search"
          onSubmit={e => {
            e.preventDefault()
            if (q.trim())
              void navigate(`/search?q=${encodeURIComponent(q.trim())}`)
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 48,
              padding: '0 16px',
              borderRadius: 6,
              background: 'var(--a2-tile-bg)',
              border: '1px solid var(--a2-tile-line-2)',
              cursor: 'text',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--a2-hue-peri)',
              }}
            >
              ❯
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 0,
              }}
            >
              {!q && <Caret />}
              <input
                className="a2-pal-in"
                type="search"
                role="searchbox"
                aria-label="Search or go to a page"
                placeholder="search or go to…"
                value={q}
                onChange={e => setQ(e.target.value)}
                autoComplete="off"
                enterKeyHint="search"
              />
              {q && <Caret />}
            </span>
          </label>
        </form>
        <nav aria-label="Main">
          <ul
            className="a2-tree"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Graph rows={rows} head={head} />
            {rows.map((r, i) => {
              const active = i === head
              const inner = r.child ? (
                <>
                  <span
                    style={{
                      fontSize: 17,
                      lineHeight: '24px',
                      fontWeight: 500,
                      color: 'var(--a2-text)',
                    }}
                  >
                    {r.label}
                  </span>
                  <span style={{...mono, marginLeft: 'auto'}}>{r.count}</span>
                </>
              ) : (
                <>
                  <span
                    style={{
                      fontSize: 18,
                      lineHeight: '24px',
                      fontWeight: 500,
                      color: 'var(--a2-text-hi)',
                    }}
                  >
                    {r.label}
                  </span>
                  <span style={mono}>{r.path}</span>
                  <span style={{marginLeft: 'auto', display: 'inline-flex'}}>
                    {active ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          height: 22,
                          padding: '0 8px',
                          borderRadius: 4,
                          background: 'var(--a2-head-bg)',
                          border: '1px solid var(--a2-head-line)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          lineHeight: '12px',
                          color: 'var(--a2-soft)',
                        }}
                      >
                        HEAD
                      </span>
                    ) : (
                      r.branch && (
                        <Icon
                          name={
                            open === r.branch ? 'chevron-down' : 'chevron-right'
                          }
                          size={18}
                        />
                      )
                    )}
                  </span>
                </>
              )
              return (
                <li key={`${r.label}-${i}`}>
                  {r.branch ? (
                    <button
                      type="button"
                      style={rowStyle(r, active)}
                      aria-expanded={open === r.branch}
                      aria-current={active ? 'page' : undefined}
                      onClick={() =>
                        setOpen(o =>
                          o === r.branch ? 'none' : (r.branch ?? 'none'),
                        )
                      }
                    >
                      {inner}
                    </button>
                  ) : (
                    <Anchor
                      href={r.href ?? '/'}
                      style={rowStyle(r, active)}
                      aria-current={active ? 'page' : undefined}
                    >
                      {inner}
                    </Anchor>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <span style={{...mono, fontWeight: 500}}>
            <span className="a2-soft">$</span> actions
          </span>
          <Anchor
            href="/newsletter"
            className="a2-btn is-primary is-block"
            style={{justifyContent: 'flex-start'}}
          >
            <Icon name="mail" />
            <span>Subscribe</span>
            <span style={{marginLeft: 'auto', display: 'grid'}}>
              <Icon name="arrow-right" />
            </span>
          </Anchor>
          <Anchor
            href="/call-back"
            className="a2-btn is-secondary is-block"
            style={{justifyContent: 'flex-start'}}
          >
            <Icon name="phone" />
            <span>Request a call back</span>
            <span style={{marginLeft: 'auto', display: 'grid'}}>
              <Icon name="arrow-right" />
            </span>
          </Anchor>
          <div
            style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}
          >
            <button type="button" style={tile} aria-label="Language: English">
              <Icon name="globe" />
              Language
              <span
                style={{...mono, marginLeft: 'auto', lineHeight: 'inherit'}}
              >
                EN
              </span>
            </button>
            <button
              type="button"
              style={tile}
              aria-pressed={theme === 'light'}
              aria-label={
                theme === 'light'
                  ? 'Theme light, switch to dark'
                  : 'Theme dark, switch to light'
              }
              onClick={toggle}
            >
              <Icon name={theme === 'light' ? 'sun' : 'moon'} />
              Theme
              <span
                style={{...mono, marginLeft: 'auto', lineHeight: 'inherit'}}
              >
                {theme}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Caret() {
  return (
    <span
      className="a2-blink"
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 9,
        height: 20,
        background: 'var(--a2-soft)',
        flex: 'none',
      }}
    />
  )
}
