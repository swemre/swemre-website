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
// Path resolution for RouteResolver (resolver.tsx). Owner: agent C.
import {ApiError, type ApiPublication} from '../contract/api.ts'
import type {
  NotFoundKind,
  ResolvedRoute,
  TemplateKey,
} from '../contract/templates.ts'
import {toSettings} from './adapters.ts'
import {UNREACHABLE} from './client.ts'
import {canonicalHref, selectTemplate} from './rules.ts'
import {fetchResource, resources} from './store.ts'

export type Resolution =
  | {redirect: string}
  | {route: Omit<ResolvedRoute, 'params'>; params: Record<string, string>}

export const FULL: ResolvedRoute['chrome'] = {nav: true, footer: true}
/** The 503 page: the logo bar, no footer. */
const UNAVAILABLE: ResolvedRoute['chrome'] = {
  nav: true,
  footer: false,
  bar: 'logo',
}
/** Sections whose missing pages show the single-page not-found board. */
const PAGE_SECTIONS = new Set(['policies', 'newsletter', 'authors'])
/** Routes that render their template even when the CMS has no page for them. */
const FIXED: Record<string, TemplateKey> = {
  '/': 'home',
  '/articles': 'articles',
  '/projects': 'projects',
  '/search': 'search',
  '/newsletter': 'form',
  '/contact': 'form',
  '/resume': 'form',
  '/call-back': 'form',
  '/newsletter/confirmed': 'newsletter-status',
  '/newsletter/unsubscribed': 'newsletter-status',
}

export function requestId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(4)), b =>
    b.toString(16).padStart(2, '0'),
  ).join('')
}

function notFound(path: string, segments: string[]): Resolution {
  const first = segments[0] ?? ''
  const kind: NotFoundKind =
    segments.length === 2 && first === 'articles'
      ? 'article'
      : segments.length === 2 && first === 'projects'
        ? 'project'
        : segments.length === 2 && PAGE_SECTIONS.has(first)
          ? 'single'
          : 'page'
  return {
    route: {template: 'not-found', path, notFoundKind: kind, chrome: FULL},
    params: {
      slug: segments.at(-1) ?? '',
      section: segments.length === 2 ? first : '',
    },
  }
}

export function failure(path: string, e: unknown): Resolution {
  const status = e instanceof ApiError ? e.status : 500
  const body = e instanceof ApiError ? e.body : undefined
  if (status === 503 || status === UNREACHABLE) {
    const m = body?.maintenance
    return {
      route: {template: 'unavailable', path, chrome: UNAVAILABLE},
      params: m ? {maintenanceFrom: m.from, maintenanceUntil: m.until} : {},
    }
  }
  return {
    route: {template: 'error', path, chrome: FULL},
    params: {requestId: body?.requestId ?? requestId()},
  }
}

/** The maintenance window from settings, when it covers now. */
async function maintenance(): Promise<
  {from: string; until: string} | undefined
> {
  try {
    const m = toSettings(
      await fetchResource(...resources.pub('site-settings')),
    ).maintenance
    const now = Date.now()
    return m && Date.parse(m.from) <= now && now < Date.parse(m.until)
      ? m
      : undefined
  } catch {
    return undefined
  }
}

export async function resolvePath(rawPath: string): Promise<Resolution> {
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath
  if (path !== rawPath) return {redirect: path}
  const segments = path.split('/').filter(Boolean).map(decodeURIComponent)
  if (segments[0] === 'sp' && segments.length === 2)
    return {redirect: `/policies/${segments[1]}`}

  const topic =
    segments.length === 3 &&
    segments[0] === 'articles' &&
    segments[1] === 'topic'
  if (segments.length > 2 && !topic) return notFound(path, segments)
  const slug = topic
    ? 'topic'
    : segments.length === 0
      ? 'home'
      : segments[segments.length - 1]

  const window = await maintenance()
  if (window) {
    return {
      route: {template: 'unavailable', path, chrome: UNAVAILABLE},
      params: {maintenanceFrom: window.from, maintenanceUntil: window.until},
    }
  }

  let pub: ApiPublication | undefined
  try {
    pub = await fetchResource(...resources.pub(slug))
  } catch (e) {
    return failure(path, e)
  }
  const params: Record<string, string> = {
    slug: segments.at(-1) ?? 'home',
    ...(topic ? {term: segments[2]} : {}),
  }
  if (!pub) {
    const fixed = topic ? 'topic' : FIXED[path]
    return fixed
      ? {route: {template: fixed, path, chrome: FULL}, params}
      : notFound(path, segments)
  }
  const template = selectTemplate(pub)
  if (template === 'not-found') return notFound(path, segments)
  if (!topic) {
    const canonical = canonicalHref(pub)
    if (canonical !== path) return {redirect: canonical}
  }
  return {route: {template, path, publication: pub, chrome: FULL}, params}
}
