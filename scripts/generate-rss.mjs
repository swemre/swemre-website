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

// Run via `npm run rss` (Node's --experimental-strip-types loads the .ts files).
// Builds public/rss.xml from two sources:
//   - published articles, projects and songs of the website in swemre-website-api, so the feed follows the CMS
//   - src/database/feedDatabase.ts for notes
// If the API cannot be reached, the existing public/rss.xml is kept and the script exits 0,
// so `dev` and `build` still work offline. Fails (exit 1) when the feed log itself is invalid.
import {existsSync, mkdirSync, writeFileSync} from 'node:fs'
import {siteConfig} from '../src/config/site.ts'
import {feedDatabase} from '../src/database/feedDatabase.ts'

const FEED_PATH = '/rss.xml'
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?Z$/
const apiBase = process.env.VITE_API_BASE ?? 'http://localhost:8080/api'
const workspaceKey = process.env.VITE_WORKSPACE_KEY ?? 'swemre-website'

const escape = text =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const absolute = link =>
  link.startsWith('/') ? `${siteConfig.url}${link}` : link

const errors = []

async function fetchPublished(path) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {Accept: 'application/json'},
  })
  // 404: the workspace has no such content type yet, so it has nothing to announce
  if (response.status === 404) return []
  if (!response.ok) throw new Error(`${path} answered ${response.status}`)
  const page = await response.json()
  return page.content ?? []
}

// A text field of a post; the API leaves empty fields out
const fieldText = (post, key) =>
  typeof post.fields?.[key] === 'string' ? post.fields[key] : ''

// Tags are the TAG terms of a post; they become RSS categories
const termNames = post =>
  (post.terms ?? [])
    .filter(term => term.taxonomy === 'TAG')
    .map(term => term.name)

// Each API item becomes one feed entry; its publishedAt is the moment it went live
async function fetchApiItems() {
  const articles = await fetchPublished(
    `/public/v1/workspaces/${workspaceKey}/posts?type=article&size=100&sort-by=publishedAt&direction=DESC`,
  )
  const projects = await fetchPublished(
    `/public/v1/workspaces/${workspaceKey}/posts?type=project&size=100&sort-by=publishedAt&direction=DESC`,
  )

  const articleItems = articles.map(article => {
    const link = absolute(`/articles/${article.slug}`)
    return {
      publishedAt: article.publishedAt,
      title: article.title,
      link,
      guid: link,
      permalink: true,
      description: fieldText(article, 'summary'),
      categories: ['article', ...termNames(article)],
    }
  })

  const projectItems = projects.map(project => {
    const link = absolute(`/projects/${project.slug}`)
    return {
      publishedAt: project.publishedAt,
      title: `Project: ${project.title}`,
      link,
      guid: link,
      permalink: true,
      description: fieldText(project, 'summary'),
      categories: ['project', ...termNames(project)],
    }
  })

  const songs = await fetchPublished(
    `/public/v1/workspaces/${workspaceKey}/posts?type=song&size=100&sort-by=publishedAt&direction=DESC`,
  )
  const songItems = songs.map(song => {
    const artist = fieldText(song, 'artist') || song.author
    const spotifyUrl = fieldText(song, 'spotifyUrl')
    return {
      publishedAt: song.publishedAt,
      title: `Song I liked: ${song.title} by ${artist}`,
      link: spotifyUrl || siteConfig.url,
      guid: `${siteConfig.url}/#song-${song.id}`,
      permalink: false,
      description: `Added "${song.title}" by ${artist} to the songs I liked.`,
      categories: ['music'],
    }
  })

  return [...articleItems, ...projectItems, ...songItems]
}

function resolve(item) {
  if (item.kind === 'note') {
    if (!item.title || !item.summary)
      return errors.push(`${item.id}: notes need a title and a summary`)
    const link = absolute(item.link ?? '/')
    return {
      title: item.title,
      link,
      guid: `${siteConfig.url}/#${item.id}`,
      permalink: false,
      description: item.summary,
      categories: ['note'],
    }
  }
  return errors.push(`${item.id}: unknown kind "${item.kind}"`)
}

const seen = new Set()
for (const item of feedDatabase) {
  if (seen.has(item.id)) errors.push(`${item.id}: duplicate feed id`)
  seen.add(item.id)
  if (!ISO_UTC.test(item.publishedAt))
    errors.push(`${item.id}: publishedAt must be ISO 8601 UTC`)
}

if (errors.length > 0) {
  console.error(`rss: ${errors.length} problem(s)`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

let apiItems
try {
  apiItems = await fetchApiItems()
} catch (error) {
  console.warn(
    `rss: swemre-website-api not reachable at ${apiBase} (${error.message}); keeping the existing public/rss.xml`,
  )
  process.exit(existsSync('public/rss.xml') ? 0 : 1)
}

const logItems = feedDatabase
  .map(item => ({publishedAt: item.publishedAt, resolved: resolve(item)}))
  .filter(({resolved}) => typeof resolved === 'object')
  .map(({publishedAt, resolved}) => ({publishedAt, ...resolved}))

const items = [...apiItems, ...logItems].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
)

const lastBuild = items[0]
  ? new Date(items[0].publishedAt).toUTCString()
  : new Date(0).toUTCString()

const itemXml = items
  .map(
    item => `    <item>
      <title>${escape(item.title)}</title>
      <link>${escape(item.link)}</link>
      <guid isPermaLink="${item.permalink}">${escape(item.guid)}</guid>
      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
      <description>${escape(item.description)}</description>
${item.categories.map(c => `      <category>${escape(c)}</category>`).join('\n')}
    </item>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteConfig.brand)}</title>
    <link>${siteConfig.url}</link>
    <atom:link href="${siteConfig.url}${FEED_PATH}" rel="self" type="application/rss+xml" />
    <description>${escape(`Articles, projects and songs from ${siteConfig.name}. ${siteConfig.tagline}`)}</description>
    <language>en</language>
    <managingEditor>${siteConfig.email} (${escape(siteConfig.name)})</managingEditor>
    <webMaster>${siteConfig.email} (${escape(siteConfig.name)})</webMaster>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <ttl>60</ttl>
${itemXml}
  </channel>
</rss>
`

mkdirSync('public', {recursive: true})
writeFileSync('public/rss.xml', xml)
console.log(`rss.xml written with ${items.length} items`)
