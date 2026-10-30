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

// SectionHeader (V4-Comp-SectionHeader): playful number, // eyebrow, h2, copy and a link, 32
// between blocks (24 compact: mobile and tablet).
import type {ReactNode} from 'react'
import {useCompact} from '../context.ts'
import {TextLink} from './Text.tsx'
import {hueRgb, type Hue} from './util.ts'

export interface SectionHeaderProps {
  title: ReactNode
  eyebrow: string
  copy?: ReactNode
  /** [digits, dim prefix, dim suffix, hue]: ['01', '0x'] draws 0x01, ['04', '', 'L', 'lilac'] 04L. */
  number?: [string, string?, string?, Hue?]
  /** [label, href] */
  link?: [string, string?]
  /** Defaults to the viewport (24 on mobile and tablet, 32 above). */
  compact?: boolean
  /** Anything under the header (a badge, a button). */
  extra?: ReactNode
  /** Heading id, for aria-labelledby on the section. */
  id?: string
}

export function SectionNumber({
  number,
}: {
  number: [string, string?, string?, Hue?]
}) {
  const [digits, prefix, suffix, hue = 'blue'] = number
  return (
    <span className="a2-num" aria-hidden="true">
      {prefix && <span className="is-dim">{prefix}</span>}
      <span
        style={{
          color: `var(--a2-hue-${hue})`,
          textShadow: `0 0 40px ${hueRgb(hue, 'calc(0.22 * var(--a2-glow-text-k))')}`,
        }}
      >
        {digits}
      </span>
      {suffix && <span className="is-dim">{suffix}</span>}
    </span>
  )
}

export function Eyebrow({
  children,
  style,
}: {
  children: ReactNode
  style?: React.CSSProperties
}) {
  return (
    <span className="a2-eyebrow" style={style}>
      {'// '}
      {children}
    </span>
  )
}

export function SectionHeader({
  title,
  eyebrow,
  copy,
  number,
  link,
  compact,
  extra,
  id,
}: SectionHeaderProps) {
  const cmp = useCompact()
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: (compact ?? cmp) ? 24 : 32,
      }}
    >
      {number && (
        <div>
          <SectionNumber number={number} />
        </div>
      )}
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="a2-h2" style={{marginTop: 16}} id={id}>
          {title}
        </h2>
      </div>
      {copy && <p className="a2-body">{copy}</p>}
      {link && (
        <div>
          <TextLink label={link[0]} href={link[1] ?? '#'} />
        </div>
      )}
      {extra && <div>{extra}</div>}
    </div>
  )
}
