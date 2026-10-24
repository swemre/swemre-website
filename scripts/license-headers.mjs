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

// Usage: node scripts/license-headers.mjs --check | --fix
// Keep the wording in sync with the psi-header settings in .vscode/settings.json.
import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs'
import {extname, join, relative} from 'node:path'

const YEAR = 2026
const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  '.wrangler',
  '.git',
  '.vscode',
  '.claude',
  'public',
])

const LINES = [
  `Copyright ${YEAR} swemre (emre@swemre.com). All rights reserved.`,
  '',
  'Licensed under the Apache License, Version 2.0 with the Commons Clause',
  'License Condition v1.0 (the "License"). Personal use of this code and',
  'content is permitted; any commercial gain requires prior written',
  'permission from the copyright holder. See the LICENSE file for full terms.',
  '',
  'Contact: emre@swemre.com',
]

const block = (open, prefix, close) =>
  [open, ...LINES.map(l => (prefix + l).trimEnd()), close].join('\n')

const STYLES = {
  '.ts': block('/**', ' * ', ' */'),
  '.tsx': block('/**', ' * ', ' */'),
  '.js': block('/**', ' * ', ' */'),
  '.mjs': block('/**', ' * ', ' */'),
  '.css': block('/*', ' * ', ' */'),
  '.mdx': block('{/*', ' * ', ' */}'),
  '.html': block('<!--', '  ', '-->'),
}

const MARKER = /Copyright \d{4} swemre/

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (!IGNORED_DIRS.has(name)) yield* walk(path)
    } else if (extname(name) in STYLES) {
      yield path
    }
  }
}

function withHeader(source, header, ext) {
  // Keep an HTML doctype first so browsers stay out of quirks mode.
  if (ext === '.html' && /^<!doctype[^\n]*\n/i.test(source)) {
    const end = source.indexOf('\n') + 1
    return `${source.slice(0, end)}${header}\n${source.slice(end)}`
  }
  return `${header}\n\n${source}`
}

const fix = process.argv.includes('--fix')
const missing = []

for (const file of walk(process.cwd())) {
  const ext = extname(file)
  const source = readFileSync(file, 'utf8')
  if (MARKER.test(source.slice(0, 1200))) continue
  if (fix) {
    writeFileSync(file, withHeader(source, STYLES[ext], ext))
    console.log(`added header: ${relative(process.cwd(), file)}`)
  } else {
    missing.push(relative(process.cwd(), file))
  }
}

if (missing.length) {
  console.error('Missing license header (run `npm run checkstyle:fix`):')
  for (const f of missing) console.error(`  ${f}`)
  process.exit(1)
}
