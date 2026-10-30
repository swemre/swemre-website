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
/* global document, window -- page.evaluate callbacks run in the browser */
// Screenshots the site in every board state a URL can reach, for comparison with the boards.
// It starts nothing: run the dev server (or preview) first and pass its URL.
//
//   npm run v4:shoot -- --base http://localhost:5173 [--out v4-shots] [--vp m,t,d,4k]
//                       [--theme dark,light] [--only Home,Contact] [--boards <dir>]
//
// With --boards (the folder of V4-*.dc.html), each shot follows its board: it scrolls to the
// board's crop offset and is cut to the board's height, and split pages (Home-1, Home-2) get one
// shot each. Without it every case is one full-page shot. Writes <out>/<vp>-<theme>/<name>.png
// and <out>/manifest.json. Owner: agent C.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {basename, join, resolve} from 'node:path'
import {
  CASES,
  VIEWPORTS,
  boardFiles,
  boardFrame,
  list,
  loadPlaywright,
  parseArgs,
} from './cases.mjs'

const args = parseArgs(process.argv.slice(2), {
  base: 'http://localhost:5173',
  out: 'v4-shots',
  vp: 'm,t,d,4k',
  theme: 'dark,light',
})
const out = resolve(args.out)
const only = new Set(list(args.only))
const cases = CASES.filter(c => !only.size || only.has(c.board))
const {chromium} = loadPlaywright()

const FREEZE =
  '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html{scrollbar-width:none}'

const manifest = []
const browser = await chromium.launch()
try {
  for (const theme of list(args.theme)) {
    for (const vp of list(args.vp)) {
      const v = VIEWPORTS[vp]
      if (!v) throw new Error(`unknown viewport ${vp} (m, t, d, 4k)`)
      const dir = join(out, `${vp}-${theme}`)
      mkdirSync(dir, {recursive: true})
      const ctx = await browser.newContext({
        viewport: {width: v.width, height: v.height},
        deviceScaleFactor: v.scale,
        colorScheme: theme,
        reducedMotion: 'reduce',
      })
      await ctx.addInitScript(t => {
        try {
          localStorage.setItem('swemre:theme', t)
        } catch {
          /* private mode */
        }
      }, theme)
      const page = await ctx.newPage()
      page.on('pageerror', e => console.warn(`  page error: ${e.message}`))
      for (const c of cases) {
        const files = args.boards ? boardFiles(args.boards, vp, c.board) : []
        const parts = files.length
          ? files.map(f => ({
              name: basename(f).replace(/^V4-[^-]+-|\.dc\.html$/g, ''),
              ...boardFrame(f, vp),
            }))
          : [{name: c.board}]
        for (const part of parts) {
          await page.goto(new URL(c.path, args.base).href, {
            waitUntil: 'networkidle',
          })
          await page.addStyleTag({content: FREEZE})
          await page.evaluate(() => document.fonts.ready)
          await page.waitForTimeout(400)
          // The grain is fixed to the window; a full-page shot would grain only the first
          // screen, while the boards grain the whole frame.
          await page.evaluate(() => {
            const g = document.querySelector('.a2-site-grain')
            if (!g) return
            g.style.position = 'absolute'
            g.style.bottom = 'auto'
            g.style.height = `${document.documentElement.scrollHeight}px`
          })
          const file = join(dir, `${part.name}.png`)
          if (part.height === undefined) {
            await page.screenshot({path: file, fullPage: true})
          } else {
            if (part.offset > 0) {
              // SiteShell restores the saved scroll position for up to 1.5 s after a load.
              await page.waitForTimeout(1600)
              await page.evaluate(y => window.scrollTo(0, y), part.offset)
              await page.waitForTimeout(400)
            }
            const scrolled = await page.evaluate(() => window.scrollY)
            if (part.height <= v.height && part.offset > 0) {
              await page.screenshot({path: file})
            } else {
              const total = await page.evaluate(
                () => document.documentElement.scrollHeight,
              )
              await page.screenshot({
                path: file,
                fullPage: true,
                clip: {
                  x: 0,
                  y: scrolled,
                  width: v.width,
                  height: Math.max(1, Math.min(part.height, total - scrolled)),
                },
              })
            }
          }
          manifest.push({
            vp,
            theme,
            board: c.board,
            name: part.name,
            path: c.path,
            note: c.note,
            file: join(`${vp}-${theme}`, `${part.name}.png`),
          })
          console.log(`${vp}-${theme} ${part.name}  ${c.path}`)
        }
      }
      await ctx.close()
    }
  }
} finally {
  await browser.close()
}
// Merge with an earlier run, so shooting a few cases keeps the rest of the report.
const manifestFile = join(out, 'manifest.json')
const id = s => `${s.vp}-${s.theme}/${s.name}`
const fresh = new Set(manifest.map(id))
const earlier = existsSync(manifestFile)
  ? JSON.parse(readFileSync(manifestFile, 'utf8')).filter(
      s => !fresh.has(id(s)),
    )
  : []
writeFileSync(manifestFile, JSON.stringify([...earlier, ...manifest], null, 2))
console.log(`${manifest.length} shots in ${out}`)
