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
// The feed and sitemap of the seeded publications. The mock serves them at /rss.xml and
// /sitemap.xml, and the build writes them to dist/ in mock mode. Owner: agent C.
import {buildRss, buildSitemap, type FeedSettings} from '../feeds/build.ts'
import type {MockData} from './seed.ts'

const settingsOf = (data: MockData) =>
  (data.publications.find(
    p => p.contentType === 'site-settings' && p.locale === 'en',
  )?.fields ?? {}) as FeedSettings

export function mockRss(data: MockData, siteUrl: string): string {
  return buildRss(data.publications, siteUrl, settingsOf(data))
}

export function mockSitemap(data: MockData, siteUrl: string): string {
  return buildSitemap(data.publications, siteUrl)
}
