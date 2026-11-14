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
// A small keyed cache of API reads shared by every hook and the resolver: one request per key,
// subscribers re-render when it settles, retry drops the entry and loads again. Owner: agent C.
import {useCallback, useSyncExternalStore} from 'react'
import {
  ApiError,
  type ApiPublication,
  type ApiPublicationSummary,
  type ApiTerm,
  type ContentTypeKey,
} from '../contract/api.ts'
import {api} from './client.ts'

// FR-SIT-031 A failed read tries again after 2, 4 and 8 s, then shows the error; a 404 is an
// answer. FR-SIT-032 A ready entry is fresh for 5 minutes; after that its next use shows it and
// loads a new copy behind it. Per tab, in memory; expiry is checked on use, so nothing runs idle.
const RETRY_WAITS_MS = [2000, 4000, 8000]
const FRESH_MS = 5 * 60 * 1000
/** A failed entry the resolver meets again after this long starts a new set of tries. */
const RETRY_AGAIN_AFTER_MS = 8000

export type Entry<T> =
  | {status: 'loading'; promise: Promise<T>; attempt: number}
  | {
      status: 'ready'
      data: T
      promise: Promise<T>
      loadedAt: number
      refreshing?: boolean
    }
  | {
      status: 'error'
      error: unknown
      promise: Promise<T>
      attempt: number
      failedAt: number
    }

const cache = new Map<string, Entry<unknown>>()
const listeners = new Map<string, Set<() => void>>()
const waits = new Map<string, ReturnType<typeof setTimeout>>()

function notify(key: string) {
  listeners.get(key)?.forEach(l => l())
}

function cancelWait(key: string) {
  clearTimeout(waits.get(key))
  waits.delete(key)
}

const isNotFound = (e: unknown) => e instanceof ApiError && e.status === 404

function start<T>(key: string, loader: () => Promise<T>): Entry<T> {
  cancelWait(key)
  let resolve: (data: T) => void = () => {}
  let reject: (error: unknown) => void = () => {}
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  promise.catch(() => {})
  const entry: Extract<Entry<T>, {status: 'loading'}> = {
    status: 'loading',
    promise,
    attempt: 0,
  }
  cache.set(key, entry)
  const run = (attempt: number) => {
    loader().then(
      data => {
        if (cache.get(key) !== entry) return
        cache.set(key, {status: 'ready', data, promise, loadedAt: Date.now()})
        resolve(data)
        notify(key)
      },
      (error: unknown) => {
        if (cache.get(key) !== entry) return
        if (!isNotFound(error) && attempt < RETRY_WAITS_MS.length) {
          entry.attempt = attempt + 1
          waits.set(
            key,
            setTimeout(() => {
              waits.delete(key)
              if (cache.get(key) === entry) run(attempt + 1)
            }, RETRY_WAITS_MS[attempt]),
          )
          return
        }
        cache.set(key, {
          status: 'error',
          error,
          promise,
          attempt,
          failedAt: Date.now(),
        })
        reject(error)
        notify(key)
      },
    )
  }
  run(0)
  return entry
}

// The old copy stays on screen while the new one loads; a failed refresh keeps it
function refresh<T>(
  key: string,
  loader: () => Promise<T>,
  current: Extract<Entry<T>, {status: 'ready'}>,
): Entry<T> {
  const marked: Entry<T> = {...current, refreshing: true}
  cache.set(key, marked)
  loader().then(
    data => {
      if (cache.get(key) !== marked) return
      cache.set(key, {
        status: 'ready',
        data,
        promise: Promise.resolve(data),
        loadedAt: Date.now(),
      })
      notify(key)
    },
    () => {
      if (cache.get(key) !== marked) return
      cache.set(key, {...current, refreshing: false})
      notify(key)
    },
  )
  return marked
}

/** The entry of key: started on first use, refreshed behind its copy when stale. */
export function entry<T>(key: string, loader: () => Promise<T>): Entry<T> {
  const cached = cache.get(key) as Entry<T> | undefined
  if (!cached) return start(key, loader)
  if (
    cached.status === 'ready' &&
    !cached.refreshing &&
    Date.now() - cached.loadedAt > FRESH_MS
  )
    return refresh(key, loader, cached)
  return cached
}

/** For code outside React (the resolver); an entry that failed a while ago starts again. */
export function fetchResource<T>(
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key) as Entry<T> | undefined
  if (cached?.status === 'error') {
    if (Date.now() - cached.failedAt > RETRY_AGAIN_AFTER_MS) reload(key, loader)
    else return cached.promise
  }
  return entry(key, loader).promise
}

/** The value of key when it is already loaded. */
export function peek<T>(key: string): T | undefined {
  const e = cache.get(key) as Entry<T> | undefined
  return e?.status === 'ready' ? e.data : undefined
}

/** The Try button: a new set of tries; the only way out of an error. */
export function reload<T>(key: string, loader: () => Promise<T>) {
  cancelWait(key)
  cache.delete(key)
  start(key, loader)
  notify(key)
}

export function useResource<T>(
  key: string,
  loader: () => Promise<T>,
): Entry<T> & {retry: () => void} {
  const subscribe = useCallback(
    (cb: () => void) => {
      let set = listeners.get(key)
      if (!set) listeners.set(key, (set = new Set()))
      set.add(cb)
      return () => set.delete(cb)
    },
    [key],
  )
  // The loader is keyed: the same key always loads the same thing.
  const snapshot = useSyncExternalStore(subscribe, () => entry(key, loader))
  const retry = useCallback(() => reload(key, loader), [key]) // eslint-disable-line react-hooks/exhaustive-deps
  return {...snapshot, retry}
}

// The resources the site reads. Keys name the request.
export const resources = {
  list: (type: ContentTypeKey) =>
    [`list:${type}`, () => api.listAll({contentType: type})] as [
      string,
      () => Promise<ApiPublicationSummary[]>,
    ],
  pub: (slug: string) =>
    [`pub:${slug}`, () => api.get(slug)] as [
      string,
      () => Promise<ApiPublication | undefined>,
    ],
  tags: () =>
    ['terms:TAG', () => api.terms('TAG')] as [string, () => Promise<ApiTerm[]>],
}
