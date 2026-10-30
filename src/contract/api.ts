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

// Wire JSON of SWEPress public API v2, as served by the real API and by mock/plugin.ts.
// Base: ${VITE_API_BASE}/public/v2/channels/${VITE_CHANNEL_KEY}. Header X-Read-Key on reads.
// Owner: agent C. Others import, never edit; ask C for changes.
import type {Hue} from './blocks.ts'

export type Uuid = string
/** ISO-8601 UTC timestamp. */
export type Instant = string

export interface ApiMedia {
  id: Uuid
  /** Relative to VITE_API_BASE unless it starts with http or /. */
  url: string
  alt?: string | null
  mimeType?: string
  width?: number
  height?: number
}

export type TermKind = 'CATEGORY' | 'TAG'
export interface ApiTerm {
  id: Uuid
  kind: TermKind
  name: string
  slug: string
  /** GET /terms only. */
  publicationCount?: number
  description?: string | null
  /** Mock extension (not in API v2 yet): related topic slugs, shown for an empty topic. */
  related?: string[]
}

export type ContentTypeKey =
  'article' | 'project' | 'page' | 'song' | 'site-settings'

/** An item of GET /publications. */
export interface ApiPublicationSummary {
  id: Uuid
  documentId: Uuid
  workId: Uuid
  contentType: ContentTypeKey
  locale: string
  slug: string
  title: string
  excerpt?: string | null
  author?: string | null
  cover: ApiMedia | null
  /** Per content type, see FieldMap. */
  fields: Record<string, unknown>
  /** The website-page distribution's section (if any) and its tags. */
  terms: ApiTerm[]
  /** The website-page distribution's category; it is the site area and the first URL segment. */
  section: ApiTerm | null
  publishedAt: Instant
  updatedAt?: Instant
  seoTitle?: string | null
  seoDescription?: string | null
  canonicalUrl: string | null
  noindex: boolean
  /** Locales the item is published in on this channel, its own included (SWEPress api#183). */
  languages?: string[]
}

/** GET /publications/{slug}. */
export interface ApiPublication extends ApiPublicationSummary {
  body?: ApiBody
  languageVersions: {locale: string; slug: string}[]
}

/** Bodies are block lists (see contract/blocks.ts). */
export interface ApiBody {
  blocks: unknown[]
}

export interface ApiPage<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface ApiRedirect {
  from: string
  to: string
  locale: string
}

export interface ApiListQuery {
  contentType?: ContentTypeKey
  /** Term slug, category or tag. */
  term?: string
  page?: number
  /** 1..100 */
  size?: number
}

/** Multi choices (chips) are string arrays; an empty optional field is null. */
export type FormValue = string | boolean | null | string[]
export interface ApiFormSubmission {
  fields: Record<string, FormValue>
}
/** 201 of POST /forms/{key}/submissions. */
export interface ApiSubmittedForm {
  id: Uuid
  receivedAt: Instant
  submittedAt?: Instant
  ignoredFields?: string[]
  /** Form-specific answer data. newsletter-confirm returns name, email and topics (topic slugs). */
  result?: Record<string, FormValue>
}

export interface ApiErrorBody {
  key:
    | 'NOT_FOUND'
    | 'VALIDATION_FAILED'
    | 'FORM_CLOSED'
    | 'RATE_LIMITED'
    | 'CHANNEL_READ_DENIED'
    | 'UNAVAILABLE'
    | 'INTERNAL'
    | (string & {})
  message: string
  errors: {field: string; message: string}[]
  /** 500 answers carry it; the 500 page shows it. */
  requestId?: string
  /** 503 answers during planned maintenance carry the window. */
  maintenance?: {from: Instant; until: Instant}
}

/** The fields object per content type. All optional; adapters apply defaults. */
export interface FieldMap {
  article: {
    summary?: string
    readingTime?: number
    coverStyle?: 'image' | 'code' | 'none'
    codeCover?: string
    codeCoverFile?: string
    codeCoverRepo?: string
    coverCaption?: string
    revision?: number
    faq?: {q: string; a: string}[]
    /** Accent hue of the cover and card. */
    hue?: Hue
    /** The big glyph on a code cover, e.g. "{ }". */
    codeCoverGlyph?: string
    /** Slugs of articles or projects for "More from the workshop"; computed when absent. */
    related?: string[]
    /** Slugs that override the date neighbours of the previous / next links. */
    previous?: string
    next?: string
  }
  project: {
    summary?: string
    status?: 'now-building' | 'live' | 'source-only' | 'archived'
    version?: string
    year?: number
    language?: string
    url?: string
    repoUrl?: string
    docsUrl?: string
    privateRepo?: boolean
    featured?: boolean
    order?: number
    codeCover?: string
    codeCoverFile?: string
    hue?: Hue
    /** Monogram on project tiles, e.g. "SP". */
    glyph?: string
    /** Short line for compact rows ("More from the workshop"), e.g. "Block editor CMS". */
    tagline?: string
    /** Slugs of related articles and projects; computed from shared tags when absent. */
    related?: string[]
  }
  page: {
    lead?: string
    eyebrow?: string
    policyVersion?: string
    effectiveDate?: string
    changelogUrl?: string
    pdfUrl?: string
    showToc?: boolean
    showPrint?: boolean
  }
  song: {
    /** Position in the liked playlist; ?seed=0 picks the first ones in this order. */
    order?: number
    artist?: string
    album?: string
    year?: number
    spotifyUrl?: string
    artwork?: ApiMedia
  }
  'site-settings': {
    tagline?: string
    contactEmail?: string
    footerTagline?: string
    heroEyebrow?: string
    heroLead?: string
    nowBuilding?: string
    latestArticle?: string
    newsletterCadence?: string
    statusUrl?: string
    maintenance?: {from: string; until: string} | null
    likedSongsTotal?: number
    /** The projects activity strip: commits per week, oldest first, and the latest commit. */
    activity?: {
      weeks: number[]
      latest?: {at: Instant; project: string; message: string}
    }
    social?: {
      github?: string
      youtube?: string
      linkedin?: string
      spotify?: string
    }
  }
}

export type FormKey =
  | 'newsletter'
  | 'contact'
  | 'callback-request'
  | 'newsletter-confirm'
  | 'newsletter-unsubscribe'

/** The client agent C implements in src/data/client.ts; mock and real API both satisfy it. */
export interface PublicApiClient {
  list(query: ApiListQuery): Promise<ApiPage<ApiPublicationSummary>>
  listAll(
    query: Omit<ApiListQuery, 'page' | 'size'>,
  ): Promise<ApiPublicationSummary[]>
  /** 404 resolves to undefined. */
  get(slug: string): Promise<ApiPublication | undefined>
  terms(kind?: TermKind): Promise<ApiTerm[]>
  redirects(): Promise<ApiRedirect[]>
  submit(
    form: FormKey,
    fields: Record<string, FormValue>,
  ): Promise<ApiSubmittedForm>
  mediaUrl(media: ApiMedia): string
}

/** Thrown by the client for non-2xx answers other than a read's 404. */
export class ApiError extends Error {
  readonly status: number
  readonly body?: ApiErrorBody
  constructor(status: number, body?: ApiErrorBody) {
    super(body?.message ?? `HTTP ${status}`)
    this.status = status
    this.body = body
  }
}
