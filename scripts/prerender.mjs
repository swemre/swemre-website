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

// Run via `npm run prerender` after `vite build` (also the postbuild step). Writes one HTML file
// per known route, dist/<route>/index.html (dist/index.html for "/"), from dist/index.html with
// the title, description, canonical, Open Graph and Twitter tags of that route, so link previews
// and crawlers that do not run JavaScript see them. The values come from the public API and
// src/utils/documentTags.ts, the same function the pages use at runtime. Re-runnable on its own:
// pages of posts that are no longer published are removed. If the API cannot be reached, nothing
// is changed and the script exits 0, so offline builds still work.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import {dirname, join} from 'node:path'
import {siteEnv} from '../src/config/env.ts'
import {siteConfig} from '../src/config/site.ts'
import {fieldMediaUrl, fieldString} from '../src/services/apiClient.ts'
import {publicApi} from '../src/services/publicApi.ts'
import {documentTags} from '../src/utils/documentTags.ts'

const DIST = process.env.DIST_DIR || 'dist'
const DETAIL_FOLDERS = ['articles', 'projects', 'sp']
const SLUG = /^[a-z0-9][a-z0-9-]*$/i

const escapeHtml = text =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const published = type =>
  publicApi.listPosts(type, {sortBy: 'publishedAt', direction: 'DESC'})

// Mirrors the useDocumentTitle calls of ArticlePage and ProjectPage
const detailRoute = (folder, post) => ({
  path: `/${folder}/${post.slug}`,
  title: fieldString(post.fields, 'seoTitle') ?? post.title,
  meta: {
    description:
      fieldString(post.fields, 'seoDescription') ??
      fieldString(post.fields, 'summary'),
    image:
      fieldMediaUrl(post.fields, 'ogImage') ??
      fieldMediaUrl(post.fields, 'cover'),
  },
})

// Mirrors SpecialPage: the summary (else seoDescription) and only the ogImage
const specialRoute = post => ({
  path: `/sp/${post.slug}`,
  title: fieldString(post.fields, 'seoTitle') ?? post.title,
  meta: {
    description:
      fieldString(post.fields, 'summary') ??
      fieldString(post.fields, 'seoDescription'),
    image: fieldMediaUrl(post.fields, 'ogImage'),
  },
})

async function loadRoutes() {
  const [settings, articles, projects, pages] = await Promise.all([
    publicApi.listPosts('site-settings', {size: 1}),
    published('article'),
    published('project'),
    publicApi.listPosts('page', {sortBy: 'title', direction: 'ASC'}),
  ])
  const defaultImage =
    fieldMediaUrl(settings[0]?.fields ?? {}, 'defaultOgImage') ??
    `${siteConfig.url}${siteConfig.avatarLarge}`
  const routes = [
    {path: '/', meta: {}},
    {path: '/articles', title: 'Articles', meta: {}},
    {path: '/projects', title: 'Projects', meta: {}},
    ...articles.map(post => detailRoute('articles', post)),
    ...projects.map(post => detailRoute('projects', post)),
    ...pages.map(specialRoute),
  ]
  return {defaultImage, routes}
}

const MANAGED_TAGS = [
  /<meta\b[^>]*\bname="description"[^>]*>\s*/g,
  /<meta\b[^>]*\bproperty="og:(title|description|url|image)"[^>]*>\s*/g,
  /<meta\b[^>]*\bname="twitter:[^"]*"[^>]*>\s*/g,
  /<link\b[^>]*\brel="canonical"[^>]*>\s*/g,
]

// The shell before and after its <title>, without the tags this script writes
function shellParts(html) {
  const title = /<title>[\s\S]*?<\/title>/.exec(html)
  if (!title) throw new Error(`${DIST}/index.html has no <title>`)
  const strip = part =>
    MANAGED_TAGS.reduce((text, pattern) => text.replace(pattern, ''), part)
  return [
    strip(html.slice(0, title.index)),
    strip(html.slice(title.index + title[0].length)),
  ]
}

function headTags(tags) {
  const meta = (attribute, key, value) =>
    `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`
  return [
    `<title>${escapeHtml(tags.title)}</title>`,
    meta('name', 'description', tags.description),
    `<link rel="canonical" href="${escapeHtml(tags.url)}" />`,
    meta('property', 'og:title', tags.title),
    meta('property', 'og:description', tags.description),
    meta('property', 'og:url', tags.url),
    meta('property', 'og:image', tags.image),
    meta('name', 'twitter:card', tags.twitterCard),
    meta('name', 'twitter:title', tags.title),
    meta('name', 'twitter:description', tags.description),
    meta('name', 'twitter:image', tags.image),
  ].join('\n    ')
}

const routeFile = path =>
  path === '/' ? join(DIST, 'index.html') : join(DIST, path, 'index.html')

function removeDetailPages() {
  for (const folder of DETAIL_FOLDERS) {
    const root = join(DIST, folder)
    if (!existsSync(root)) continue
    for (const entry of readdirSync(root, {withFileTypes: true})) {
      if (!entry.isDirectory()) continue
      const directory = join(root, entry.name)
      rmSync(join(directory, 'index.html'), {force: true})
      if (readdirSync(directory).length === 0)
        rmSync(directory, {recursive: true})
    }
  }
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error(
    `prerender: ${DIST}/index.html is missing; run vite build first`,
  )
  process.exit(1)
}

let loaded
try {
  loaded = await loadRoutes()
} catch (error) {
  console.warn(
    `prerender: swemre-website-api not reachable at ${siteEnv.apiBase} (${error.message}); skipped, every route keeps the tags of index.html`,
  )
  process.exit(0)
}

const [before, after] = shellParts(
  readFileSync(join(DIST, 'index.html'), 'utf8'),
)
removeDetailPages()

let written = 0
for (const route of loaded.routes) {
  const slug = route.path.split('/')[2]
  if (slug !== undefined && !SLUG.test(slug)) {
    console.warn(`prerender: skipped ${route.path}, not a plain slug`)
    continue
  }
  const tags = documentTags(
    siteConfig,
    route.path,
    route.title,
    route.meta,
    loaded.defaultImage,
  )
  const file = routeFile(route.path)
  mkdirSync(dirname(file), {recursive: true})
  writeFileSync(file, `${before}${headTags(tags)}${after}`)
  written++
}
console.log(`prerender: wrote ${written} page(s) to ${DIST}/`)
