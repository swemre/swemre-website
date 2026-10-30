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
      {tone: 'info' | 'tip' | 'warning' | 'danger'; title?: string; text: RichText}
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
      {url: string; darkUrl?: string; alt: string; caption?: string; card?: boolean}
    >
  | BlockBase<'divider', Record<string, never>>
  | BlockBase<'table', {header: boolean; rows: string[][]}>
  | BlockBase<
      'section',
      {number: string; eyebrow: string; title: string; hue?: Hue; copy?: string}
    >
  | BlockBase<
      'facts',
      {
        layout: 'list' | 'strip' | 'rows'
        title?: string
        facts: {label: string; value: string; href?: string; code?: boolean; note?: string}[]
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
        items: {version: string; date: string; title: string; note?: string; current?: boolean}[]
      }
    >
  | BlockBase<'faq', {title?: string; items: {q: string; a: string}[]}>

export type BlockType = Block['type']
