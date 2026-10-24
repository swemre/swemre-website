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

import {siteEnv} from '../config/env.ts'
import type {PostSeo, PublicPost, ShareImage} from '../types/type'

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
  return url.startsWith('http') ? url : `${siteEnv.apiBase}${url}`
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

// Without alt text the cover is decorative and keeps alt=""; v2 names it alt in media fields
// (fromPublication renames only the cover's)
export const fieldMediaAlt = (
  fields: Record<string, unknown>,
  key: string,
): string | undefined => {
  const media = mediaValue(fields, key)
  const alt = media?.altText ?? media?.alt
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

// The API serves a 1200x630 JPEG crop of a raster image for link previews; any other file
// answers 400 to it (docs/public-api-v2.md in swemre-website-api)
const OG_VARIANT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
]
const API_MEDIA_FILE = /\/media\/[^/?#]+\/file$/

// The first of the media fields that is set, as a link preview image: the API's preview crop
// when it has one, else the file itself
export const shareImage = (
  fields: Record<string, unknown>,
  keys: string[],
): ShareImage | undefined => {
  for (const key of keys) {
    const url = fieldMediaUrl(fields, key)
    if (url) {
      const alt = fieldMediaAlt(fields, key)
      if (
        API_MEDIA_FILE.test(url) &&
        OG_VARIANT_TYPES.includes(String(mediaValue(fields, key)?.mimeType))
      ) {
        return {url: `${url}?variant=og`, alt, width: 1200, height: 630}
      }
      return {
        url,
        alt,
        width: fieldMediaSize(fields, key, 'width'),
        height: fieldMediaSize(fields, key, 'height'),
      }
    }
  }
  return undefined
}

export const tagNames = (post: PublicPost): string[] =>
  post.terms.filter(term => term.taxonomy === 'TAG').map(term => term.name)

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

// For data that has a sensible default (site settings): a failed request resolves with it
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
