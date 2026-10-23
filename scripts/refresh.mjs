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

// Run via `npm run refresh` (or `node scripts/refresh.mjs <build folder>` on the server).
// Brings an existing build up to date with what is published, without a new build: rss.xml,
// sitemap.xml and the pre-rendered route pages are rewritten in place from the public API.
// The server runs it every few minutes and uploads what changed (deploy/refresh-site.sh in
// swemre-website-api). Each step keeps its old output when the API cannot be reached.
import {execFileSync} from 'node:child_process'
import {existsSync} from 'node:fs'
import {join} from 'node:path'

const dist = process.argv[2] || 'dist'
if (!existsSync(join(dist, 'index.html'))) {
  console.error(`refresh: ${dist}/index.html is missing; build the site first`)
  process.exit(1)
}

const env = {...process.env, OUT_DIR: dist, DIST_DIR: dist}
let failed = 0
for (const script of [
  'generate-rss.mjs',
  'generate-sitemap.mjs',
  'prerender.mjs',
]) {
  try {
    execFileSync(
      process.execPath,
      [
        '--experimental-strip-types',
        '--no-warnings',
        join(import.meta.dirname, script),
      ],
      {env, stdio: 'inherit'},
    )
  } catch {
    failed++
  }
}
process.exit(failed === 0 ? 0 : 1)
