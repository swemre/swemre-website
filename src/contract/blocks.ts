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

// Body blocks inside ApiBody.blocks. The shapes follow swemre-blocks (block version 2) plus the
// V4 additions planned there (section, facts, stack, links, timeline, faq; code and image extras).
// The brand components defined in SWEPress (Settings → Components, `swemre/<type>`) arrive as
// blocks of their own type: architecture, subpages, repos, coverage, steps, cta and prefill.
// Owner: agent C. Renderers live in src/templates/body (agent D).

export interface InlineText {
  text: string
  bold?: boolean
  italic?: boolean
  code?: boolean
  href?: string
}
export type RichText = InlineText[]

export type Hue = 'sky' | 'blue' | 'peri' | 'lilac' | 'mist' | 'aqua'

interface BlockBase<T extends string, P> {
  id: string
  type: T
  v: 2
  props: P
}

export type Block =
  | BlockBase<'paragraph', {text: RichText}>
  | BlockBase<'heading', {level: 2 | 3 | 4; text: RichText; anchor?: string}>
  | BlockBase<'bulleted', {text: RichText}>
  | BlockBase<'numbered', {text: RichText}>
  | BlockBase<'quote', {text: RichText; cite?: string}>
  | BlockBase<
      'callout',
      {
        tone: 'info' | 'tip' | 'warning' | 'danger'
        title?: string
        text: RichText
      }
    >
  | BlockBase<
      'code',
      {
        language: string
        code: string
        variant?: 'file' | 'terminal'
        title?: string
        filename?: string
        caption?: string
        href?: string
      }
    >
  | BlockBase<
      'image',
      {
        url: string
        darkUrl?: string
        alt: string
        caption?: string
        card?: boolean
      }
    >
  | BlockBase<'divider', Record<string, never>>
  | BlockBase<
      'table',
      {
        header: boolean
        rows: string[][]
        /** Shortened key / value rows for the mobile rendering, one per body row. */
        compact?: [string, string][]
      }
    >
  | BlockBase<
      'section',
      {number: string; eyebrow: string; title: string; hue?: Hue; copy?: string}
    >
  | BlockBase<
      'facts',
      {
        layout: 'list' | 'strip' | 'rows'
        title?: string
        facts: {
          label: string
          value: string
          href?: string
          code?: boolean
          note?: string
        }[]
      }
    >
  | BlockBase<
      'stack',
      {prompt?: string; items: {name: string; note?: string; icon?: string}[]}
    >
  | BlockBase<
      'links',
      {title?: string; links: {label: string; value?: string; href: string}[]}
    >
  | BlockBase<
      'timeline',
      {
        items: {
          version: string
          date: string
          title: string
          note?: string
          current?: boolean
        }[]
      }
    >
  | BlockBase<'faq', {title?: string; items: {q: string; a: string}[]}>
  | BlockBase<
      'architecture',
      {
        link?: Link
        flow: {label: string; items: ArchitectureItem[]}[]
        footnote?: string
        layersTitle?: string
        layers: {label: string; items: ArchitectureItem[]}[]
      }
    >
  | BlockBase<
      'subpages',
      {
        prompt?: string
        cwd?: string
        items: {
          title: string
          copy: string
          path: string
          href?: string
          icon?: string
          soon?: boolean
        }[]
      }
    >
  | BlockBase<
      'repos',
      {
        items: {
          role: string
          version: string
          name: string
          copy: string
          href?: string
        }[]
      }
    >
  | BlockBase<
      'coverage',
      {
        prompt?: string
        cwd?: string
        label: string
        badge?: string
        totals: {label: string; value: number; copy: string}[]
        rows: {
          name: string
          tools: string
          unit?: number
          component?: number
          e2e?: number
          coverage: number
        }[]
        footnote?: string
        link?: Link
      }
    >
  | BlockBase<'steps', {items: {title: string; copy: string}[]}>
  | BlockBase<'cta', {label: string; href: string; note?: string}>
  | BlockBase<
      'prefill',
      {
        title: string
        path: string
        facts: {label: string; value: string}[]
        note?: string
      }
    >

interface Link {
  label: string
  href: string
}

/** A box in the architecture diagram; `tag` is its badge, `chips` a row of small badges. */
export interface ArchitectureItem {
  title: string
  copy?: string
  tag?: string
  code?: string
  chips?: string[]
  hue?: Hue
}

export type BlockType = Block['type']
