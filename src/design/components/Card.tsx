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

// Card (V4-Comp-Card): default, flat and hue cards, icon tiles, link cards and the code panel
// island. Table and key/value (V4-Comp-Table). Prompt (V4-Comp-Prompt): the terminal line.
import {Fragment, type CSSProperties, type ReactNode} from 'react'
import {Anchor} from './Link.tsx'
import {Icon, type IconName} from './Icon.tsx'
import {cx, hueCardStyle, hueRgb, type Hue} from './util.ts'

export interface CardProps {
  children: ReactNode
  hue?: Hue
  flat?: boolean
  className?: string
  style?: CSSProperties
  as?: 'div' | 'section' | 'article' | 'aside'
}

export function Card({
  children,
  hue,
  flat,
  className,
  style,
  as: Tag = 'div',
}: CardProps) {
  return (
    <Tag
      className={cx('a2-card', flat && 'is-flat', className)}
      style={{...(hue ? hueCardStyle(hue) : {}), ...style}}
    >
      {children}
    </Tag>
  )
}

/** Icon tile in the section hue at .16: 28 (default) or 40. */
export function IconTile({
  icon,
  hue = 'sky',
  big,
  glow,
}: {
  icon: IconName
  hue?: Hue
  big?: boolean
  /** Receipts: a stronger tint and a glow. */
  glow?: boolean
}) {
  return (
    <span
      className={cx('a2-itile', big && 'is-40')}
      style={{
        background: hueRgb(hue, glow ? 0.14 : 0.16),
        color: `var(--a2-hue-${hue})`,
        ...(glow
          ? {
              boxShadow: `0 0 24px ${hueRgb(hue, 'calc(0.3 * var(--a2-glow-k))')}`,
            }
          : {}),
      }}
    >
      <Icon name={icon} size={big ? 20 : 16} />
    </span>
  )
}

/** Link card: tile, label, mono handle and the arrow (social links). */
export function LinkCard({
  href,
  icon,
  label,
  handle,
  hue = 'sky',
}: {
  href: string
  icon: IconName
  label: ReactNode
  handle?: string
  hue?: Hue
}) {
  return (
    <Anchor
      className="a2-linkcard"
      href={href}
      style={{borderColor: hueRgb(hue, 0.2), background: hueRgb(hue, 0.04)}}
    >
      <IconTile icon={icon} hue={hue} />
      <span>{label}</span>
      {handle && (
        <span
          className="a2-mono"
          style={{fontSize: 12, color: hueRgb(hue, 0.85)}}
        >
          {handle}
        </span>
      )}
      <span
        style={{
          marginLeft: 'auto',
          display: 'inline-flex',
          color: `var(--a2-hue-${hue})`,
        }}
      >
        <Icon name="arrow-up-right" size={14} />
      </span>
    </Anchor>
  )
}

/** Code panel island: optional title bar with three dots, mono lines. */
export function CodePanel({
  title,
  lines,
}: {
  title?: string
  lines: ReactNode[]
}) {
  const dot: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: 9,
    background: 'var(--a2-line-3)',
  }
  return (
    <div
      className="a2-island a2-codepanel"
      style={{
        borderRadius: 12,
        border: '1px solid var(--a2-island-line)',
        background: 'var(--a2-code-bg)',
        overflow: 'hidden',
      }}
    >
      {title && (
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
          <span className="a2-mono" style={{marginLeft: 8, fontSize: 12}}>
            {title}
          </span>
        </div>
      )}
      <div
        className="a2-mono"
        style={{padding: 16, color: 'var(--a2-text)', overflow: 'hidden'}}
      >
        {lines.map((l, i) => (
          <div key={i} style={{whiteSpace: 'pre'}}>
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

export interface PromptProps {
  /** The command after "$ ". */
  command: ReactNode
  path?: string
  caret?: boolean
  /** Let long commands wrap (mobile receipts). */
  wrap?: boolean
  style?: CSSProperties
}

/** emre@swemre:~$ command */
export function Prompt({command, path = '~', caret, wrap, style}: PromptProps) {
  return (
    <p
      className="a2-mono"
      style={{
        whiteSpace: 'nowrap',
        ...(wrap ? {whiteSpace: 'normal', overflowWrap: 'anywhere'} : {}),
        ...style,
      }}
    >
      <span className="a2-mint">emre@swemre</span>
      <span>:</span>
      <span className="a2-soft">{path}</span>
      <span>$ </span>
      <span className="a2-txt">{command}</span>
      {caret && <span className="a2-caret" aria-hidden="true" />}
    </p>
  )
}

export interface TableProps {
  columns: {label: string; align?: 'left' | 'right'}[]
  rows: ReactNode[][]
  caption?: string
}

export function Table({columns, rows, caption}: TableProps) {
  return (
    <table className="a2-table">
      {caption && <caption className="a2-sr">{caption}</caption>}
      <thead>
        <tr>
          {columns.map(c => (
            <th key={c.label} style={{textAlign: c.align ?? 'left'}}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) => (
              <td key={j} style={{textAlign: columns[j]?.align ?? 'left'}}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Key / value list (a2-kv). */
export function KeyValue({
  items,
  style,
}: {
  items: [ReactNode, ReactNode][]
  style?: CSSProperties
}) {
  return (
    <dl className="a2-kv" style={style}>
      {items.map(([k, v], i) => (
        <Fragment key={i}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </Fragment>
      ))}
    </dl>
  )
}
