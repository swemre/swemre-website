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

// Run via `npm run sitemap` (Node's --experimental-strip-types loads the .ts files).
// Builds public/sitemap.xml from the fixed routes and the published articles, projects and
// special pages of the website in swemre-website-api. If the API cannot be reached, the existing
// public/sitemap.xml is kept and the script exits 0, so `dev` and `build` still work offline.
import {existsSync, mkdirSync, writeFileSync} from 'node:fs'
import {siteConfig} from '../src/config/site.ts'

const apiBase = process.env.VITE_API_BASE ?? 'http://localhost:8080/api'
const workspaceKey = process.env.VITE_WORKSPACE_KEY ?? 'swemre-website'

const escape = text =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

async function fetchPublished(type) {
  const response = await fetch(
    `${apiBase}/public/v1/workspaces/${workspaceKey}/posts?type=${type}&size=100&sort-by=publishedAt&direction=DESC`,
    {headers: {Accept: 'application/json'}},
  )
  // 404: the workspace has no such content type, so there is nothing to list
  if (response.status === 404) return []
  if (!response.ok) throw new Error(`${type} answered ${response.status}`)
  const page = await response.json()
  return page.content ?? []
}

const entry = (path, lastModified) => ({path, lastModified})

let posts
try {
  const [articles, projects, pages] = await Promise.all(
    ['article', 'project', 'page'].map(fetchPublished),
  )
  posts = [
    ...articles.map(post =>
      entry(`/articles/${post.slug}`, post.lastUpdatedAt),
    ),
    ...projects.map(post =>
      entry(`/projects/${post.slug}`, post.lastUpdatedAt),
    ),
    ...pages.map(post => entry(`/sp/${post.slug}`, post.lastUpdatedAt)),
  ]
} catch (error) {
  console.warn(
    `sitemap: swemre-website-api not reachable at ${apiBase} (${error.message}); keeping the existing public/sitemap.xml`,
  )
  process.exit(existsSync('public/sitemap.xml') ? 0 : 1)
}

const entries = [entry('/'), entry('/articles'), entry('/projects'), ...posts]

const urlXml = entries
  .map(({path, lastModified}) =>
    [
      '  <url>',
      `    <loc>${escape(`${siteConfig.url}${path}`)}</loc>`,
      ...(lastModified
        ? [`    <lastmod>${lastModified.slice(0, 10)}</lastmod>`]
        : []),
      '  </url>',
    ].join('\n'),
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlXml}
</urlset>
`

mkdirSync('public', {recursive: true})
writeFileSync('public/sitemap.xml', xml)
console.log(`sitemap: wrote ${entries.length} url(s) to public/sitemap.xml`)
