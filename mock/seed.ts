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

// Turns the authoring files in mock/seed/*.json into the wire JSON of public API v2
// (src/contract/api.ts). Seed items are compact: terms by slug, blocks without id/v, and
// strings for rich text with a tiny inline markup (`code`, **bold**, *italic*, [label](href)).
import {createHash} from 'node:crypto'
import {readFileSync, readdirSync} from 'node:fs'
import {join} from 'node:path'
import type {
  ApiMedia,
  ApiPublication,
  ApiRedirect,
  ApiTerm,
  ContentTypeKey,
} from '../src/contract/api.ts'
import type {InlineText} from '../src/contract/blocks.ts'

export interface SeedTerm {
  slug: string
  name: string
  description?: string
  related?: string[]
}
interface SeedBlock {
  type: string
  props: Record<string, unknown>
}
interface SeedItem {
  slug: string
  title: string
  excerpt?: string
  author?: string
  section?: string
  tags?: string[]
  publishedAt: string
  updatedAt?: string
  seoTitle?: string
  seoDescription?: string
  noindex?: boolean
  cover?: string
  fields?: Record<string, unknown>
  body?: SeedBlock[]
  /** Other-language versions: only what differs from the English item (same slug unless given). */
  translations?: Record<string, Partial<Omit<SeedItem, 'translations'>>>
}

export interface MediaFile {
  media: ApiMedia
  file: string
}

export interface MockData {
  publications: ApiPublication[]
  terms: ApiTerm[]
  redirects: ApiRedirect[]
  media: Map<string, MediaFile>
}

const FILES: Record<string, ContentTypeKey> = {
  'articles.json': 'article',
  'projects.json': 'project',
  'pages.json': 'page',
  'settings.json': 'site-settings',
}

