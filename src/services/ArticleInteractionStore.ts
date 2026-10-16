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

import type {ArticleInteraction, ArticleInteractionState} from '../types/type'

const KEY = 'swemre:article-interactions'
const EMPTY: ArticleInteraction = {views: 0, liked: false, favorited: false}

const listeners = new Set<() => void>()
let cache: ArticleInteractionState | null = null

function read(): ArticleInteractionState {
  if (cache) return cache
  try {
    cache = JSON.parse(
      localStorage.getItem(KEY) ?? '{}',
    ) as ArticleInteractionState
  } catch {
    cache = {}
  }
  return cache
}

function write(next: ArticleInteractionState) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage full or unavailable: keep in-memory state only.
  }
  listeners.forEach(listener => listener())
}

function update(
  id: string,
  patch: (current: ArticleInteraction) => Partial<ArticleInteraction>,
) {
  const state = read()
  const current = state[id] ?? EMPTY
  write({...state, [id]: {...current, ...patch(current)}})
}

export const articleInteractionStore = {
  subscribe(callback: () => void) {
    listeners.add(callback)
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) {
        cache = null
        callback()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(callback)
      window.removeEventListener('storage', onStorage)
    }
  },
  readAll: read,
  readOne: (id: string): ArticleInteraction => read()[id] ?? EMPTY,
  toggleLike: (id: string) => update(id, c => ({liked: !c.liked})),
  toggleFavorite: (id: string) => update(id, c => ({favorited: !c.favorited})),
  registerView: (id: string) =>
    update(id, c => ({
      views: c.views + 1,
      lastViewedAt: new Date().toISOString(),
    })),
}
