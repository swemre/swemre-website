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

import type {ReactNode} from 'react'
import type {ArticleService} from '../services/ArticleService'
import type {ChatService} from '../services/ChatService'
import type {ContactFormService} from '../services/ContactFormService'
import type {ProjectService} from '../services/ProjectService'
import type {SearchService} from '../services/SearchService'
import type {SongService} from '../services/SongService'
import type {SiteSettingsService} from '../services/SiteSettingsService'
import type {SpecialPageService} from '../services/SpecialPageService'

// ---------- entities and services ----------

export interface Entity {
  id: string
}

export type NewEntity<T extends Entity> = Omit<T, 'id'>

export interface SwemreService<T extends Entity> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | undefined>
  create(data: NewEntity<T>): Promise<T>
  update(id: string, patch: Partial<NewEntity<T>>): Promise<T | undefined>
  remove(id: string): Promise<boolean>
}

export interface ServiceMap {
  article: ArticleService
  chat: ChatService
  contactForm: ContactFormService
  project: ProjectService
  search: SearchService
  siteSettings: SiteSettingsService
  song: SongService
  specialPage: SpecialPageService
}

export interface AsyncResult<T> {
  data: T | undefined
  loading: boolean
  /** Set when the loader rejected (API down, timeout, server error). */
  error: unknown
  retry: () => void
}

export interface AsyncSettled<T> {
  loader: () => Promise<T>
  attempt: number
  data?: T
  error?: unknown
}

// ---------- public api ----------

export type EnvSource = Record<string, string | boolean | undefined>

/** Where this website reads from and where it is served; one build per website. */
export interface SiteEnv {
  apiBase: string
  /** The website channel install (lower case) the site reads through public API v2. */
  channelKey: string
  /** Sent as `X-Read-Key` when set; a read key is public, it only selects the channel. */
  readKey?: string
  /** Absolute, without a trailing slash. */
  siteUrl: string
  /** BCP 47, for example `en`. */
  locale: string
  /** Milliseconds before a read gives up. */
  timeoutMs: number
}

// A post as the public API returns it. Every content type shares this shape; fields holds the
// values of the type's own fields, with media fields expanded to the file's details
export interface PublicPost {
  /** v1: a number; v2: a UUIDv7 string. */
  id: number | string
  typeKey: string
  slug: string
  title: string
  author: string
  fields: Record<string, unknown>
  terms: {
    id: number | string
    taxonomy: 'CATEGORY' | 'TAG'
    name: string
    slug: string
  }[]
  publishedAt: string
  lastUpdatedAt: string
  /** v2 only. */
  locale?: string
  /** v2 only: the other published languages of the same work. */
  languageVersions?: LanguageVersion[]
}

export interface LanguageVersion {
  locale: string
  slug: string
}

export interface PublicationMedia {
  id: string
  url: string
  alt?: string
  mimeType?: string
  width?: number
  height?: number
}

// A publication of public API v2 (docs/public-api-v2.md in swemre-website-api)
export interface Publication {
  id: string
  documentId: string
  workId: string
  contentType: string
  locale: string
  slug: string
  title: string
  excerpt?: string
  author?: string
  cover: PublicationMedia | null
  fields: Record<string, unknown>
  terms: {id: string; kind: 'CATEGORY' | 'TAG'; name: string; slug: string}[]
  publishedAt: string
  updatedAt?: string
  /** Detail only. */
  body?: unknown
  languageVersions?: LanguageVersion[]
}

export interface PagedContent<T> {
  content: T[]
}

// Public API v2 pages; `page` is zero-based
export interface PublicPage<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface PostListQuery {
  size?: number
  sortBy?: 'publishedAt' | 'title'
  direction?: 'ASC' | 'DESC'
  /** Slug of a category or tag the post must have. */
  term?: string
}

/** The record a form submission created in the form's table. */
export interface SubmittedForm {
  id: string
  receivedAt: string
  /** Posted keys outside the table's acceptedFieldKeys, which were not stored. */
  ignoredFields?: string[]
}

export interface PageViewInput {
  path: string
  referrer: string | null
  sessionId: string
}

