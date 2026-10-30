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

// Per-browser reactions (Q4): saved slugs under 'swemre:saved' (read by /articles?saved=1),
// likes under 'swemre:liked'; every toggle notifies the other buttons on the page.
import {useCallback, useSyncExternalStore} from 'react'
import {useCopied} from './clipboard.ts'

export const SAVED_KEY = 'swemre:saved'

export const LIKED_KEY = 'swemre:liked'

const EVENT = 'swemre:reactions'

function read(key: string): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(v)
      ? v.filter((s): s is string => typeof s === 'string')
      : []
  } catch {
    return []
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

export function useToggle(key: string, slug: string): [boolean, () => void] {
  const on = useSyncExternalStore(
    subscribe,
    () => read(key).includes(slug),
    () => false,
  )
  const toggle = useCallback(() => {
    const list = read(key)
    const next = list.includes(slug)
      ? list.filter(s => s !== slug)
      : [...list, slug]
    localStorage.setItem(key, JSON.stringify(next))
    window.dispatchEvent(new Event(EVENT))
  }, [key, slug])
  return [on, toggle]
}

/** Share: the Web Share API where there is one, else copy the link. */
export function useShare(title: string): [boolean, () => void] {
  const [copied, copy] = useCopied()
  const share = useCallback(() => {
    const url = window.location.href.split('#')[0]
    if (typeof navigator.share === 'function') {
      navigator.share({title, url}).catch(() => {})
      return
    }
    copy(url)
  }, [title, copy])
  return [copied, share]
}
