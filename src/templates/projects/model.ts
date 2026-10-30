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

// The /projects filter model (spec 2.6): parse the URL, filter, count, and generate the summary
// sentence and the empty-state explanation. Filters keep the order they appear in the URL, so
// the "last restrictive filter" is the last key added.
import type {ProjectSummary} from '../../contract/view.ts'

export type ProjSort = 'updated' | 'newest' | 'name'
export type ProjView = 'grid' | 'list'

export const PROJ_SORTS: {value: ProjSort; label: string}[] = [
  {value: 'updated', label: 'Recently updated'},
  {value: 'newest', label: 'Newest'},
  {value: 'name', label: 'Name A–Z'},
]

/** One active filter value, in URL order. */
export type Active =
  | {kind: 'q'; value: string}
  | {kind: 'year'; value: number}
  | {kind: 'stack'; value: string; name: string}
  | {kind: 'live'}
  | {kind: 'source'}

export interface ProjFilters {
  q: string
  year?: number
  stack: string[]
  live: boolean
  source: boolean
  /** Every active value in the order its key appears in the URL. */
  active: Active[]
}

/** Stack facets (slug, name, count over all projects): the ten most used, most used first. */
export function stackFacets(all: ProjectSummary[]) {
  const map = new Map<string, {slug: string; name: string; count: number}>()
  for (const p of all)
    for (const t of p.stack) {
      const e = map.get(t.slug) ?? {slug: t.slug, name: t.name, count: 0}
      e.count++
      map.set(t.slug, e)
    }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 10)
}

export function yearFacets(all: ProjectSummary[]) {
  const map = new Map<number, number>()
  for (const p of all) if (p.year) map.set(p.year, (map.get(p.year) ?? 0) + 1)
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, count]) => ({year, count}))
}

export function parseFilters(
  params: URLSearchParams,
  stackNames: Map<string, string>,
): ProjFilters {
  const f: ProjFilters = {
    q: '',
    stack: [],
    live: false,
    source: false,
    active: [],
  }
  for (const [key, raw] of params) {
    const value = raw.trim()
    if (key === 'q' && value) {
      f.q = value
      f.active.push({kind: 'q', value})
    } else if (key === 'year' && /^\d{4}$/.test(value)) {
      f.year = Number(value)
      f.active.push({kind: 'year', value: f.year})
    } else if (key === 'stack') {
      for (const slug of value.split(',').filter(Boolean)) {
        if (f.stack.includes(slug)) continue
        f.stack.push(slug)
        f.active.push({
          kind: 'stack',
          value: slug,
          name: stackNames.get(slug) ?? slug,
        })
      }
    } else if (key === 'live' && value === '1') {
      f.live = true
      f.active.push({kind: 'live'})
    } else if (key === 'source' && value === '1') {
      f.source = true
      f.active.push({kind: 'source'})
    }
  }
  return f
}

