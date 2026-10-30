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
/* global document -- page.evaluate callbacks run in the browser */
// Renders the V4 board frames that match the shoot.mjs cases to PNGs, and writes an HTML
// report that puts each site shot next to its board.
//
//   npm run v4:boards -- --boards /path/to/v4-ref/boards [--out v4-shots] [--vp m,t,d,4k]
//                        [--theme dark,light] [--only Home,Contact]
//
// Mobile, Tablet and Desktop boards hold the dark frame at x=0 and the light frame at x=W+160
// (y=56); 4K boards are one frame each, with the light state in a separate `-Light` board.
// Writes <out>/boards/<vp>-<theme>/<name>.png and <out>/report.html, which reads the shots
// from <out>/manifest.json when it is there. Owner: agent C.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {basename, join, resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {
  CASES,
  VIEWPORTS,
  boardFiles,
  list,
  loadPlaywright,
  parseArgs,
} from './cases.mjs'

const args = parseArgs(process.argv.slice(2), {
  boards: '../v4-ref/boards',
  out: 'v4-shots',
  vp: 'm,t,d,4k',
  theme: 'dark,light',
})
const boardsDir = resolve(args.boards)
const out = resolve(args.out)
const only = new Set(list(args.only))
const cases = CASES.filter(c => !only.size || only.has(c.board))
const {chromium} = loadPlaywright()

const rendered = []
const browser = await chromium.launch()
try {
  const page = await browser.newPage({viewport: {width: 1600, height: 1000}})
  for (const theme of list(args.theme)) {
    for (const vp of list(args.vp)) {
      const v = VIEWPORTS[vp]
      const dir = join(out, 'boards', `${vp}-${theme}`)
      mkdirSync(dir, {recursive: true})
      for (const c of cases) {
        for (const dark of boardFiles(boardsDir, vp, c.board)) {
          const name = basename(dark).replace(/^V4-[^-]+-|\.dc\.html$/g, '')
          let file = dark
          let index = theme === 'dark' ? 0 : 1
          if (vp === '4k') {
            index = 0
            if (theme === 'light') {
              file = dark.replace(/\.dc\.html$/, '-Light.dc.html')
              if (!existsSync(file)) {
                console.warn(`  missing ${basename(file)}`)
                continue
              }
            }
          }
          const html = readFileSync(file, 'utf8')
          const width = Number(
            /width:(\d+)px;height:\d+px;overflow:hidden;background/.exec(
              html,
            )?.[1] ?? v.width,
          )
          await page.setViewportSize({
            width: Math.max(width * 3 + 320, 1600),
            height: 1000,
          })
          await page.goto(pathToFileURL(file).href, {waitUntil: 'load'})
          await page.evaluate(() => document.fonts.ready)
          await page.waitForTimeout(200)
          const frames = page.locator('.a2-frame')
          const target =
            (await frames.count()) > index
              ? frames.nth(index)
              : page.locator('body')
          const png = join(dir, `${name}.png`)
          await target.screenshot({path: png, animations: 'disabled'})
          rendered.push({
            vp,
            theme,
            board: c.board,
            name,
            file: join('boards', `${vp}-${theme}`, `${name}.png`),
          })
          console.log(`board ${vp}-${theme} ${name}`)
        }
      }
    }
  }
} finally {
  await browser.close()
}

const manifestFile = join(out, 'manifest.json')
const shots = existsSync(manifestFile)
  ? JSON.parse(readFileSync(manifestFile, 'utf8'))
  : []
const key = r => `${r.vp}-${r.theme}/${r.name}`
const shotBy = new Map(shots.map(s => [key(s), s]))
const esc = s =>
  String(s ?? '').replace(/[&<>"]/g, ch => `&#${ch.charCodeAt(0)};`)
const rows = rendered
  .map(b => {
    const s = shotBy.get(key(b))
    return `<section><h2>${esc(b.vp)} · ${esc(b.theme)} · ${esc(b.name)}</h2>
<p>${s ? `<code>${esc(s.path)}</code>${s.note ? ` · ${esc(s.note)}` : ''}` : 'no site shot'}</p>
<div class="pair"><figure><figcaption>site</figcaption>${s ? `<img loading="lazy" src="${esc(s.file)}">` : ''}</figure>
<figure><figcaption>board</figcaption><img loading="lazy" src="${esc(b.file)}"></figure></div></section>`
  })
  .join('\n')
writeFileSync(
  join(out, 'report.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>V4 site vs boards</title>
<style>:root{color-scheme:dark}body{margin:0;padding:16px;background:#111318;color:#d6d9df;font:14px/1.5 system-ui,sans-serif}h1{font-size:20px}h2{font-size:15px;margin:32px 0 4px}code{color:#9ec1ff}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}figure{margin:0}figcaption{font-size:12px;color:#8a909b;margin-bottom:4px}img{width:100%;height:auto;display:block;border:1px solid #2a2e36}
@media (max-width:700px){.pair{grid-template-columns:1fr}}</style></head>
<body><h1>V4 site vs boards (${rendered.length} boards)</h1>${rows}</body></html>`,
)
console.log(`report: ${join(out, 'report.html')}`)
