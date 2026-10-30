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

// Small helpers shared by the components: hue colours, dates, class names.
import type {CSSProperties} from 'react'
import type {Hue, ProjectSummary} from '../../contract/view.ts'
import type {Viewport} from '../context.ts'

export type {Hue}
export const HUES: Hue[] = ['blue', 'sky', 'lilac', 'peri', 'aqua']

/** rgb(var(--a2-hue-<h>-rgb) / a): the hue tints used across the boards. */
export function hueRgb(hue: Hue, alpha: number | string): string {
  return `rgb(var(--a2-hue-${hue}-rgb) / ${alpha})`
}
export function hueVar(hue: Hue): string {
  return `var(--a2-hue-${hue})`
}
/** The cover hue cycle of the boards (blue, sky, lilac, peri, aqua) by list position. */
export function hueAt(index: number): Hue {
  return HUES[((index % HUES.length) + HUES.length) % HUES.length]
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

const DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'Europe/Amsterdam',
})
/** "Oct 23, 2026" (Europe/Amsterdam). */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : DATE.format(d)
}
export function isExternal(href: string): boolean {
  return (
    /^(https?:)?\/\//.test(href) ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  )
}

/** Hue or tone badge colours (V4-Comp-Badge). */
export function badgeStyle(
  hue?: Hue,
  tone?: 'ok' | 'err',
): CSSProperties | undefined {
  if (hue)
    return {
      borderColor: hueRgb(hue, 0.45),
      background: hueRgb(hue, 0.08),
      color: `var(--a2-hue-${hue})`,
      boxShadow: `0 0 16px ${hueRgb(hue, 'calc(0.16 * var(--a2-glow-k))')}`,
    }
  if (tone === 'ok')
    return {
      borderColor: 'rgb(var(--a2-mint-rgb) / .4)',
      background: 'rgb(var(--a2-mint-rgb) / .08)',
      color: 'var(--a2-mint)',
    }
  if (tone === 'err')
    return {
      borderColor: 'rgb(var(--a2-err-rgb) / .4)',
      background: 'rgb(var(--a2-err-rgb) / .08)',
      color: 'var(--a2-err-text)',
    }
  return undefined
}

export function hueCardStyle(hue: Hue): CSSProperties {
  return {
    borderColor: hueRgb(hue, 0.16),
    boxShadow: `var(--a2-shadow-card),0 0 120px -20px ${hueRgb(hue, 'calc(0.12 * var(--a2-glow-k))')}`,
  }
}

/** Rail x per viewport (the line's left edge). */
export const RAIL_X: Record<Viewport, number> = {m: 8, t: 16, d: 48, '4k': 55}

export interface RailNode {
  top?: number
  bottom?: number
  hue?: Hue
  /** The current node: filled, with the outer ring and a stronger glow. */
  current?: boolean
}

export function railNodeStyle(
  x: number,
  n: RailNode,
  fallback: Hue,
): CSSProperties {
  const hue = n.hue ?? fallback
  return {
    left: x - 5.25,
    ...(n.top !== undefined ? {top: n.top} : {bottom: n.bottom}),
    ...(n.current
      ? {
          background: `var(--a2-hue-${hue})`,
          boxShadow: `0 0 0 2px var(--a2-hue-${hue}),0 0 0 6px ${hueRgb(hue, 'calc(0.14 * var(--a2-node-glow-k))')},0 0 26px ${hueRgb(hue, 'calc(0.55 * var(--a2-node-glow-k))')}`,
        }
      : {
          boxShadow: `0 0 0 2px var(--a2-hue-${hue}),0 0 14px ${hueRgb(hue, 'calc(0.4 * var(--a2-node-glow-k))')}`,
        }),
  }
}

const GLYPHS: Record<string, string> = {
  java: '{ }',
  kotlin: '{ }',
  ts: '</>',
  tsx: '</>',
  typescript: '</>',
  jsx: '</>',
  js: '</>',
  css: '--var',
  sql: 'SQL',
  yaml: '---',
  bash: '$_',
  shell: '$_',
}
export function glyphFor(cover?: {
  glyph?: string
  language?: string
  filename?: string
}): string {
  if (cover?.glyph) return cover.glyph
  const lang = (
    cover?.language ??
    cover?.filename?.split('.').pop() ??
    ''
  ).toLowerCase()
  return GLYPHS[lang] ?? '{ }'
}

type ProjectExtras = {hue?: Hue; glyph?: string}

export function projectHue(p: ProjectSummary, index = 0): Hue {
  return (p as ProjectSummary & ProjectExtras).hue ?? hueAt(index)
}
/** The list tile text: the content's glyph, else the capitals of the title. */
export function projectGlyph(p: ProjectSummary): string {
  const g = (p as ProjectSummary & ProjectExtras).glyph
  if (g) return g
  const caps = p.title.replace(/[^A-Z]/g, '')
  return (caps || p.title.charAt(0).toUpperCase()).slice(0, 2)
}

/** "2h ago", "2 days ago", "3 weeks ago", else the date. */
export function relativeTime(iso: string, now = Date.now()): string {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000)
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  const d = Math.round(s / 86400)
  if (d < 14) return d === 1 ? '1 day ago' : `${d} days ago`
  if (d < 60) return `${Math.round(d / 7)} weeks ago`
  return `${Math.round(d / 30)} months ago`
}

/** The cover hue of an article: the content's, else the board cycle by list position. */
/** The article's own hue (contract), else its cover's, else the list-index cycle. */
export function articleHue(
  a: {hue?: Hue; codeCover?: {hue?: Hue}},
  index: number,
): Hue {
  return a.hue ?? a.codeCover?.hue ?? hueAt(index)
}
