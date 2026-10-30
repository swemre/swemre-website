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
// The RSS 2.0 feed of the seeded articles, newest first. The mock serves it at /rss.xml and the
// build writes it to dist/rss.xml in mock mode. Owner: agent C.
import type {ApiPublication} from '../src/contract/api.ts'
import type {MockData} from './seed.ts'

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** RFC 822 date, as RSS 2.0 wants it. */
const rfc822 = (iso: string) => new Date(iso).toUTCString()

export function buildRss(data: MockData, siteUrl: string): string {
  const site = siteUrl.replace(/\/$/, '')
  const settings = data.publications.find(
    p => p.contentType === 'site-settings' && p.locale === 'en',
  )
  const f = (settings?.fields ?? {}) as {
    footerTagline?: string
    contactEmail?: string
  }
  const email = f.contactEmail ?? 'emre@swemre.com'
  const articles: ApiPublication[] = data.publications
    .filter(p => p.locale === 'en')
    .filter(p => p.contentType === 'article')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  const newest = articles
    .map(a => a.updatedAt ?? a.publishedAt)
    .sort()
    .pop()
  const items = articles.map(a => {
    const link = `${site}/articles/${a.slug}`
    const tags = a.terms
      .filter(t => t.kind === 'TAG' && t.slug !== 'featured')
      .map(t => `      <category>${esc(t.name)}</category>`)
    return [
      '    <item>',
      `      <title>${esc(a.title)}</title>`,
      `      <link>${esc(link)}</link>`,
      `      <guid isPermaLink="true">${esc(link)}</guid>`,
      `      <pubDate>${rfc822(a.publishedAt)}</pubDate>`,
      `      <author>${esc(`${email} (${a.author ?? 'Emre'})`)}</author>`,
      ...(a.excerpt
        ? [`      <description>${esc(a.excerpt)}</description>`]
        : []),
      ...tags,
      '    </item>',
    ].join('\n')
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>SWEMRE</title>',
    `    <link>${esc(site)}/</link>`,
    `    <description>${esc(f.footerTagline ?? 'Notes and projects from a software engineer.')}</description>`,
    '    <language>en</language>',
    ...(newest ? [`    <lastBuildDate>${rfc822(newest)}</lastBuildDate>`] : []),
    `    <atom:link href="${esc(site)}/rss.xml" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
