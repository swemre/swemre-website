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

// List state in the URL query (spec 2.6): read a key, and patch several keys at once. A patch
// value of undefined, '' or false removes the key, so the default state has a clean URL.
import {useCallback, useEffect, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {intlLocale} from '../../../i18n/index.ts'

export type Patch = Record<string, string | number | boolean | undefined>

export function useQuery() {
  const [params, setParams] = useSearchParams()
  const set = useCallback(
    (patch: Patch, opts?: {replace?: boolean}) =>
      setParams(
        prev => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(patch)) {
            if (v === undefined || v === '' || v === false) next.delete(k)
            else next.set(k, v === true ? '1' : String(v))
          }
          return next
        },
        {replace: opts?.replace, preventScrollReset: true},
      ),
    [setParams],
  )
  return {params, get: (k: string) => params.get(k) ?? '', set}
}

/** Reads a JSON array of strings from localStorage (saved slugs); [] when missing or blocked. */
export function readList(key: string): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(v) ? v.filter(s => typeof s === 'string') : []
  } catch {
    return []
  }
}

/**
 * The time of the browser's last good load of a list (spec Q16): stored when the list is ready,
 * shown when it fails. undefined when the browser never loaded it (the line is then hidden).
 */
export function useLastLoad(key: string, ready: boolean): Date | undefined {
  const storeKey = `swemre:last-load:${key}`
  const [last] = useState(() => {
    try {
      const v = localStorage.getItem(storeKey)
      return v ? new Date(v) : undefined
    } catch {
      return undefined
    }
  })
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(storeKey, new Date().toISOString())
    } catch {
      // storage blocked: nothing to remember
    }
  }, [ready, storeKey])
  return last
}

/** "Oct 27, 2026, 09:12" */
export function formatStamp(d: Date): string {
  const date = d.toLocaleDateString(intlLocale('en-US'), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const time = d.toLocaleTimeString(intlLocale('en-GB'), {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${date}, ${time}`
}
