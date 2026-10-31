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

// The RSS 2.0 feed and the sitemap, built from the publications of the website channel. The mock
// builds them from its seed; a live build fetches the channel (feeds/plugin.ts). Pure functions.
import type {ApiPublicationSummary} from '../src/contract/api.ts'
import {canonicalHref} from '../src/data/rules.ts'

/** The site's own routes, which the CMS never serves (src/data/resolve.ts). */
const SITE_ROUTES = [
  '/',
  '/articles',
  '/projects',
  '/search',
  '/newsletter',
  '/contact',
  '/call-back',
  '/authors/emre',
]

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** RFC 822 date, as RSS 2.0 wants it. */
const rfc822 = (iso: string) => new Date(iso).toUTCString()

export interface FeedSettings {
  footerTagline?: string
  contactEmail?: string
}

/** The English articles, newest first. */
export function buildRss(
  publications: ApiPublicationSummary[],
  siteUrl: string,
  settings: FeedSettings = {},
): string {
  const site = siteUrl.replace(/\/$/, '')
  const email = settings.contactEmail ?? 'emre@swemre.com'
  const articles = publications
    .filter(p => p.locale === 'en' && p.contentType === 'article')
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
    `    <description>${esc(settings.footerTagline ?? 'Notes and projects from a software engineer.')}</description>`,
    '    <language>en</language>',
    ...(newest ? [`    <lastBuildDate>${rfc822(newest)}</lastBuildDate>`] : []),
    `    <atom:link href="${esc(site)}/rss.xml" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}

/** The site's routes and every article, project and page, in each published language. */
export function buildSitemap(
  publications: ApiPublicationSummary[],
  siteUrl: string,
): string {
  const site = siteUrl.replace(/\/$/, '')
  const urls = [
    ...SITE_ROUTES.map(path => ({
      path,
      lastmod: undefined as string | undefined,
    })),
    ...publications
      .filter(p => p.contentType !== 'site-settings' && !p.noindex)
      .map(p => ({
        path: (p.locale === 'en' ? '' : `/${p.locale}`) + canonicalHref(p),
        lastmod: (p.updatedAt ?? p.publishedAt).slice(0, 10),
      })),
  ]
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(u =>
      [
        '  <url>',
        `    <loc>${esc(site + (u.path === '/' ? '/' : u.path))}</loc>`,
        ...(u.lastmod ? [`    <lastmod>${u.lastmod}</lastmod>`] : []),
        '  </url>',
      ].join('\n'),
    ),
    '</urlset>',
    '',
  ].join('\n')
}
