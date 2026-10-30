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
import type {
  ApiPublication,
  ApiPublicationSummary,
  ApiTerm,
  ContentTypeKey,
} from '../contract/api.ts'
import {api} from './client.ts'

export type Entry<T> =
  | {status: 'loading'; promise: Promise<T>}
  | {status: 'ready'; data: T; promise: Promise<T>}
  | {status: 'error'; error: unknown; promise: Promise<T>}

const cache = new Map<string, Entry<unknown>>()
const listeners = new Map<string, Set<() => void>>()

function notify(key: string) {
  listeners.get(key)?.forEach(l => l())
}

function start<T>(key: string, loader: () => Promise<T>): Entry<T> {
  const promise = loader()
  const entry: Entry<T> = {status: 'loading', promise}
  cache.set(key, entry)
  promise.then(
    data => {
      if (cache.get(key) !== entry) return
      cache.set(key, {status: 'ready', data, promise})
      notify(key)
    },
    (error: unknown) => {
      if (cache.get(key) !== entry) return
      cache.set(key, {status: 'error', error, promise})
      notify(key)
    },
  )
  return entry
}

/** The entry of key, started on first use. */
export function entry<T>(key: string, loader: () => Promise<T>): Entry<T> {
  return (cache.get(key) as Entry<T> | undefined) ?? start(key, loader)
}

/** Promise form for code outside React (the resolver). Errors reject; a failed entry is retried. */
export function fetchResource<T>(
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key) as Entry<T> | undefined
  if (cached?.status === 'error') reload(key, loader)
  return entry(key, loader).promise
}

/** The value of key when it is already loaded. */
export function peek<T>(key: string): T | undefined {
  const e = cache.get(key) as Entry<T> | undefined
  return e?.status === 'ready' ? e.data : undefined
}

/** Drops a failed or stale entry and loads it again. */
export function reload<T>(key: string, loader: () => Promise<T>) {
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