function matches(p: ProjectSummary, f: ProjFilters, skip?: Active): boolean {
  const on = (a: Active) => f.active.includes(a) && a !== skip
  for (const a of f.active) {
    if (!on(a)) continue
    if (a.kind === 'q') {
      const q = a.value.toLowerCase()
      const hay = [
        p.title,
        p.summary,
        p.tagline ?? '',
        ...p.stack.map(t => t.name),
      ]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (a.kind === 'year' && p.year !== a.value) return false
    if (a.kind === 'live' && !p.live) return false
    if (a.kind === 'source' && !p.sourceAvailable) return false
  }
  const stacks = f.active.filter(
    (a): a is Extract<Active, {kind: 'stack'}> => a.kind === 'stack' && on(a),
  )
  // Stack is "match any".
  return (
    stacks.length === 0 ||
    stacks.some(s => p.stack.some(t => t.slug === s.value))
  )
}

export function applyFilters(
  all: ProjectSummary[],
  f: ProjFilters,
  skip?: Active,
) {
  return all.filter(p => matches(p, f, skip))
}

export function sortProjects(list: ProjectSummary[], sort: ProjSort) {
  const s = [...list]
  if (sort === 'name') s.sort((a, b) => a.title.localeCompare(b.title))
  else if (sort === 'newest')
    s.sort(
      (a, b) =>
        (b.year ?? 0) - (a.year ?? 0) || b.updatedAt.localeCompare(a.updatedAt),
    )
  else s.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return s
}

/** "React or TypeScript", "A, B or C" */
export function orList(names: string[]) {
  if (names.length < 2) return names.join('')
  return `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`
}

export function activeLabel(a: Active): string {
  switch (a.kind) {
    case 'q':
      return `“${a.value}”`
    case 'year':
      return String(a.value)
    case 'stack':
      return a.name
    case 'live':
      return 'Live'
    case 'source':
      return 'Source available'
  }
}

/** The qualifier after "N of 7 projects": "using React or TypeScript that are Live". */
export function qualifier(f: ProjFilters, skip?: Active): string {
  const act = f.active.filter(a => a !== skip)
  const parts: string[] = []
  const q = act.find(a => a.kind === 'q')
  if (q) parts.push(`matching ${activeLabel(q)}`)
  const stacks = act.filter(a => a.kind === 'stack').map(activeLabel)
  if (stacks.length) parts.push(`using ${orList(stacks)}`)
  const year = act.find(a => a.kind === 'year')
  if (year) parts.push(`from ${activeLabel(year)}`)
  const live = act.some(a => a.kind === 'live')
  const source = act.some(a => a.kind === 'source')
  if (live && source) parts.push('that are Live with source available')
  else if (live) parts.push('that are Live')
  else if (source) parts.push('with source available')
  return parts.join(' ')
}

/** The subject of the empty explanation: "the Java projects", "the 2025 projects". */
function subject(f: ProjFilters, skip: Active): string {
  const act = f.active.filter(a => a !== skip)
  const year = act.find(a => a.kind === 'year')
  const stacks = act.filter(a => a.kind === 'stack').map(activeLabel)
  const q = act.find(a => a.kind === 'q')
  const adj = [year && activeLabel(year), stacks.length && orList(stacks)]
    .filter(Boolean)
    .join(' ')
  const base = adj ? `the ${adj} projects` : 'the projects'
  return q ? `${base} matching ${activeLabel(q)}` : base
}

/**
 * The empty-state copy for the last restrictive filter: why nothing matches, and what dropping
 * that filter shows. without = the projects that match every other filter.
 */
export function explain(f: ProjFilters, without: ProjectSummary[]) {
  const last = f.active[f.active.length - 1]
  const label = activeLabel(last)
  const n = without.length
  const see =
    n === 0
      ? ''
      : n === 1
        ? ' to see it'
        : ` to see ${n === 2 ? 'both' : 'them'}`
  const who = subject(f, last)
  const allSource = n > 0 && without.every(p => p.sourceAvailable)
  let why: string
  let it = see
  switch (last.kind) {
    case 'live':
      why = `None of ${who} has a public deployment yet${allSource ? '; the work is open source instead' : ''}.`
      // "it" is the open source work.
      if (allSource) it = ' to see it'
      break
    case 'source':
      why = `None of ${who} has its code public yet.`
      break
    case 'stack':
      why = `None of ${who} uses ${label}.`
      break
    case 'year':
      why = `None of ${who} is from ${label}.`
      break
    case 'q':
      why = `Nothing in ${who} mentions ${label}.`
      break
  }
  return {
    last,
    label,
    copy: `${why} Clear the filters, or drop ${last.kind === 'q' ? 'the search' : label}${it}.`,
  }
}

/** `ls ~/projects --stack java --live` */
export function command(f: ProjFilters) {
  const args = f.active.map(a => {
    switch (a.kind) {
      case 'q':
        return `--grep "${a.value}"`
      case 'year':
        return `--year ${a.value}`
      case 'stack':
        return `--stack ${a.value}`
      case 'live':
        return '--live'
      case 'source':
        return '--source'
    }
  })
  return ['ls ~/projects', ...args].join(' ')
}
