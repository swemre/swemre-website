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

// The Articles list model: page size, the saved-articles key, view and sort.
import type {ArticleSummary} from '../../contract/view.ts'
import {t} from '../../i18n/index.ts'

export const PAGE_SIZE = 9

/** Saved article slugs (JSON array), written by the article page's Save button. */
export const SAVED_KEY = 'swemre:saved'

export type View = 'covers' | 'text'
export type Sort = 'newest' | 'oldest'

export const SORTS: {value: Sort; label: string}[] = [
  {value: 'newest', label: t('articles.sort.newest')},
  {value: 'oldest', label: t('articles.sort.oldest')},
]

export function sortArticles(list: ArticleSummary[], sort: Sort) {
  const s = [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  return sort === 'oldest' ? s.reverse() : s
}

/** The active filter: a topic (slug and display name), the saved list, and the chip expander. */
export interface FilterState {
  topic: string
  topicName: string
  saved: boolean
  more: boolean
}