/** A stable UUID (v5 layout) from a name, so ids stay the same between runs. */
export function uuidOf(name: string): string {
  const h = createHash('sha1').update(`swemre-mock:${name}`).digest('hex')
  const v = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${v}${h.slice(17, 20)}-${h.slice(20, 32)}`
}

const INLINE = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g

/** Parses the seed's inline markup into RichText. */
export function richText(value: unknown): InlineText[] {
  if (Array.isArray(value)) return value as InlineText[]
  const text = String(value ?? '')
  const out: InlineText[] = []
  let last = 0
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push({text: text.slice(last, m.index)})
    if (m[1]) out.push({text: m[1], code: true})
    else if (m[2]) out.push({text: m[2], bold: true})
    else if (m[3]) out.push({text: m[3], italic: true})
    else out.push({text: m[4], href: m[5]})
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({text: text.slice(last)})
  return out
}

const RICH_TYPES = new Set([
  'paragraph',
  'heading',
  'bulleted',
  'numbered',
  'quote',
  'callout',
])

/**
 * @param apiBase the site's VITE_API_BASE path, e.g. /api; body image urls are absolute, while
 *   media `url`s are relative to it, as in the real API.
 */
export function loadMockData(
  seedDir: string,
  mediaDir: string,
  apiBase: string,
  channel: string,
): MockData {
  const mediaBase = `/public/v2/channels/${channel}/media`
  const read = <T>(file: string): T =>
    JSON.parse(readFileSync(join(seedDir, file), 'utf8')) as T

  const media = new Map<string, MediaFile>()
  const byName = new Map<string, ApiMedia>()
  for (const file of readdirSync(mediaDir)) {
    const name = file.replace(/\.[^.]+$/, '')
    const id = uuidOf(`media:${name}`)
    const ext = file.split('.').pop() ?? ''
    const m: ApiMedia = {
      id,
      url: `${mediaBase}/${id}/file`,
      alt: name,
      mimeType:
        ext === 'svg'
          ? 'image/svg+xml'
          : ext === 'png'
            ? 'image/png'
            : 'image/jpeg',
    }
    media.set(id, {media: m, file: join(mediaDir, file)})
    byName.set(name, m)
  }
  const mediaUrl = (v: unknown) =>
    typeof v === 'string' && v.startsWith('media:')
      ? apiBase + (byName.get(v.slice(6))?.url ?? v)
      : v

  const seedTerms = read<{categories: SeedTerm[]; tags: SeedTerm[]}>(
    'terms.json',
  )
  const terms: ApiTerm[] = [
    ...seedTerms.categories.map(t => ({...t, kind: 'CATEGORY' as const})),
    ...seedTerms.tags.map(t => ({...t, kind: 'TAG' as const})),
  ].map(t => ({
    id: uuidOf(`term:${t.kind}:${t.slug}`),
    kind: t.kind,
    name: t.name,
    slug: t.slug,
    description: t.description ?? null,
    ...(t.related ? {related: t.related} : {}),
  }))
  const term = (kind: 'CATEGORY' | 'TAG', slug: string): ApiTerm => {
    const t = terms.find(x => x.kind === kind && x.slug === slug)
    if (!t) throw new Error(`mock seed: unknown ${kind} "${slug}"`)
    return {id: t.id, kind: t.kind, name: t.name, slug: t.slug}
  }

  const publications: ApiPublication[] = []
  for (const [file, contentType] of Object.entries(FILES)) {
    for (const source of read<SeedItem[]>(file)) {
      const {translations = {}, ...english} = source
      const versions: [string, SeedItem][] = [
        ['en', english],
        ...Object.entries(translations).map(
          ([locale, tr]): [string, SeedItem] => [
            locale,
            {...english, ...tr, fields: {...english.fields, ...tr.fields}},
          ],
        ),
      ]
      const languageVersions = versions.map(([locale, v]) => ({
        locale,
        slug: v.slug,
      }))
      for (const [locale, item] of versions) {
        const id = uuidOf(
          `pub:${contentType}:${source.slug}${locale === 'en' ? '' : `:${locale}`}`,
        )
        const section = item.section ? term('CATEGORY', item.section) : null
        const fields: Record<string, unknown> = {...item.fields}
        for (const [k, v] of Object.entries(fields)) {
          if (typeof v !== 'string' || !v.startsWith('media:')) continue
          const m = byName.get(v.slice(6))
          if (!m) throw new Error(`mock seed: unknown media "${v}"`)
          fields[k] = {...m, alt: fields[`${k}Alt`] ?? m.alt}
          delete fields[`${k}Alt`]
        }
        const blocks = (item.body ?? []).map((b, i) => {
          const props: Record<string, unknown> = {...b.props}
          if (RICH_TYPES.has(b.type)) props.text = richText(props.text)
          if (b.type === 'image') {
            props.url = mediaUrl(props.url)
            if (props.darkUrl) props.darkUrl = mediaUrl(props.darkUrl)
          }
          return {
            id: `${item.slug}-${String(i + 1).padStart(2, '0')}`,
            type: b.type,
            v: 2,
            props,
          }
        })
        publications.push({
          id,
          documentId: uuidOf(`doc:${contentType}:${source.slug}`),
          workId: uuidOf(`work:${contentType}:${source.slug}`),
          contentType,
          locale,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt ?? null,
          author:
            contentType === 'article'
              ? (item.author ?? 'Emre')
              : (item.author ?? null),
          cover: item.cover ? (byName.get(item.cover) ?? null) : null,
          fields,
          terms: [
            ...(section ? [section] : []),
            ...(item.tags ?? []).map(t => term('TAG', t)),
          ],
          section,
          publishedAt: item.publishedAt,
          updatedAt: item.updatedAt ?? item.publishedAt,
          seoTitle: item.seoTitle ?? null,
          seoDescription: item.seoDescription ?? item.excerpt ?? null,
          canonicalUrl: null,
          noindex: item.noindex ?? false,
          body: {blocks},
          languages: languageVersions.map(v => v.locale).sort(),
          languageVersions,
        })
      }
    }
  }

  for (const t of terms) {
    t.publicationCount = publications.filter(
      p => p.locale === 'en' && p.terms.some(x => x.id === t.id),
    ).length
  }

  return {
    publications,
    terms,
    redirects: read<ApiRedirect[]>('redirects.json'),
    media,
  }
}
