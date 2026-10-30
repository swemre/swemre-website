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
// Client-side search over articles and projects: every word of the query must match the
// title, summary or tags; titles weigh most. Groups keep the listing order (articles newest
// first, projects featured first). Owner: agent C.
import type {
  ArticleSummary,
  ProjectSummary,
  SearchKind,
  SearchResult,
  SearchResults,
} from '../contract/view.ts'

const DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'Europe/Amsterdam',
})

interface Doc {
  result: Omit<SearchResult, 'score'>
  title: string
  summary: string
  tags: string
  rank: number
}

const norm = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
const words = (q: string) =>
  norm(q)
    .split(/[^a-z0-9.+#]+/)
    .filter(Boolean)

/** 3 for a title match (+1 at a word start), 2 for a tag, 1 for the summary; 0 = no match. */
function scoreWord(doc: Doc, w: string): number {
  let s = 0
  const t = doc.title.indexOf(w)
  if (t >= 0) s += 3 + (t === 0 || /[^a-z0-9]/.test(doc.title[t - 1]) ? 1 : 0)
  if (doc.tags.includes(w)) s += 2
  if (doc.summary.includes(w)) s += 1
  return s
}

export function searchIndex(
  articles: ArticleSummary[],
  projects: ProjectSummary[],
) {
  const docs: Doc[] = [
    ...articles.map((a, i) => ({
      result: {
        kind: 'article' as const,
        title: a.title,
        summary: a.summary,
        href: a.href,
        meta: DATE.format(new Date(a.publishedAt)),
        tags: a.tags.map(t => t.name),
      },
      title: norm(a.title),
      summary: norm(a.summary),
      tags: norm(a.tags.map(t => t.name).join(' ')),
      rank: i,
    })),
    ...projects.map((p, i) => ({
      result: {
        kind: 'project' as const,
        title: p.title,
        summary: p.summary,
        href: p.href,
        meta: p.year ? String(p.year) : undefined,
        tags: p.stack.map(t => t.name),
      },
      title: norm(p.title),
      summary: norm(p.summary),
      tags: norm(p.stack.map(t => t.name).join(' ')),
      rank: i,
    })),
  ]

  function search(query: string): SearchResults {
    const ws = words(query)
    const hits: {result: SearchResult; rank: number}[] = []
    if (ws.length) {
      for (const doc of docs) {
        const scores = ws.map(w => scoreWord(doc, w))
        if (scores.every(s => s > 0)) {
          const score = scores.reduce((a, b) => a + b, 0)
          hits.push({result: {...doc.result, score}, rank: doc.rank})
        }
      }
    }
    const group = (kind: SearchKind) =>
      hits
        .filter(h => h.result.kind === kind)
        .sort((a, b) => a.rank - b.rank)
        .map(h => h.result)
    const groups = (['article', 'project'] as const)
      .map(kind => ({kind, items: group(kind)}))
      .filter(g => g.items.length > 0)
    return {query: query.trim(), total: hits.length, groups}
  }

  return {search}
}
