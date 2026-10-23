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

import type {ArticleService} from '../services/ArticleService'
import type {ChatService} from '../services/ChatService'
import type {ContactFormService} from '../services/ContactFormService'
import type {ProjectService} from '../services/ProjectService'
import type {SearchService} from '../services/SearchService'
import type {SongService} from '../services/SongService'
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
  song: SongService
  specialPage: SpecialPageService
}

export interface AsyncResult<T> {
  data: T | undefined
  loading: boolean
}

export interface AsyncSettled<T> {
  loader: () => Promise<T>
  data: T
}

// ---------- content ----------

export interface Searchable extends Entity {
  title: string
  summary?: string
  tags?: string[]
}

export interface Article extends Searchable {
  /** URL segment. */
  slug: string
  summary: string
  author: string
  /** ISO 8601, UTC. */
  createdAt: string
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

export interface ContactForm extends Entity {
  kind: 'resume-request'
  fullName: string
  email: string
  reason: string
  /** ISO 8601, UTC. */
  createdAt: string
}

export interface ContactFormInput {
  fullName: string
  email: string
  reason: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormInput, string>>

export interface CallbackRequest extends Entity {
  kind: 'callback-request'
  fullName: string
  phone: string
  topic: string
  /** ISO 8601, UTC. */
  createdAt: string
}

export interface CallbackFormInput {
  fullName: string
  phone: string
  topic: string
}

export type CallbackFormErrors = Partial<
  Record<keyof CallbackFormInput, string>
>

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

export type ChatPresence = 'online' | 'offline'

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
  image?: string
}

export interface ResumeModalContextValue {
  open: () => void
  openCallback: () => void
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
