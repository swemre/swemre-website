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

// One-time import of the content that lives in src/database into swemre-website-api, as posts of
// the website's workspace. Articles, projects, songs and special pages are each one post type.
// Items whose slug already exists for their type are skipped, so the script can run again.
//
// Usage (from the website folder):
//   ADMIN_PASSWORD=... node --experimental-strip-types --no-warnings scripts/import-content-to-api.mjs
//
// Optional: API_BASE (default http://localhost:8080/api), WORKSPACE_KEY (default swemre-website),
// ADMIN_USERNAME (default emre).

import {readFile} from 'node:fs/promises'
import {articleDatabase} from '../src/database/articleDatabase.ts'
import {projectDatabase} from '../src/database/projectDatabase.ts'
import {songDatabase} from '../src/database/songDatabase.ts'
import {specialPageDatabase} from '../src/database/specialPageDatabase.ts'

const apiBase = process.env.API_BASE ?? 'http://localhost:8080/api'
const workspaceKey = process.env.WORKSPACE_KEY ?? 'swemre-website'
const username = process.env.ADMIN_USERNAME ?? 'emre'
const password = process.env.ADMIN_PASSWORD

if (!password) {
  console.error('Set ADMIN_PASSWORD to the CMS owner password.')
  process.exit(1)
}

async function call(path, {method = 'GET', body, token} = {}) {
  const headers = {Accept: 'application/json'}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  const json = text ? JSON.parse(text) : undefined
  return {status: response.status, json}
}

const {json: session} = await call('/v1/auth/token', {
  method: 'POST',
  body: {username, password},
})
const token = session?.accessToken
if (!token) {
  console.error(
    'Sign-in to the API failed. Check ADMIN_USERNAME and ADMIN_PASSWORD.',
  )
  process.exit(1)
}

const {json: workspaces} = await call('/v1/workspaces', {token})
const workspace = workspaces?.find(item => item.workspaceKey === workspaceKey)
if (!workspace) {
  console.error(
    `No workspace with key "${workspaceKey}". Add it in the CMS first.`,
  )
  process.exit(1)
}

async function importPost(postType, slug, label, body, meta, fields) {
  const base = `/v1/workspaces/${workspace.id}/posts`
  const created = await call(base, {
    method: 'POST',
    token,
    body: {
      postType,
      slug,
      ...fields,
      content: body,
      contentFormat: 'TEXT',
      meta,
      termIds: [],
    },
  })
  if (created.status === 409) {
    console.log(`skipped ${postType} ${slug}: already exists`)
    return
  }
  if (created.status !== 201) {
    console.error(`failed ${postType} ${slug}:`, created.json)
    return
  }
  const published = await call(`${base}/${created.json.id}/publish`, {
    method: 'POST',
    token,
    body: {version: created.json.version},
  })
  console.log(
    `${published.status === 200 ? 'published' : 'failed to publish'} ${postType} ${label}`,
  )
}

async function bodyOf(directory, slug) {
  return readFile(
    new URL(`../src/page/${directory}/${slug}.mdx`, import.meta.url),
    'utf8',
  ).catch(() => '')
}

for (const article of articleDatabase) {
  await importPost(
    'POST',
    article.slug,
    article.slug,
    await bodyOf('article', article.slug),
    {readingTime: article.readingTime},
    {title: article.title, excerpt: article.summary, author: article.author},
  )
}

for (const project of projectDatabase) {
  await importPost(
    'PROJECT',
    project.slug,
    project.slug,
    await bodyOf('projects', project.slug),
    {
      year: project.year,
      url: project.url ?? null,
      repoUrl: project.repoUrl ?? null,
    },
    {
      title: project.title,
      excerpt: project.summary,
      author: 'Emre Caniklioglu',
    },
  )
}

for (const song of songDatabase) {
  await importPost(
    'SONG',
    song.id,
    song.title,
    '',
    {
      artist: song.artist,
      spotifyId: song.spotifyId,
      coverUrl: song.artworkUrl ?? null,
    },
    {
      title: song.title,
      excerpt: `${song.title} by ${song.artist}`,
      author: 'Emre Caniklioglu',
    },
  )
}

for (const page of specialPageDatabase) {
  await importPost(
    'PAGE',
    page.slug,
    page.slug,
    await bodyOf('sp', page.slug),
    {
      version: page.version,
      effectiveDate: page.effectiveDate,
      updatedAt: page.updatedAt,
    },
    {title: page.title, excerpt: page.summary, author: 'Emre Caniklioglu'},
  )
}