// A conversation as the chat keeps it, whichever API version stored it. On v2 the token is
// `<conversation id>.<visitor token>`
export interface ChatApiMessage {
  id: number | string
  author: 'VISITOR' | 'OWNER'
  text: string
  sentAt: string
}

export interface ChatApiConversation {
  token: string
  messages: ChatApiMessage[]
}

export interface PublicApi {
  /** Throws on a failed or timed-out request; `[]` when the workspace lacks the type. */
  listPosts(type: string, query?: PostListQuery): Promise<PublicPost[]>
  getPost(type: string, slug: string): Promise<PublicPost | undefined>
  /** Throws unless the API confirms the submission. */
  submitForm(
    form: string,
    fields: Record<string, string>,
  ): Promise<SubmittedForm>
  /** v2 has no presence yet: false, so the chat says the owner replies later. */
  presence(): Promise<boolean>
  sendChatMessage(
    publicToken: string | undefined,
    text: string,
  ): Promise<ChatApiConversation>
  getConversation(publicToken: string): Promise<ChatApiConversation | undefined>
  /** v1 only; on v2 the chat polls getConversation instead. */
  conversationSocketUrl(publicToken: string): string | undefined
  recordPageView(view: PageViewInput): Promise<void>
}

// ---------- content ----------

export interface Searchable extends Entity {
  title: string
  summary?: string
  tags?: string[]
}

/** Search and link preview fields of a post; empty fields fall back to its own. */
export interface PostSeo {
  seoTitle?: string
  seoDescription?: string
  ogImageUrl?: string
}

/** The image a link preview shows; size and alt when the media field has them. */
export interface ShareImage {
  url: string
  alt?: string
  width?: number
  height?: number
}

/** The website's single site settings entry, or the defaults in config/site.ts. */
export interface SiteSettings {
  tagline: string
  contactEmail: string
  defaultOgImage: ShareImage
  logoUrl?: string
}

export interface Article extends Searchable {
  /** URL segment. */
  slug: string
  summary: string
  author: string
  /** ISO 8601, UTC. */
  createdAt: string
  /** ISO instant of the last published change. */
  updatedAt: string
  /** Minutes. */
  readingTime: number
  tags: string[]
  /** Blocks of the rich text body field, as the API returns them. */
  body?: unknown
  coverUrl?: string
  coverAlt?: string
  /** Pixels, of the original file. */
  coverWidth?: number
  /** Pixels, of the original file. */
  coverHeight?: number
  /** Vertical focal point of the cover, 0 (top) to 100 (bottom), set in the CMS. */
  coverPosition?: number
  seo: PostSeo
  shareImage?: ShareImage
}

export interface Project extends Searchable {
  /** URL segment. */
  slug: string
  summary: string
  year: number
  tags: string[]
  url?: string
  repoUrl?: string
  /** Blocks of the rich text body field, as the API returns them. */
  body?: unknown
  coverUrl?: string
  coverAlt?: string
  /** Pixels, of the original file. */
  coverWidth?: number
  /** Pixels, of the original file. */
  coverHeight?: number
  /** Vertical focal point of the cover, 0 (top) to 100 (bottom), set in the CMS. */
  coverPosition?: number
  seo: PostSeo
  shareImage?: ShareImage
}

export interface Song extends Searchable {
  artist: string
  /** Last segment of open.spotify.com/track/<id>. */
  spotifyId: string
  artworkUrl?: string
}

export interface SpecialPage extends Searchable {
  /** URL segment under /sp/. */
  slug: string
  summary: string
  version: string
  /** ISO 8601 date (YYYY-MM-DD). */
  effectiveDate: string
  /** ISO 8601 date (YYYY-MM-DD). */
  updatedAt: string
  /** Blocks of the rich text body field, as the API returns them. */
  body?: unknown
  seo: PostSeo
  shareImage?: ShareImage
}

export interface NavigationItem extends Searchable {
  to: string
}

// ---------- visitor state (localStorage) ----------

export interface ArticleInteraction {
  views: number
  liked: boolean
  favorited: boolean
  /** ISO 8601, UTC. */
  lastViewedAt?: string
}

export type ArticleInteractionState = Record<string, ArticleInteraction>

// ---------- forms ----------

