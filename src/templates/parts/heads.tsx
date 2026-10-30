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

// Headers shared by the detail pages: the path line, the hero meta strip and the section head
// (eyebrow + H2 + action) of "keep reading", "faq", "back to reading" and friends.
import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {Icon, useViewport} from '../../design/index.tsx'

/** `// ~/articles/backend/<b>spring-boot-template.md</b>`: the first segment links to its list. */
export function PathLine({
  root,
  href,
  middle = '',
  leaf,
}: {
  root: string
  href: string
  middle?: string
  leaf: string
}) {
  return (
    <span className="a2-eyebrow" style={{marginBottom: 16}}>
      {'// ~/'}
      <Link className="a2-ulink" to={href}>
        {root}
      </Link>
      /{middle}
      <span className="a2-txt">{leaf}</span>
    </span>
  )
}

/** The hero meta strip (.p2-strip): Author, Published, Reading time, Stack, Updated... */
export function MetaStrip({
  items,
}: {
  items: {label: string; value: ReactNode}[]
}) {
  return (
    <div
      className="p2-strip"
      style={{
        gridTemplateColumns: `repeat(${items.length},auto)`,
        justifyContent: 'start',
      }}
    >
      {items.map(it => (
        <div key={it.label}>
          <span className="a2-micro">{it.label}</span>
          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: '22px',
              color: 'var(--a2-text-hi)',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              minHeight: 24,
            }}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  )
}

/** "All articles ->" style text link. */
export function ArrowLink({
  to,
  children,
  style,
}: {
  to: string
  children: ReactNode
  style?: React.CSSProperties
}) {
  return (
    <Link className="a2-link" to={to} style={style}>
      {children}
      <Icon name="arrow-right" size={14} />
    </Link>
  )
}

/**
 * Eyebrow + H2 with an optional action: side by side on tablet and up (the action bottom
 * aligned), stacked with the action below on mobile.
 */
export function SectionHead({
  eyebrow,
  title,
  action,
  gap = 32,
  above,
  margin = true,
}: {
  eyebrow: string
  title: ReactNode
  action?: ReactNode
  gap?: number
  /** Drawn above the eyebrow (a section number). */
  above?: ReactNode
  /** Bottom margin (64 on desktop, 48 below). */
  margin?: boolean
}) {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const mb = margin ? (big ? 64 : 48) : 0
  const head = (
    <>
      {above}
      <span className="a2-eyebrow">{`// ${eyebrow}`}</span>
      <h2 className="a2-h2" style={{marginTop: 16}}>
        {title}
      </h2>
    </>
  )
  if (vp === 'm') {
    return (
      <div style={{marginBottom: mb}}>
        {head}
        {action && <div style={{marginTop: 24}}>{action}</div>}
      </div>
    )
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap,
        marginBottom: mb,
      }}
    >
      <div>{head}</div>
      {action}
    </div>
  )
}
