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

// Live builds write dist/rss.xml and dist/sitemap.xml from the website channel. The build machine
// must reach VITE_API_BASE; with VITE_FEEDS_REQUIRED=1 (the deploy scripts) an unreachable API
// fails the build, otherwise the feeds are skipped with a warning.
import type {Plugin} from 'vite'
import type {
  ApiPage,
  ApiPublication,
  ApiPublicationSummary,
} from '../src/contract/api.ts'
import {buildRss, buildSitemap, type FeedSettings} from './build.ts'

export interface LiveFeedsOptions {
  apiBase: string
  channel: string
  readKey: string
  siteUrl: string
  locales: string[]
  required: boolean
}

export function liveFeeds(opts: LiveFeedsOptions): Plugin {
  const base = `${opts.apiBase.replace(/\/$/, '')}/public/v2/channels/${opts.channel}`
  const get = async <T>(path: string): Promise<T> => {
    const res = await fetch(base + path, {
      headers: {'X-Read-Key': opts.readKey, Accept: 'application/json'},
    })
    if (!res.ok) throw new Error(`GET ${path}: HTTP ${res.status}`)
    return (await res.json()) as T
  }
  const listAll = async (locale: string) => {
    const items: ApiPublicationSummary[] = []
    for (let page = 0; ; page++) {
      const res = await get<ApiPage<ApiPublicationSummary>>(
        `/publications?locale=${locale}&page=${page}&size=100`,
      )
      items.push(...res.items)
      if (items.length >= res.total || res.items.length === 0) return items
    }
  }
  return {
    name: 'swemre-live-feeds',
    apply: 'build',
    async generateBundle() {
      try {
        const publications = (
          await Promise.all(opts.locales.map(listAll))
        ).flat()
        const settings = await get<ApiPublication>(
          '/publications/site-settings?locale=en',
        ).then(
          p => p.fields as FeedSettings,
          () => ({}),
        )
        this.emitFile({
          type: 'asset',
          fileName: 'rss.xml',
          source: buildRss(publications, opts.siteUrl, settings),
        })
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: buildSitemap(publications, opts.siteUrl),
        })
      } catch (e) {
        const message = `rss.xml and sitemap.xml not written: ${String(e)}`
        if (opts.required) this.error(message)
        this.warn(message)
      }
    },
  }
}
