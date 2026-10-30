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

// The block renderers, one per block type, in the V4 markup of the article, project and
// single-page boards. `variant` picks the board a block is drawn from where they differ.
import {fmtTimelineDate} from '../parts/format.ts'
import {Fragment, type CSSProperties, type ReactNode} from 'react'
import {Link} from 'react-router-dom'
import type {Block, Hue, RichText} from '../../contract/blocks.ts'
import {useTheme, useViewport} from '../../design/index.tsx'
import {useCopied} from '../parts/clipboard.ts'
import {CopyButton} from '../parts/copy.tsx'
import {hueVar, rgb} from '../parts/vp.ts'
import {Icon, type IconName} from '../../design/index.tsx'
import {Rich} from './rich.tsx'
import {badgeHue, headingId, isInternal} from './text.ts'
import {t} from '../../i18n/index.ts'

export type Variant = 'article' | 'project' | 'single'
type Of<T extends Block['type']> = Extract<Block, {type: T}>['props']

const MONO =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"

/** An href that stays inside the SPA when it is a site path. */
export function SmartLink({
  href,
  className,
  style,
  children,
  ...rest
}: {
  href: string
  className?: string
  style?: CSSProperties
  children: ReactNode
  'aria-label'?: string
}) {
  return isInternal(href) ? (
    <Link to={href} className={className} style={style} {...rest}>
      {children}
    </Link>
  ) : (
    <a
      href={href}
      className={className}
      style={style}
      {...(/^https?:/.test(href)
        ? {target: '_blank', rel: 'noopener noreferrer'}
        : {})}
      {...rest}
    >
      {children}
    </a>
  )
}

/** H2 with its "#" anchor: copies the section URL and updates the hash. */
export function Heading({p}: {p: Of<'heading'>}) {
  const id = headingId(p)
  const [copied, copy] = useCopied()
  const onAnchor = (e: React.MouseEvent) => {
    e.preventDefault()
    const url = `${window.location.href.split('#')[0]}#${id}`
    window.history.replaceState(window.history.state, '', `#${id}`)
    document.getElementById(id)?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
    copy(url)
  }
  const Tag = p.level === 2 ? 'h2' : p.level === 3 ? 'h3' : 'h4'
  return (
    <Tag
      className={p.level === 2 ? 'a2-h3' : 'a2-h4'}
      id={id}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        scrollMarginTop: 112,
      }}
    >
      <Rich text={p.text} />
      <a
        href={`#${id}`}
        className="a2-mono"
        style={{color: copied ? 'var(--a2-soft)' : 'var(--a2-text-faint)'}}
        aria-label={copied ? t('copy.linkCopied') : t('body.sectionLink')}
        onClick={onAnchor}
      >
        #
      </a>
    </Tag>
  )
}

export function BulletList({
  items,
  numbered,
}: {
  items: RichText[]
  numbered?: boolean
}) {
  const Tag = numbered ? 'ol' : 'ul'
  return (
    <Tag style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {items.map((text, i) => (
        <li key={i} style={{display: 'flex', gap: 8}}>
          {numbered ? (
            <span
              className="a2-mono"
              style={{color: 'var(--a2-soft)', minWidth: 18}}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
          ) : (
            <span style={{color: 'var(--a2-soft)', marginTop: 5}}>
              <Icon name="check-circle" size={18} />
            </span>
          )}
          <span>
            <Rich text={text} />
          </span>
        </li>
      ))}
    </Tag>
  )
}

export function Quote({p}: {p: Of<'quote'>}) {
  return (
    <figure
      style={{
        padding: '8px 0 8px 24px',
        borderLeft: '2px solid var(--a2-soft)',
        boxShadow: `-12px 0 24px -16px ${rgb('blue', 'calc(0.6 * var(--a2-glow-k))')}`,
      }}
    >
      <blockquote className="a2-h4" style={{fontSize: 24, lineHeight: '32px'}}>
        “<Rich text={p.text} />”
      </blockquote>
      {p.cite && (
        <figcaption className="a2-mono" style={{marginTop: 8}}>
          — {p.cite}
        </figcaption>
      )}
    </figure>
  )
}

