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
// The V4 board states that a URL can reach (product-spec 5.3), shared by shoot.mjs and
// boards.mjs. `board` is the board name without `V4-<Viewport>-` and `.dc.html`; long pages
// are split into `<board>-1`, `-2`, ... on some viewports and both scripts follow that.
// States that need typing or clicks (form errors, submitting, success, failure, the search
// dialog and the mega menus) are not here. Owner: agent C.
import {existsSync, readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {execSync} from 'node:child_process'
import {join} from 'node:path'

export const VIEWPORTS = {
  m: {board: 'Mobile', width: 390, height: 844, scale: 1},
  t: {board: 'Tablet', width: 834, height: 1194, scale: 1},
  d: {board: 'Desktop', width: 1440, height: 900, scale: 1},
  // 4K is the 1920 layout at zoom 2 (3840x2160 pixels).
  '4k': {board: '4K', width: 1920, height: 1080, scale: 2},
}

const S = 'seed=0'
export const CASES = [
  {board: 'Home', path: `/?${S}`},
  {board: 'Home-Scrolled', path: `/?${S}`},
  ...['articles', 'projects', 'songs'].flatMap(block =>
    ['loading', 'empty', 'error'].map(state => ({
      board: `Home-${block}-${state}`,
      path: `/?${S}&state=${block}:${state}`,
    })),
  ),
  {board: 'Articles', path: '/articles'},
  {board: 'Articles-text', path: '/articles?view=text'},
  {board: 'Articles-loading', path: '/articles?state=articles:loading'},
  {
    board: 'Articles-text-loading',
    path: '/articles?view=text&state=articles:loading',
  },
  {board: 'Articles-empty', path: '/articles?topic=kotlin'},
  {board: 'Articles-error', path: '/articles?state=articles:error'},
  {board: 'Topic-java', path: '/articles/topic/java'},
  {board: 'Article', path: '/articles/spring-boot-template'},
  {board: 'Article-not-found', path: '/articles/spring-boot-templat'},
  {board: 'Projects', path: '/projects?stack=react,typescript'},
  {board: 'Projects-list', path: '/projects?stack=react,typescript&view=list'},
  {board: 'Projects-empty', path: '/projects?stack=java&live=1'},
  {board: 'Project-swemre-website-api', path: '/projects/swemre-website-api'},
  {board: 'Project-not-found', path: '/projects/swemre-website-apl'},
  {board: 'Search', path: '/search?q=spring'},
  {board: 'Search-empty', path: '/search?q=kubernetes'},
  {
    board: 'Newsletter',
    path: '/newsletter',
    note: 'board has typed sample values',
  },
  {board: 'Newsletter-confirmed', path: '/newsletter/confirmed?token=seed'},
  {
    board: 'Newsletter-unsubscribed',
    path: '/newsletter/unsubscribed?token=seed',
  },
  {board: 'Contact', path: '/contact', note: 'board has typed sample values'},
  {
    board: 'Callback',
    path: '/call-back',
    note: 'board has typed sample values',
  },
  {board: 'Author', path: '/authors/emre'},
  {board: 'Single-Page', path: '/policies/privacy-policy'},
  {board: 'Single-Page-not-found', path: '/policies/cookie-policy'},
  {board: '404', path: '/articles/spring-boot-templat'},
  {board: '500', path: '/?fault=500'},
  {board: '503', path: '/?fault=503'},
]

/** The board files of a case on a viewport: `<board>` itself, or its parts `-1`, `-2`, ... */
export function boardFiles(dir, vp, board) {
  const name = n => join(dir, `V4-${VIEWPORTS[vp].board}-${n}.dc.html`)
  if (existsSync(name(board))) return [name(board)]
  const parts = []
  for (let i = 1; existsSync(name(`${board}-${i}`)); i++)
    parts.push(name(`${board}-${i}`))
  return parts
}

/** A board's crop: the scroll offset (the .a2-flow margin) and the frame size, in CSS px. */
export function boardFrame(file, vp) {
  const html = readFileSync(file, 'utf8')
  const offset = Number(
    /a2-flow" style="margin-top:-([\d.]+)px/.exec(html)?.[1] ?? 0,
  )
  const m = /class="a2-frame" style="[^"]*width:(\d+)px;height:(\d+)px/.exec(
    html,
  )
  const scale = VIEWPORTS[vp].scale
  // 4K boards are drawn at 3840; the site's CSS layout is 1920 at zoom 2.
  return {
    offset: offset / scale,
    width: m ? Number(m[1]) / scale : VIEWPORTS[vp].width,
    height: m ? Number(m[2]) / scale : VIEWPORTS[vp].height,
  }
}

export function parseArgs(argv, defaults) {
  const out = {...defaults}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) out[key] = true
    else out[key] = argv[++i]
  }
  return out
}

export const list = v => (v ? String(v).split(',').filter(Boolean) : [])

/** Playwright from the project, or from the global node_modules. */
export function loadPlaywright() {
  const req = createRequire(import.meta.url)
  try {
    return req('playwright')
  } catch {
    const root = execSync('npm root -g', {encoding: 'utf8'}).trim()
    return req(join(root, 'playwright'))
  }
}
