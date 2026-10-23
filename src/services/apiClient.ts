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

import type {PostSeo} from '../types/type'

// The website only calls the public endpoints of swemre-website-api
export const apiBase: string =
  import.meta.env.VITE_API_BASE ?? 'http://localhost:8080/api'

// The website reads one workspace of swemre-website-api; its key selects the content
export const workspaceKey: string =
  import.meta.env.VITE_WORKSPACE_KEY ?? 'swemre-website'
export const workspacePath = `/public/v1/workspaces/${workspaceKey}`

// A post as the public API returns it. Every content type shares this shape; fields holds the
// values of the type's own fields, with media fields expanded to the file's details
export interface PublicPost {
  id: number
  typeKey: string
  slug: string
  title: string
  author: string
  fields: Record<string, unknown>
  terms: {
    id: number
    taxonomy: 'CATEGORY' | 'TAG'
    name: string
    slug: string
  }[]
  publishedAt: string
  lastUpdatedAt: string
}

export const fieldString = (
  fields: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = fields[key]
  return typeof value === 'string' && value !== '' ? value : undefined
}

export const fieldNumber = (
  fields: Record<string, unknown>,
  key: string,
): number | undefined => {
  const value = fields[key]
  return typeof value === 'number' ? value : undefined
}

// A media field arrives as {id, url, ...}; url is a path on the API
export const fieldMediaUrl = (
  fields: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = fields[key]
  if (!value || typeof value !== 'object' || !('url' in value)) return undefined
  const url = String((value as {url: unknown}).url)
  return url.startsWith('http') ? url : `${apiBase}${url}`
}

const mediaValue = (
  fields: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined => {
  const value = fields[key]
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined
}

export const postSeo = (fields: Record<string, unknown>): PostSeo => ({
  seoTitle: fieldString(fields, 'seoTitle'),
  seoDescription: fieldString(fields, 'seoDescription'),
  ogImageUrl: fieldMediaUrl(fields, 'ogImage'),
})

// Without altText the cover is decorative and keeps alt=""
export const fieldMediaAlt = (
  fields: Record<string, unknown>,
  key: string,
): string | undefined => {
  const alt = mediaValue(fields, key)?.altText
  return typeof alt === 'string' && alt.trim() !== '' ? alt.trim() : undefined
}

export const fieldMediaSize = (
  fields: Record<string, unknown>,
  key: string,
  dimension: 'width' | 'height',
): number | undefined => {
  const size = mediaValue(fields, key)?.[dimension]
  return typeof size === 'number' && size > 0 ? size : undefined
}

export const tagNames = (post: PublicPost): string[] =>
  post.terms.filter(term => term.taxonomy === 'TAG').map(term => term.name)

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function publicRequest<T>(
  path: string,
  options: {method?: 'GET' | 'POST'; body?: unknown} = {},
): Promise<T | undefined> {
  const response = await fetch(`${apiBase}${path}`, {
    method: options.method ?? 'GET',
    headers:
      options.body === undefined
        ? {Accept: 'application/json'}
        : {Accept: 'application/json', 'Content-Type': 'application/json'},
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (response.status === 404) return undefined
  if (response.status === 204) return undefined

  const text = await response.text()
  const json: unknown = text ? JSON.parse(text) : undefined

  if (!response.ok) {
    const message =
      json && typeof json === 'object' && 'message' in json
        ? String((json as {message: unknown}).message)
        : response.statusText
    throw new ApiError(response.status, message)
  }
  return json as T
}

// Visitor identity for analytics: random, kept per browser session, never linked to a person
export function visitorSessionId(): string {
  const key = 'swemre:analytics-session'
  try {
    const existing = sessionStorage.getItem(key)
    if (existing) return existing
    const created = crypto.randomUUID()
    sessionStorage.setItem(key, created)
    return created
  } catch {
    return crypto.randomUUID()
  }
}

export interface PagedContent<T> {
  content: T[]
}

// Pages wait for their loader to settle, so a failed request must still resolve.
// A missing API shows empty lists and "not found" pages instead of a spinner.
export async function safely<T>(
  load: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await load()
  } catch (error) {
    console.warn('swemre-website-api unavailable', error)
    return fallback
  }
}
