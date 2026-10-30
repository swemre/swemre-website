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

// Mock public API v2, served by the Vite dev and preview servers when VITE_API_MODE=mock.
// Answers ${VITE_API_BASE}/public/v2/channels/:channel/... from mock/seed/*.json, with the same
// JSON as swemre-website-api (docs/mock-api.md describes every route). Owner: agent C.
import {randomBytes, randomUUID} from 'node:crypto'
import {readFileSync} from 'node:fs'
import type {IncomingMessage, ServerResponse} from 'node:http'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import type {Connect, Plugin} from 'vite'
import type {
  ApiErrorBody,
  ApiPublication,
  ApiPublicationSummary,
  ApiSubmittedForm,
  FormValue,
} from '../src/contract/api.ts'
import {loadMockData, type MockData} from './seed.ts'
import {validateSubmission} from './forms.ts'

export interface MockOptions {
  /** VITE_API_BASE as a path, default /api. */
  apiBase?: string
  /** VITE_CHANNEL_KEY, default swemre-website. */
  channel?: string
  /** VITE_READ_KEY, default local-mock. */
  readKey?: string
}

const HERE = dirname(fileURLToPath(import.meta.url))
const PLURAL: Record<string, string> = {
  article: 'articles',
  project: 'projects',
  page: 'pages',
  song: 'songs',
  author: 'authors',
  'site-settings': 'settings',
}
/** The fixed maintenance window a 503 fault reports (09:00 to 09:30 CET on the test day). */
const MAINTENANCE = {
  from: '2026-10-27T08:00:00Z',
  until: '2026-10-27T08:30:00Z',
}
const SLOW_MS = 3000
const TIMEOUT_MS = 30000

type Res = ServerResponse

function send(
  res: Res,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(body === undefined ? '' : JSON.stringify(body))
}

function error(
  res: Res,
  status: number,
  key: string,
  message: string,
  extra: Partial<ApiErrorBody> = {},
) {
  const body: ApiErrorBody = {key, message, errors: [], ...extra}
  send(res, status, body)
}

const STATUS_ERRORS: Record<number, [string, string]> = {
  400: ['VALIDATION_FAILED', 'The request is not valid'],
  401: [
    'CHANNEL_READ_DENIED',
    'The channel does not exist or the read key is missing or wrong',
  ],
  403: ['FORM_CLOSED', 'This form is closed'],
  404: ['NOT_FOUND', 'Not found'],
  429: ['RATE_LIMITED', 'Too many requests; try again later'],
  500: ['INTERNAL', 'The server ran into an error'],
  502: ['BAD_GATEWAY', 'An upstream service did not answer correctly'],
  503: ['UNAVAILABLE', 'swemre.com is being updated'],
  504: ['GATEWAY_TIMEOUT', 'The server did not answer in time'],
}

/** Answers an injected or simulated error status with the API's body shape. */
function faultAnswer(res: Res, status: number) {
  const [key, message] = STATUS_ERRORS[status] ?? ['ERROR', `HTTP ${status}`]
  const extra: Partial<ApiErrorBody> = {}
  if (status >= 500) extra.requestId = randomBytes(4).toString('hex')
  if (status === 503) extra.maintenance = MAINTENANCE
  if (status === 429) res.setHeader('Retry-After', '60')
  error(res, status, key, message, extra)
}

/**
 * Parses X-Mock-Fault (or ?fault= on the API URL): a comma list of `<fault>` (every request) or
 * `<resource>:<fault>`, where fault is an HTTP status, `timeout` or `slow`.
 */
function pickFault(
  req: IncomingMessage,
  url: URL,
  resources: string[],
): string | undefined {
  const raw = String(
    req.headers['x-mock-fault'] ?? url.searchParams.get('fault') ?? '',
  )
  for (const part of raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)) {
    const i = part.lastIndexOf(':')
    if (i < 0) return part
    if (resources.includes(part.slice(0, i))) return part.slice(i + 1)
  }
  return undefined
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

