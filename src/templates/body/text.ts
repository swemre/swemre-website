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

// Plain helpers around blocks: text of rich runs, heading ids, the TOC entries and link kinds.
import type {CSSProperties} from 'react'
import type {Block, Hue, RichText} from '../../contract/blocks.ts'
import {hueVar, rgb} from '../parts/vp.ts'

type HeadingProps = Extract<Block, {type: 'heading'}>['props']

export function isInternal(href: string) {
  return (
    href.startsWith('/') &&
    !href.startsWith('//') &&
    !/\.(xml|pdf|txt)$/.test(href)
  )
}

export function plain(text: RichText) {
  return text.map(r => r.text).join('')
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function headingId(p: HeadingProps) {
  return p.anchor || slugify(plain(p.text))
}

export const badgeHue = (hue: Hue): CSSProperties => ({
  borderColor: rgb(hue, 0.45),
  background: rgb(hue, 0.08),
  color: hueVar(hue),
  boxShadow: `0 0 16px ${rgb(hue, 'calc(0.16 * var(--a2-glow-k))')}`,
})

export interface TocEntry {
  id: string
  label: string
}

/** The H2s of a body, for the numbered "On this page" lists. */
export function headingsOf(blocks: Block[]): TocEntry[] {
  return blocks.flatMap(b =>
    b.type === 'heading' && b.props.level === 2
      ? [{id: headingId(b.props), label: plain(b.props.text)}]
      : [],
  )
}
