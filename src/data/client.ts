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
// PublicApiClient over fetch: the same code talks to the mock (VITE_API_MODE=mock) and to
// swemre-website-api (live). Owner: agent C.
import {
  ApiError,
  type ApiErrorBody,
  type ApiListQuery,
  type ApiMedia,
  type ApiPage,
  type ApiPublication,
  type ApiPublicationSummary,
  type ApiRedirect,
  type ApiSubmittedForm,
  type ApiTerm,
  type FormKey,
  type FormValue,
  type PublicApiClient,
  type TermKind,
} from '../contract/api.ts'
import {DEFAULT_LOCALE, locale as pageLocale} from '../i18n/index.ts'
import {
  API_BASE,
  API_TIMEOUT_MS,
  CHANNEL_KEY,
  DEV_SWITCHES,
  READ_KEY,
} from './env.ts'

/** Status used for answers that never came: network failure or timeout. */
export const UNREACHABLE = 0

/** In dev and mock mode, ?fault= on the page URL is forwarded to the mock as X-Mock-Fault. */
function faultHeader(): Record<string, string> {
  if (!DEV_SWITCHES || typeof window === 'undefined') return {}
  const fault = new URLSearchParams(window.location.search).get('fault')
  return fault ? {'X-Mock-Fault': fault} : {}
}

export function createClient(
  opts: {
    base?: string
    channel?: string
    readKey?: string
    timeoutMs?: number
    locale?: string
  } = {},
): PublicApiClient {
  const base = opts.base ?? API_BASE
  const root = `${base}/public/v2/channels/${encodeURIComponent(opts.channel ?? CHANNEL_KEY)}`
  const readKey = opts.readKey ?? READ_KEY
  const timeoutMs = opts.timeoutMs ?? API_TIMEOUT_MS
  // Reads ask for the page's language; anything missing in it falls back to the default one.
  const locale = opts.locale ?? pageLocale
  const fallback = locale === DEFAULT_LOCALE ? undefined : DEFAULT_LOCALE

  async function call<T>(
    path: string,
    init: RequestInit = {},
    notFound?: 'undefined',
  ): Promise<T | undefined> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    let res: Response
    try {
      res = await fetch(root + path, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'X-Read-Key': readKey,
          ...faultHeader(),
          ...init.headers,
        },
      })
    } catch (e) {
      const timedOut = controller.signal.aborted
      throw new ApiError(UNREACHABLE, {
        key: timedOut ? 'TIMEOUT' : 'UNREACHABLE',
        message: timedOut ? `No answer within ${timeoutMs} ms` : String(e),
        errors: [],
      })
    } finally {
      clearTimeout(timer)
    }
    if (res.status === 404 && notFound) return undefined
    if (!res.ok) {
      let body: ApiErrorBody | undefined
      try {
        body = (await res.json()) as ApiErrorBody
      } catch {
        body = undefined
      }
      const requestId =
        body?.requestId ?? res.headers.get('X-Request-Id') ?? undefined
      throw new ApiError(res.status, body ? {...body, requestId} : undefined)
    }
    return (await res.json()) as T
  }

  const qs = (params: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params))
      if (v !== undefined && v !== '') q.set(k, String(v))
    const s = q.toString()
    return s ? `?${s}` : ''
  }

  const listIn = async (query: ApiListQuery, lang: string) =>
    (await call<ApiPage<ApiPublicationSummary>>(
      `/publications${qs({locale: lang, 'content-type': query.contentType, term: query.term, page: query.page, size: query.size})}`,
    ))!
  const listAllIn = async (query: ApiListQuery, lang: string) => {
    const items: ApiPublicationSummary[] = []
    for (let page = 0; ; page++) {
      const res = await listIn({...query, page, size: 100}, lang)
      items.push(...res.items)
      if (items.length >= res.total || res.items.length === 0) return items
    }
  }

  const client: PublicApiClient = {
    list(query: ApiListQuery) {
      return listIn(query, locale)
    },
    async listAll(query) {
      const own = await listAllIn(query, locale)
      if (!fallback) return own
      // Every publication once: its own-language version when there is one, else the default.
      const base = await listAllIn(query, fallback)
      const mine = new Map(own.map(p => [p.workId, p]))
      return [
        ...base.map(p => mine.get(p.workId) ?? p),
        ...own.filter(p => !base.some(b => b.workId === p.workId)),
      ]
    },
    async get(slug: string) {
      const get = (lang: string) =>
        call<ApiPublication>(
          `/publications/${encodeURIComponent(slug)}${qs({locale: lang})}`,
          {},
          'undefined',
        )
      if (!fallback) return get(locale)
      // The default version lists the item's languages, so a missing translation costs no 404.
      // An API without the list gets the old order: own language, then the default.
      const base = await get(fallback)
      if (base?.languages && !base.languages.includes(locale)) return base
      return (await get(locale)) ?? base
    },
    async terms(kind?: TermKind) {
      const own = (await call<ApiTerm[]>(`/terms${qs({kind, locale})}`))!
      if (own.length || !fallback) return own
      return (await call<ApiTerm[]>(`/terms${qs({kind, locale: fallback})}`))!
    },
    async redirects() {
      return (await call<ApiRedirect[]>('/redirects'))!
    },
    async submit(form: FormKey, fields: Record<string, FormValue>) {
      const res = await call<ApiSubmittedForm>(`/forms/${form}/submissions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({fields}),
      })
      return res!
    },
    mediaUrl(media: ApiMedia) {
      return /^(https?:)?\/\//.test(media.url) ||
        media.url.startsWith(base + '/')
        ? media.url
        : base + media.url
    },
  }
  return client
}

/** The one client the site uses. */
export const api: PublicApiClient = createClient()
