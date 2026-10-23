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

import type {
  SearchDocument,
  SearchDocumentLoader,
  SearchResult,
  SearchSource,
  Searchable,
} from '../types/type'

export class SearchService {
  private readonly loaders: SearchDocumentLoader[] = []
  private readonly featured = new Map<string, number>()

  register<T extends Searchable>(source: SearchSource<T>): this {
    if (source.featured !== undefined) {
      this.featured.set(source.category, source.featured)
    }
    this.loaders.push(async () =>
      (await source.load().catch(() => [])).map(item => ({
        key: `${source.category}:${item.id}`,
        category: source.category,
        icon: source.icon,
        title: item.title,
        subtitle: source.subtitle ? source.subtitle(item) : item.summary,
        action: source.action(item),
        titleText: item.title.toLowerCase(),
        tagText: (item.tags ?? []).map(tag => tag.toLowerCase()),
        bodyText: [item.summary ?? '', ...(source.keywords?.(item) ?? [])]
          .join(' ')
          .toLowerCase(),
      })),
    )
    return this
  }

  async search(query: string, limit = 20): Promise<SearchResult[]> {
    const documents = (
      await Promise.all(this.loaders.map(load => load()))
    ).flat()
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)

    if (terms.length === 0) {
      const shown = new Map<string, number>()
      return documents
        .filter(document => {
          const count = shown.get(document.category) ?? 0
          shown.set(document.category, count + 1)
          return count < (this.featured.get(document.category) ?? Infinity)
        })
        .slice(0, limit)
        .map(document => ({document, score: 0}))
    }

    return documents
      .map(document => ({document, score: score(document, terms)}))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }
}

function score(document: SearchDocument, terms: string[]): number {
  let total = 0
  for (const term of terms) {
    let best = 0
    if (document.titleText.startsWith(term)) best = 100
    else if (document.titleText.split(/\W+/).some(w => w.startsWith(term)))
      best = 70
    else if (document.titleText.includes(term)) best = 50
    else if (document.tagText.some(tag => tag.startsWith(term))) best = 40
    else if (document.bodyText.includes(term)) best = 15
    if (best === 0) return 0
    total += best
  }
  return total
}