const CALLOUT: Record<
  Of<'callout'>['tone'],
  {cls: string; icon: IconName; color: string}
> = {
  info: {cls: 'a2-banner is-info', icon: 'info', color: 'var(--a2-soft)'},
  tip: {cls: 'a2-banner is-ok', icon: 'check-circle', color: 'var(--a2-mint)'},
  warning: {cls: 'a2-banner is-info', icon: 'warning', color: 'var(--a2-soft)'},
  danger: {cls: 'a2-banner', icon: 'alert', color: 'var(--a2-err-text)'},
}

export function Callout({p}: {p: Of<'callout'>}) {
  const t = CALLOUT[p.tone]
  return (
    <div className={t.cls} role={p.tone === 'danger' ? 'alert' : undefined}>
      <span style={{color: t.color, marginTop: 3}}>
        <Icon name={t.icon} size={16} />
      </span>
      <div>
        {p.title && (
          <h4 className="a2-h4" style={{fontSize: 16, lineHeight: '24px'}}>
            {p.title}
          </h4>
        )}
        <p className="a2-small" style={p.title ? {marginTop: 4} : undefined}>
          <Rich text={p.text} />
        </p>
      </div>
    </div>
  )
}

const dot: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 9,
  background: 'var(--a2-line-3)',
}

/** Code figure (file) and terminal: title bar with dots, title, language badge and Copy. */
export function Code({p, numbered}: {p: Of<'code'>; numbered: boolean}) {
  const lines = p.code.replace(/\n$/, '').split('\n')
  const copyText = lines.map(l => l.replace(/^\$ /, '')).join('\n')
  const title =
    p.variant === 'terminal' ? (p.title ?? 'terminal') : (p.filename ?? p.title)
  return (
    <figure
      className="a2-island a2-codepanel"
      style={{
        borderRadius: 12,
        border: '1px solid var(--a2-island-line)',
        background: 'var(--a2-code-bg)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderBottom: '1px solid var(--a2-line)',
        }}
      >
        <span style={dot} />
        <span style={dot} />
        <span style={dot} />
        {title && (
          <span className="a2-mono" style={{marginLeft: 8, fontSize: 12}}>
            {title}
          </span>
        )}
        {p.language && <span className="a2-badge">{p.language}</span>}
        <CopyButton
          text={copyText}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 28,
            padding: '0 16px',
            borderRadius: 6,
            border: '1px solid var(--a2-line-2)',
            color: 'var(--a2-text)',
            fontFamily: MONO,
            fontSize: 12,
            background: 'transparent',
          }}
        />
      </div>
      <pre
        className="a2-mono"
        style={{
          padding: 16,
          color: 'var(--a2-text)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          margin: 0,
        }}
      >
        <code style={{all: 'unset'}}>
          {lines.map((line, i) => (
            <div key={i} style={{whiteSpace: 'pre'}}>
              {numbered && (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: 32,
                    color: 'var(--a2-text-faint)',
                  }}
                >
                  {i + 1}
                </span>
              )}
              {line.startsWith('$ ') ? (
                <>
                  <b className="p2-cm">$</b> {line.slice(2)}
                </>
              ) : (
                line
              )}
            </div>
          ))}
        </code>
      </pre>
      {p.caption && (
        <figcaption className="a2-cap" style={{padding: '0 16px 16px'}}>
          {p.caption}
        </figcaption>
      )}
    </figure>
  )
}

