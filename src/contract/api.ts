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

// Wire JSON of SWEPress public API v1, generated from the API's openapi-v1.json
// (npm run api:types, 3-D12) and narrowed here where the site knows more (content type keys,
// term kinds, field maps). Base: ${VITE_API_BASE}/public/v1/channels/${VITE_CHANNEL_KEY}.
// Owner: agent C. Others import, never edit; ask C for changes.
import type {Hue} from './blocks.ts'
import type {components} from './generated/api-v1.d.ts'

type Schemas = components['schemas']

export type Uuid = string
export type Instant = string

/** url is relative to VITE_API_BASE unless it starts with http or /. */
export type ApiMedia = Omit<Schemas['Media'], 'alt'> & {
  id: Uuid
  url: string
  alt?: string | null
}

export type TermKind = 'CATEGORY' | 'TAG'
export type ApiTerm = Omit<Schemas['Term'], 'kind' | 'description'> & {
  id: Uuid
  kind: TermKind
  description?: string | null
  name: string
  slug: string
}

export type ContentTypeKey = 'article' | 'project' | 'page' | 'site-settings'

// The generated types do not say what may be null; these fields may
type Narrowed =
  | 'contentType'
  | 'cover'
  | 'terms'
  | 'section'
  | 'fields'
  | 'excerpt'
  | 'author'
  | 'seoTitle'
  | 'seoDescription'
  | 'canonicalUrl'

export type ApiPublicationSummary = Omit<
  Schemas['PublicationSummary'],
  Narrowed
> & {
  id: Uuid
  documentId: Uuid
  workId: Uuid
  contentType: ContentTypeKey
  locale: string
  slug: string
  title: string
  cover: ApiMedia | null
  /** Per content type, see FieldMap. */
  fields: Record<string, unknown>
  terms: ApiTerm[]
  section: ApiTerm | null
  publishedAt: Instant
  noindex: boolean
  excerpt?: string | null
  author?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  canonicalUrl: string | null
}

export type ApiBody = NonNullable<Schemas['Publication']['body']> & {
  blocks: unknown[]
}

export type ApiPublication = ApiPublicationSummary &
  Omit<Schemas['Publication'], Narrowed | 'body' | 'languageVersions'> & {
    body?: ApiBody
    languageVersions: {locale: string; slug: string}[]
  }

export type ApiPage<T> = Omit<
  Schemas['PageResultPublicationSummary'],
  'items'
> & {
  items: T[]
  total: number
  page: number
  size: number
}

// TODO(4-D06): redirects are read on v2 until v1 has them, so this one is hand-written
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

export type ApiErrorBody = Omit<
  Schemas['Problem'],
  'key' | 'errors' | 'message'
> & {
  key:
    | 'NOT_FOUND'
    | 'VALIDATION_FAILED'
    | 'FORM_CLOSED'
    | 'RATE_LIMITED'
    | 'CHANNEL_READ_DENIED'
    | 'UNAVAILABLE'
    | 'INTERNAL'
    | 'API_KEY_MISSING'
    | 'API_KEY_INVALID'
    | 'API_KEY_PERMISSION_MISSING'
    | (string & {})
  message: string
  errors: {field: string; message: string}[]
  /** 500 answers carry it; the 500 page shows it. */
  requestId?: string
  /** 503 answers during planned maintenance carry the window. */
  maintenance?: {from: Instant; until: Instant}
}

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
