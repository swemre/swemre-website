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

// Checks src/i18n/texts.json: every key has English, every translation keeps the English
// placeholders, and every key is used somewhere in src. Prints what each language still misses.
//
//   npm run i18n:check
import {readFileSync, readdirSync, statSync} from 'node:fs'
import {join} from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const texts = JSON.parse(
  readFileSync(join(ROOT, 'src/i18n/texts.json'), 'utf8'),
)
const LOCALES = ['en', 'tr']
// Keys built at run time (`language.name.${locale}`) count as used.
const DYNAMIC = [/^language\.name\./]

function files(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return files(path)
    return /\.(ts|tsx)$/.test(name) ? [path] : []
  })
}
const code = files(join(ROOT, 'src'))
  .map(f => readFileSync(f, 'utf8'))
  .join('\n')

const forms = v => (typeof v === 'string' ? [v] : Object.values(v))
const holes = v =>
  [
    ...new Set(
      forms(v).flatMap(s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1])),
    ),
  ]
    .filter(h => h !== 'count')
    .sort()
    .join(',')

const errors = []
const missing = Object.fromEntries(LOCALES.map(l => [l, 0]))
for (const [key, entry] of Object.entries(texts)) {
  if (entry.en === undefined) errors.push(`${key}: no English text`)
  for (const l of LOCALES) if (entry[l] === undefined) missing[l]++
  for (const l of LOCALES) {
    if (l === 'en' || entry[l] === undefined || entry.en === undefined) continue
    if (holes(entry[l]) !== holes(entry.en))
      errors.push(
        `${key}: ${l} placeholders {${holes(entry[l])}} differ from en {${holes(entry.en)}}`,
      )
  }
  if (!code.includes(`'${key}'`) && !DYNAMIC.some(re => re.test(key)))
    errors.push(`${key}: not used in src`)
}

const total = Object.keys(texts).length
for (const l of LOCALES)
  console.log(`${l}: ${total - missing[l]} of ${total} texts`)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
