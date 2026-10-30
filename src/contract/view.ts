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

// What templates and components receive. Adapters in src/data turn ApiPublication into these;
// templates never read `fields` themselves. Owner: agent C.
import type {Block, Hue} from './blocks.ts'
import type {FormKey} from './api.ts'

export type {Hue}
export interface Link {
  label: string
  href: string
  external?: boolean
}
export interface TermRef {
  slug: string
  name: string
  kind: 'CATEGORY' | 'TAG'
  /** Topic page for tags: /articles/topic/<slug>. */
  href: string
  count?: number
  description?: string
}
export interface Media {
  url: string
  alt: string
  width?: number
  height?: number
}
export interface CodeCover {
  code: string
  filename?: string
  language?: string
  repo?: string
}
/** The last crumb has no href. */
export interface Crumb {
  label: string
  href?: string
}
export interface Seo {
  title: string
  description?: string
  canonical: string
  noindex: boolean
}

export interface ArticleSummary {
  slug: string
  href: string
  title: string
  summary: string
  publishedAt: string
  updatedAt: string
  readingTime?: number
  /** The section category name, shown in the path line (articles /backend/ slug.md). */
  category?: string
  tags: TermRef[]
  cover?: Media
  codeCover?: CodeCover
  coverCaption?: string
  coverStyle: 'image' | 'code' | 'none'
}
export interface Article extends ArticleSummary {
  body: Block[]
  author: AuthorRef
  revision?: number
  faq: {q: string; a: string}[]
  seo: Seo
  prev?: ArticleSummary
  next?: ArticleSummary
  /** "More from the workshop": articles and projects mixed, max 4. */
  related: (ArticleSummary | ProjectSummary)[]
}

export type ProjectStatus = 'now-building' | 'live' | 'source-only' | 'archived'
export interface ProjectSummary {
  slug: string
  href: string
  title: string
  summary: string
  status?: ProjectStatus
  version?: string
  year?: number
  language?: string
  stack: TermRef[]
  cover?: Media
  codeCover?: CodeCover
  featured: boolean
  order?: number
  url?: string
  repoUrl?: string
  docsUrl?: string
  privateRepo: boolean
  updatedAt: string
}
export interface Project extends ProjectSummary {
  body: Block[]
  seo: Seo
  crumbs: Crumb[]
  relatedArticles: ArticleSummary[]
  relatedProjects: ProjectSummary[]
}

export interface Page {
  slug: string
  href: string
  title: string
  eyebrow?: string
  lead?: string
  section?: TermRef
  /** Plain tag slugs, layout-* included. */
  tags: string[]
  /** The layout-* tag without its prefix, if any. */
  layout?: string
  body: Block[]
  updatedAt: string
  policyVersion?: string
  effectiveDate?: string
  changelogUrl?: string
  pdfUrl?: string
  showToc: boolean
  showPrint: boolean
  formKey?: FormKey
  seo: Seo
  crumbs: Crumb[]
}

export interface Song {
  slug: string
  title: string
  artist: string
  album?: string
  year?: number
  href: string
  artwork?: Media
}
export interface AuthorRef {
  name: string
  role?: string
  href: string
  avatar?: Media
}
export interface Author extends AuthorRef {
  headline?: string
  body: Block[]
  writingSince?: number
  availability?: string
  availableFrom?: string
  links: Link[]
  currentProject?: ProjectSummary
}
export interface Topic {
  term: TermRef
  articles: ArticleSummary[]
  projects: ProjectSummary[]
  others: TermRef[]
}
export interface SiteSettings {
  tagline: string
  contactEmail: string
  footerTagline: string
  heroEyebrow?: string
  heroLead?: string
  nowBuilding?: string
  latestArticle?: string
  newsletterCadence?: string
  statusUrl?: string
  maintenance?: {from: string; until: string} | null
  likedSongsTotal?: number
  social: {github?: string; youtube?: string; linkedin?: string; spotify?: string}
}

export interface NavItem {
  key: 'home' | 'articles' | 'projects'
  label: string
  href: string
  mega?: 'articles' | 'projects'
}
export interface MegaMenuData {
  featured: (ArticleSummary | ProjectSummary)[]
  topics: TermRef[]
  links: Link[]
}
export interface FooterData {
  columns: {title: string; links: Link[]}[]
  tagline: string
}

export type SearchKind = 'article' | 'project'
export interface SearchResult {
  kind: SearchKind
  title: string
  summary?: string
  href: string
  /** "Oct 23, 2026" or the project year. */
  meta?: string
  tags: string[]
  score: number
}
export interface SearchResults {
  query: string
  total: number
  groups: {kind: SearchKind; items: SearchResult[]}[]
}

/** Every data hook returns this; templates render one board state per status. */
export type Loadable<T> =
  | {status: 'loading'}
  | {status: 'ready'; data: T}
  | {status: 'empty'}
  | {status: 'error'; error: unknown; retry: () => void}

export function isArticle(
  item: ArticleSummary | ProjectSummary,
): item is ArticleSummary {
  return 'publishedAt' in item
}