export interface ContactFormInput {
  fullName: string
  email: string
  reason: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormInput, string>>

export type PreferredCallTime = '' | 'morning' | 'afternoon' | 'evening'

export interface CallbackFormInput {
  fullName: string
  phone: string
  topic: string
  /** Optional; empty when the visitor has no preference. */
  preferredTime: PreferredCallTime
  /** Optional. */
  note: string
}

export type CallbackFormErrors = Partial<
  Record<keyof CallbackFormInput, string>
>

export interface MessageFormInput {
  fullName: string
  email: string
  message: string
}

export type MessageFormErrors = Partial<Record<keyof MessageFormInput, string>>

/** `limited`: the API answered 429; `closed`: 403 FORM_CLOSED; `unreachable`: no answer at all. */
export type FormStatus =
  | 'idle'
  | 'submitting'
  | 'done'
  | 'failed'
  | 'unreachable'
  | 'limited'
  | 'closed'

// ---------- search ----------

export type SearchAction =
  | {kind: 'navigate'; to: string}
  | {kind: 'external'; href: string}
  | {kind: 'play-song'; song: Song}

export interface SearchSource<T extends Searchable> {
  category: string
  icon: IconName
  load(): Promise<T[]>
  action(item: T): SearchAction
  subtitle?(item: T): string | undefined
  keywords?(item: T): string[]
  /** How many items the empty query lists: all when omitted, none when 0. */
  featured?: number
}

export interface SearchDocument {
  /** `<category>:<entity id>`. */
  key: string
  category: string
  icon: IconName
  title: string
  subtitle?: string
  action: SearchAction
  titleText: string
  tagText: string[]
  bodyText: string
}

export type SearchDocumentLoader = () => Promise<SearchDocument[]>

export interface SearchResult {
  document: SearchDocument
  score: number
}

export interface SearchResultGroup {
  category: string
  items: SearchResult[]
}

export interface SearchSettled {
  query: string
  results: SearchResult[]
}

export interface SearchDialogContextValue {
  open: () => void
  close: () => void
}

// ---------- spotify player ----------

export interface SpotifyPlaybackState {
  isPaused: boolean
  isBuffering: boolean
  /** Milliseconds. */
  position: number
  /** Milliseconds. */
  duration: number
}

export interface SpotifyEmbedController {
  loadUri(uri: string): void
  play(): void
  togglePlay(): void
  destroy(): void
  addListener(event: 'ready', callback: () => void): void
  addListener(
    event: 'playback_update',
    callback: (event: {data: SpotifyPlaybackState}) => void,
  ): void
}

export interface SpotifyIframeApi {
  createController(
    element: HTMLElement,
    options: {uri: string; width?: number | string; height?: number | string},
    callback: (controller: SpotifyEmbedController) => void,
  ): void
}

export type SpotifyWindow = Window & {
  onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void
}

export interface PlayerState {
  current: Song | null
  isPaused: boolean
  failed: boolean
  collapsed: boolean
}

export interface PlayerContextValue {
  current: Song | null
  isPaused: boolean
  failed: boolean
  collapsed: boolean
  attachHost: (element: HTMLDivElement | null) => void
  toggle: (song: Song) => void
  togglePlayback: () => void
  setCollapsed: (collapsed: boolean) => void
  close: () => void
}

// ---------- chat ----------

export type ChatAuthor = 'visitor' | 'owner'

/** `unreachable`: the chat server did not answer the presence check. */
export type ChatPresence = 'online' | 'offline' | 'unreachable'

export interface ChatMessage {
  id: string
  author: ChatAuthor
  text: string
  /** ISO 8601, UTC. */
  sentAt: string
  /** `sending` while posted, `queued` when the API could not be reached, `sent` once stored. */
  delivery: 'sending' | 'queued' | 'sent'
}

export interface Conversation extends Entity {
  title: string
  /** ISO 8601, UTC. */
  createdAt: string
  /** ISO 8601, UTC. */
  updatedAt: string
  messages: ChatMessage[]
  /** Set once the API has stored the conversation; the only way to read it back. */
  publicToken?: string
}

export interface ChatContextValue {
  isOpen: boolean
  presence: ChatPresence
  conversations: Conversation[]
  active: Conversation | null
  open: () => void
  close: () => void
  toggle: () => void
  select: (id: string | null) => void
  start: () => void
  send: (text: string) => void
  retry: (id: string) => void
  remove: (id: string) => void
}

// ---------- sound ----------

export type SoundName =
  | 'tap'
  | 'key'
  | 'nav'
  | 'enter'
  | 'back'
  | 'toggle-on'
  | 'toggle-off'
  | 'open'
  | 'close'
  | 'cancel'
  | 'send'
  | 'success'
  | 'error'

export interface SoundTone {
  type: OscillatorType
  /** Hertz at the start of the tone. */
  from: number
  /** Hertz at the end of the tone; omit for a steady pitch. */
  to?: number
  /** Seconds. */
  duration: number
  /** Seconds after the sound starts. */
  delay?: number
  /** Peak gain, 0 to 1, before the master volume. */
  gain: number
}

export interface SoundContextValue {
  muted: boolean
  toggleMuted(): void
  play(name: SoundName): void
}

// ---------- feed ----------

/** One RSS item for songs and notes. `ref` is the song id. */
export type FeedItem =
  | {
      id: string
      kind: 'song'
      ref: string
      /** ISO 8601, UTC. */
      publishedAt: string
    }
  | {
      id: string
      kind: 'note'
      title: string
      summary: string
      /** Absolute URL or site path starting with `/`. */
      link?: string
      /** ISO 8601, UTC. */
      publishedAt: string
    }

// ---------- ui ----------

export type ThemeMode = 'light' | 'dark'

export interface ThemeContextValue {
  mode: ThemeMode
  toggle: () => void
}

export interface DocumentMeta {
  description?: string
  image?: ShareImage
  /** Set on articles: `og:type` becomes `article` with these ISO times. */
  article?: {publishedTime: string; modifiedTime: string}
  /** What the page is, for its JSON-LD; pages without it get none. */
  schema?: PageSchema
}

export type PageSchema =
  | {kind: 'home'}
  | {kind: 'list'}
  | {kind: 'article'; author: string}
  | {kind: 'project'; url?: string; repoUrl?: string; year?: number}

/** A schema.org node, written as JSON-LD. */
export type JsonLd = Record<string, unknown>

export interface DocumentTags {
  title: string
  description: string
  url: string
  image: ShareImage
  ogType: 'website' | 'article'
  twitterCard: 'summary' | 'summary_large_image'
  article?: {publishedTime: string; modifiedTime: string}
  jsonLd?: JsonLd
}

export interface ResumeModalContextValue {
  open: () => void
  openCallback: () => void
  openMessage: () => void
  close: () => void
}

export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'book'
  | 'bookmark'
  | 'chat'
  | 'check'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-up'
  | 'clock'
  | 'copy'
  | 'external'
  | 'eye'
  | 'file'
  | 'github'
  | 'hash'
  | 'heart'
  | 'info'
  | 'linkedin'
  | 'mail'
  | 'menu'
  | 'moon'
  | 'pause'
  | 'phone'
  | 'play'
  | 'plus'
  | 'repo'
  | 'rss'
  | 'search'
  | 'send'
  | 'spotify'
  | 'sun'
  | 'tag'
  | 'trash'
  | 'volume'
  | 'volume-off'
  | 'warning'
  | 'x'

export interface ErrorBoundaryProps {
  /** Names the failing area in the console message. */
  scope: string
  fallback: ReactNode
  /** A new value clears a caught error, for example the next pathname. */
  resetKey?: string
  children: ReactNode
}

export interface ErrorBoundaryState {
  failed: boolean
  resetKey?: string
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export type ButtonSize = 'sm' | 'md' | 'lg'

export type CalloutType = 'note' | 'tip' | 'warning' | 'danger'

export interface SocialLink {
  label: string
  href: string
  icon: 'github' | 'linkedin' | 'mail'
}

export interface SidebarNavItem {
  key: string
  label: string
  to: string
  active?: boolean
}

export interface SidebarNavSection {
  title: string
  icon: IconName
  items: SidebarNavItem[]
  moreTo?: string
}

export interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}
