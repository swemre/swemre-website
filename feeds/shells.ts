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

// One copy of the app shell per known page (dist/<path>/index.html), with the page's own title,
// description and canonical address. The host serves these with status 200, so crawlers and
// link previews see the page instead of the 404 shell; the app still renders the content.
import type {ApiPublicationSummary} from '../src/contract/api.ts'
import {canonicalHref} from '../src/data/rules.ts'
import texts from '../src/i18n/texts.json' with {type: 'json'}
import {SITE_ROUTES} from './build.ts'

export interface Shell {
  /** Site path without a trailing slash, for example /tr/articles. */
  path: string
  title: string
  description?: string
}

type Texts = Record<string, Record<string, string>>

const ROUTE_TEXT: Record<string, string> = {
  '/': 'home',
  '/articles': 'articles',
  '/projects': 'projects',
  '/search': 'search',
  '/newsletter': 'newsletter',
  '/contact': 'contact',
  '/call-back': 'callback',
}

const prefix = (locale: string) => (locale === 'en' ? '' : `/${locale}`)

export function shellsOf(
  publications: ApiPublicationSummary[],
  locales: string[],
): Shell[] {
  const t = texts as unknown as Texts
  const routes = locales.flatMap(locale =>
    SITE_ROUTES.map(route => {
      const key = ROUTE_TEXT[route]
      return {
        path: prefix(locale) + (route === '/' ? '' : route) || '/',
        title: key ? t[`route.${key}.title`]?.[locale] : 'Emre',
        description: key
          ? t[`route.${key}.description`]?.[locale]
          : t['author.profile.headline']?.[locale],
      }
    }),
  )
  const pages = publications
    .filter(p => p.contentType !== 'site-settings' && !p.noindex)
    .map(p => ({
      path: prefix(p.locale) + canonicalHref(p),
      title: p.seoTitle ?? p.title,
      description: p.seoDescription ?? p.excerpt ?? undefined,
    }))
  return [...routes, ...pages].filter(s => s.path !== '/')
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const setTag = (html: string, pattern: RegExp, value: string) =>
  html.replace(pattern, (_, start: string, end: string) =>
    [start, esc(value), end].join(''),
  )

/** The shell's own addresses point at the site, not at the build machine. */
export function siteShell(html: string, siteUrl: string): string {
  const site = siteUrl.replace(/\/$/, '')
  return html.replace(/https?:\/\/localhost:\d+/g, site)
}

export function shellHtml(html: string, siteUrl: string, s: Shell): string {
  const site = siteUrl.replace(/\/$/, '')
  const title = !s.title
    ? 'SWEMRE'
    : s.title.includes('SWEMRE')
      ? s.title
      : `${s.title} · SWEMRE`
  let out = siteShell(html, site)
  out = setTag(out, /(<title>)[^<]*(<\/title>)/, title)
  out = setTag(out, /(property="og:title"\s+content=")[^"]*(")/, title)
  out = setTag(out, /(property="og:url"\s+content=")[^"]*(")/, site + s.path)
  if (s.description) {
    out = setTag(out, /(name="description"\s+content=")[^"]*(")/, s.description)
    out = setTag(
      out,
      /(property="og:description"\s+content=")[^"]*(")/,
      s.description,
    )
  }
  return out.replace(
    '</head>',
    `  <link rel="canonical" href="${esc(site + s.path)}" />\n  </head>`,
  )
}