export function Image({p, hue = 'blue'}: {p: Of<'image'>; hue?: Hue}) {
  const {theme} = useTheme()
  const src = theme === 'dark' && p.darkUrl ? p.darkUrl : p.url
  const img = (
    <img
      src={src}
      alt={p.alt}
      style={{display: 'block', width: '100%', height: 'auto'}}
    />
  )
  return (
    <figure>
      {p.card ? (
        <div
          className="a2-card"
          style={{
            borderColor: rgb(hue, 0.16),
            boxShadow: `var(--a2-shadow-card),0 0 120px -20px ${rgb(hue, 'calc(0.12 * var(--a2-glow-k))')}`,
          }}
        >
          {img}
        </div>
      ) : (
        img
      )}
      {p.caption && (
        <figcaption className="a2-cap" style={{marginTop: 16}}>
          {p.caption}
        </figcaption>
      )}
    </figure>
  )
}

/** Tables: the board table on tablet and up; key/value rows on mobile. */
export function Table({p, variant}: {p: Of<'table'>; variant: Variant}) {
  const vp = useViewport()
  const head = p.header ? p.rows[0] : undefined
  const rows = p.header ? p.rows.slice(1) : p.rows
  const compact = (p as {compact?: [string, string][]}).compact
  const kv: [string, string][] =
    compact ??
    rows.map(r => [
      r[0],
      r.length > 2
        ? `${r.slice(1, -1).join(' · ')} · ${r[r.length - 1]}`
        : (r[1] ?? ''),
    ])
  if (vp === 'm') {
    if (variant === 'single')
      return <FactRows facts={kv.map(([label, value]) => ({label, value}))} />
    return (
      <dl className="a2-kv">
        {kv.map(([k, v], i) => (
          <Fragment key={i}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </Fragment>
        ))}
      </dl>
    )
  }
  const last = (head ?? rows[0] ?? []).length - 1
  const align = (c: number) =>
    variant === 'single' && c === last && c > 0 ? 'right' : 'left'
  const cell = (text: string, c: number) => {
    if (variant === 'single') {
      if (c === 0)
        return (
          <span className="a2-hi" style={{fontWeight: 600}}>
            {text}
          </span>
        )
      if (c === last) return <span className="a2-mono a2-hi">{text}</span>
      return text
    }
    if (c === 0) return <span className="a2-mono a2-hi">{text}</span>
    if (c === 1) return <span className="a2-mono">{text}</span>
    return text
  }
  return (
    <table className="a2-table">
      {head && (
        <thead>
          <tr>
            {head.map((h, c) => (
              <th key={c} style={{textAlign: align(c)}}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((t, c) => (
              <td key={c} style={{textAlign: align(c)}}>
                {cell(t, c)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type Fact = Of<'facts'>['facts'][number]

function FactValue({f}: {f: Fact}) {
  // An email address is drawn as mono text (At a glance "Questions"), still a mailto link.
  if (f.href?.startsWith('mailto:'))
    return (
      <a className="a2-mono a2-hi" href={f.href}>
        {f.value}
      </a>
    )
  const v = f.code ? (
    <span className="a2-mono" style={{color: 'var(--a2-text-hi)'}}>
      {f.value}
    </span>
  ) : (
    f.value
  )
  return f.href ? (
    <SmartLink className="a2-ilink" href={f.href}>
      {v}
    </SmartLink>
  ) : (
    v
  )
}

/** facts layout 'list': the key/value list (project overview, newsletter echo). */
export function FactList({facts}: {facts: Fact[]}) {
  return (
    <dl className="a2-kv">
      {facts.map((f, i) => (
        <Fragment key={i}>
          <dt>{f.label}</dt>
          <dd>
            <FactValue f={f} />
          </dd>
        </Fragment>
      ))}
    </dl>
  )
}

/** facts layout 'rows': the single-page rows (label, line). */
export function FactRows({facts}: {facts: Fact[]}) {
  const vp = useViewport()
  return (
    <div className="a2-rows">
      {facts.map((f, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: vp === 'm' ? '1fr' : '160px minmax(0,1fr)',
            columnGap: 24,
            rowGap: 4,
            padding: '16px 0',
          }}
        >
          <span
            style={{
              fontSize: 14,
              lineHeight: '22px',
              fontWeight: 600,
              color: 'var(--a2-text-hi)',
            }}
          >
            {f.label}
          </span>
          <span className="a2-small" style={{color: 'var(--a2-text)'}}>
            <FactValue f={f} />
            {f.note && ` · ${f.note}`}
          </span>
        </div>
      ))}
    </div>
  )
}

/** facts layout 'strip': "At a glance" (single-page hero). */
export function FactStrip({title, facts}: {title?: string; facts: Fact[]}) {
  const vp = useViewport()
  // Columns per row and the span of each cell, as drawn: 5 in a row (desktop, 4K), 3 + 2 on
  // tablet (6-column grid), 2 + 2 + 1 on mobile.
  const cols = vp === 'm' ? 2 : vp === 't' ? 6 : facts.length
  const layout = facts.map((_, i) => {
    if (vp === 'm') {
      const lone = i === facts.length - 1 && facts.length % 2 === 1
      return {
        span: lone ? 2 : 1,
        first: i % 2 === 0 || lone,
        last: i % 2 === 1 || lone,
        row: Math.floor(i / 2),
      }
    }
    if (vp === 't') {
      const top = i < 3
      return {
        span: top ? 2 : 3,
        first: i === 0 || i === 3,
        last: i === 2 || i === facts.length - 1,
        row: top ? 0 : 1,
      }
    }
    return {span: 1, first: i === 0, last: i === facts.length - 1, row: 0}
  })
  return (
    <div>
      {title && <span className="a2-micro">{title}</span>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`,
          marginTop: 16,
          borderTop: '1px solid var(--a2-line-2)',
          borderBottom: '1px solid var(--a2-line-2)',
        }}
      >
        {facts.map((f, i) => {
          const l = layout[i]
          return (
            <div
              key={i}
              style={{
                gridColumn: `span ${l.span}`,
                padding: `16px ${l.last ? 0 : 24}px 16px ${l.first ? 0 : 24}px`,
                ...(l.first ? {} : {borderLeft: '1px solid var(--a2-line)'}),
                ...(l.row > 0 ? {borderTop: '1px solid var(--a2-line)'} : {}),
              }}
            >
              <span className="a2-micro">{f.label}</span>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  lineHeight: '24px',
                  fontWeight: 600,
                  color: 'var(--a2-text-hi)',
                }}
              >
                {f.code ? (
                  <span className="a2-mono a2-hi">{f.value}</span>
                ) : (
                  <FactValue f={f} />
                )}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** The shell prompt line: emre@swemre:<cwd>$ <command>. */
export function Prompt({
  command,
  cwd = '~',
  style,
}: {
  command: string
  cwd?: string
  style?: CSSProperties
}) {
  return (
    <p className="a2-mono" style={{whiteSpace: 'nowrap', ...style}}>
      <span className="a2-mint">emre@swemre</span>
      <span>:</span>
      <span className="a2-soft">{cwd}</span>
      <span>$ </span>
      <span className="a2-txt">{command}</span>
      <span className="a2-caret" aria-hidden="true" />
    </p>
  )
}

export function StackItems({items}: {items: Of<'stack'>['items']}) {
  const vp = useViewport()
  return (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${vp === 'm' ? 2 : 4},minmax(0,1fr))`,
        columnGap: {m: 16, t: 24, d: 32, '4k': 32}[vp],
        rowGap: vp === 'd' || vp === '4k' ? 48 : 32,
      }}
    >
      {items.map((it, i) => (
        <li key={i} style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <span className="a2-h4">{it.name}</span>
          {it.note && <span className="a2-small">{it.note}</span>}
        </li>
      ))}
    </ul>
  )
}

function linkIcon(label: string, href: string): IconName {
  const l = label.toLowerCase()
  if (/github\.com/.test(href) || l.includes('repo') || l.includes('source'))
    return 'github'
  if (l.includes('guide') || l.includes('docs')) return 'book'
  if (l.includes('api')) return 'code'
  if (l.includes('changelog') || l.includes('release')) return 'file-text'
  return 'external'
}

export function LinkCards({
  p,
  hue,
  wide,
}: {
  p: Of<'links'>
  hue: Hue
  wide?: boolean
}) {
  return (
    <div style={{maxWidth: wide ? 'none' : 400}}>
      {p.title && (
        <span className="a2-micro" style={{display: 'block', marginBottom: 16}}>
          {p.title}
        </span>
      )}
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {p.links.map((l, i) => (
          <SmartLink
            key={i}
            className="a2-linkcard"
            href={l.href}
            style={{borderColor: rgb(hue, 0.2), background: rgb(hue, 0.04)}}
          >
            <span
              className="a2-itile"
              style={{background: rgb(hue, 0.16), color: hueVar(hue)}}
            >
              <Icon name={linkIcon(l.label, l.href)} size={16} />
            </span>
            <span>{l.label}</span>
            {l.value && (
              <span
                className="a2-mono"
                style={{fontSize: 12, color: rgb(hue, 0.85)}}
              >
                {l.value}
              </span>
            )}
            <span
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                color: hueVar(hue),
              }}
            >
              <Icon name="arrow-up-right" size={14} />
            </span>
          </SmartLink>
        ))}
      </div>
    </div>
  )
}

/** Releases (project) as a dotted timeline; version history (single page) as rows. */
export function Timeline({p, variant}: {p: Of<'timeline'>; variant: Variant}) {
  const vp = useViewport()
  if (variant === 'single') {
    return (
      <div className="a2-rows">
        {p.items.map((it, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns:
                vp === 'm'
                  ? '48px minmax(0,1fr) auto'
                  : '48px 112px minmax(0,1fr) auto',
              columnGap: 16,
              rowGap: 4,
              alignItems: 'center',
              padding: '16px 0',
            }}
          >
            <span className="a2-mono a2-soft">{it.version}</span>
            {vp !== 'm' && (
              <span className="a2-mono">{fmtTimelineDate(it.date, true)}</span>
            )}
            <span className="a2-small" style={{color: 'var(--a2-text)'}}>
              {it.title}
            </span>
            {it.current && (
              <span className="a2-badge" style={badgeHue('blue')}>
                current
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }
  const gap = vp === 'd' || vp === '4k' ? 48 : 32
  return (
    <div>
      {p.items.map((it, i) => (
        <div
          key={i}
          className="p2-tl"
          style={{paddingBottom: i === p.items.length - 1 ? 0 : gap}}
        >
          <span className={`dot${it.current ? ' is-current' : ''}`} />
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span
              className="a2-badge"
              style={it.current ? badgeHue('blue') : undefined}
            >
              {it.version}
            </span>
            <span className="a2-mono">{fmtTimelineDate(it.date, false)}</span>
          </div>
          <h3 className="a2-h4" style={{marginTop: 8}}>
            {it.title}
          </h3>
          {it.note && (
            <p className="a2-small" style={{marginTop: 8}}>
              {it.note}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

/** "0x01" -> dim "0x" + bright "01"; "04L" -> bright "04" + dim "L"; "0b011" -> dim "0b" + "011". */
export function SectionNumber({number, hue}: {number: string; hue: Hue}) {
  const m = /^(0[xb])?(\d+)(\D*)$/.exec(number)
  const [pre, digits, post] = m ? [m[1], m[2], m[3]] : ['', number, '']
  return (
    <span className="a2-num" aria-hidden="true">
      {pre && <span className="is-dim">{pre}</span>}
      <span
        style={{
          color: hueVar(hue),
          textShadow: `0 0 40px ${rgb(hue, 'calc(0.22 * var(--a2-glow-text-k))')}`,
        }}
      >
        {digits}
      </span>
      {post && <span className="is-dim">{post}</span>}
    </span>
  )
}