function summary(p: ApiPublication): ApiPublicationSummary {
  const item: Partial<ApiPublication> = {...p}
  delete item.body
  delete item.languageVersions
  return item as ApiPublicationSummary
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  const text = Buffer.concat(chunks).toString('utf8')
  return text ? JSON.parse(text) : {}
}

/** Remembers newsletter sign-ups of this server run, so confirm tokens echo the real values. */
const subscriptions = new Map<string, Record<string, FormValue>>()
const DEFAULT_SUBSCRIBER: Record<string, FormValue> = {
  name: 'Priya Shah',
  email: 'priya.shah@lumen.dev',
  topics: ['java', 'architecture'],
}

export function createMockMiddleware(
  opts: MockOptions = {},
): Connect.NextHandleFunction {
  const apiBase = (opts.apiBase ?? '/api').replace(/\/$/, '')
  const channel = opts.channel ?? 'swemre-website'
  const readKey = opts.readKey ?? 'local-mock'
  const prefix = `${apiBase}/public/v2/channels/`
  const load = (): MockData =>
    loadMockData(join(HERE, 'seed'), join(HERE, 'media'), apiBase, channel)

  return (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://mock.local')
    if (!url.pathname.startsWith(prefix)) return next()
    handle(req, res, url).catch((e: unknown) => {
      console.error('[mock-api]', e)
      faultAnswer(res, 500)
    })
  }

  async function handle(req: IncomingMessage, res: Res, url: URL) {
    const [ch, ...rest] = url.pathname
      .slice(prefix.length)
      .split('/')
      .map(decodeURIComponent)
    const route = rest.join('/')
    const method = req.method ?? 'GET'
    res.setHeader('X-Request-Id', randomUUID())

    // Media files are the one route without the read key (browsers load them by URL).
    const mediaMatch = /^media\/([^/]+)\/file$/.exec(route)
    if (method === 'GET' && mediaMatch && ch === channel) {
      const file = load().media.get(mediaMatch[1])
      if (!file) return error(res, 404, 'NOT_FOUND', 'No such media file')
      res.statusCode = 200
      res.setHeader(
        'Content-Type',
        file.media.mimeType ?? 'application/octet-stream',
      )
      res.setHeader('Cache-Control', 'public, max-age=604800')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      return res.end(readFileSync(file.file))
    }

    const isForm =
      method === 'POST' && /^forms\/[^/]+\/submissions$/.test(route)
    if (ch !== channel || (!isForm && req.headers['x-read-key'] !== readKey)) {
      return faultAnswer(res, 401)
    }

    const data = load()
    const resources = resourcesOf(method, route, url, data)
    const fault = pickFault(req, url, resources)
    if (fault === 'timeout') {
      await delay(TIMEOUT_MS)
      return faultAnswer(res, 504)
    }
    if (fault === 'slow') await delay(SLOW_MS)
    else if (fault && /^\d{3}$/.test(fault))
      return faultAnswer(res, Number(fault))

    if (method === 'GET' && route === 'publications')
      return listPublications(res, url, data)
    if (method === 'GET' && route.startsWith('publications/')) {
      return getPublication(res, url, data, route.slice('publications/'.length))
    }
    if (method === 'GET' && route === 'terms') {
      const kind = url.searchParams.get('kind')
      if (kind && kind !== 'CATEGORY' && kind !== 'TAG') {
        return error(
          res,
          400,
          'VALIDATION_FAILED',
          'kind must be CATEGORY or TAG',
        )
      }
      const terms = data.terms
        .filter(t => !kind || t.kind === kind)
        .filter(t => (t.publicationCount ?? 0) > 0 || t.kind === 'TAG')
        .sort((a, b) => a.name.localeCompare(b.name))
      return send(res, 200, terms)
    }
    if (method === 'GET' && route === 'redirects')
      return send(res, 200, data.redirects)
    if (isForm) return submitForm(req, res, route.split('/')[1])
    return error(res, 404, 'NOT_FOUND', `No route ${method} ${route}`)
  }

  function resourcesOf(
    method: string,
    route: string,
    url: URL,
    data: MockData,
  ): string[] {
    if (route === 'publications') {
      const type = url.searchParams.get('content-type')
      return ['publications', ...(type ? [PLURAL[type] ?? type] : [])]
    }
    if (route.startsWith('publications/')) {
      const slug = route.slice('publications/'.length)
      const pub = data.publications.find(p => p.slug === slug)
      return [
        'publication',
        slug,
        ...(pub ? [pub.contentType, PLURAL[pub.contentType]] : []),
      ]
    }
    if (method === 'POST') return ['forms', route.split('/')[1]]
    return [route.split('/')[0]]
  }

  function listPublications(res: Res, url: URL, data: MockData) {
    const q = url.searchParams
    const page = Number(q.get('page') ?? 0)
    const size = Number(q.get('size') ?? 20)
    if (
      !Number.isInteger(page) ||
      page < 0 ||
      !Number.isInteger(size) ||
      size < 1 ||
      size > 100
    ) {
      return error(
        res,
        400,
        'VALIDATION_FAILED',
        'page must be 0 or more and size 1 to 100',
        {
          errors: [{field: 'size', message: 'must be between 1 and 100'}],
        },
      )
    }
    const type = q.get('content-type')
    const term = q.get('term')
    const all = data.publications
      .filter(p => !type || p.contentType === type)
      .filter(p => !term || p.terms.some(t => t.slug === term))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    send(res, 200, {
      items: all.slice(page * size, page * size + size).map(summary),
      total: all.length,
      page,
      size,
    })
  }

  function getPublication(res: Res, url: URL, data: MockData, slug: string) {
    const pub = data.publications.find(p => p.slug === slug)
    if (pub) return send(res, 200, pub)
    const moved = data.redirects.find(r => r.from === slug)
    if (moved) {
      const target = `${url.pathname.slice(0, -slug.length)}${encodeURIComponent(moved.to)}`
      return send(res, 301, undefined, {Location: target})
    }
    error(res, 404, 'NOT_FOUND', `No publication with slug "${slug}"`)
  }

  async function submitForm(req: IncomingMessage, res: Res, key: string) {
    let body: unknown
    try {
      body = await readJson(req)
    } catch {
      return error(res, 400, 'VALIDATION_FAILED', 'The body is not JSON')
    }
    const fields = ((body as {fields?: unknown}).fields ?? {}) as Record<
      string,
      FormValue
    >
    const outcome = validateSubmission(key, fields)
    if (outcome.kind === 'unknown')
      return error(res, 404, 'NOT_FOUND', `No form "${key}"`)

    const email = String(fields.email ?? fields.contact ?? '')
    if (email.startsWith('fail@')) return faultAnswer(res, 504)
    if (email.startsWith('slow@')) await delay(SLOW_MS)

    if (outcome.errors.length) {
      return error(res, 400, 'VALIDATION_FAILED', 'Some fields need a fix', {
        errors: outcome.errors,
      })
    }
    const now = new Date().toISOString()
    const answer: ApiSubmittedForm = {
      id: randomUUID(),
      receivedAt: now,
      submittedAt: now,
      ignoredFields: outcome.ignored,
    }
    if (key === 'newsletter') {
      const token = randomBytes(8).toString('hex')
      subscriptions.set(token, fields)
      answer.result = {status: 'pending_confirmation', token}
    }
    if (key === 'newsletter-confirm') {
      const sub = subscriptions.get(String(fields.token))
      answer.result = sub
        ? {
            name: sub.name ?? null,
            email: sub.email ?? null,
            topics: sub.topics ?? [],
          }
        : DEFAULT_SUBSCRIBER
    }
    send(res, 201, answer)
  }
}

/** The Vite plugin: mounts the mock on the dev and the preview server. */
export function mockApi(opts: MockOptions = {}): Plugin {
  return {
    name: 'swemre-mock-api',
    configureServer(server) {
      server.middlewares.use(createMockMiddleware(opts))
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMockMiddleware(opts))
    },
  }
}
