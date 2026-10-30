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

// Data hooks. Owner: agent C. Day-0 stubs with the final signatures (they stay 'loading' until C
// implements them). In dev every hook honours ?state=<name>:<loading|empty|error>, for example
// /?state=articles:error, so templates can show each board state.
import type {
  Article,
  ArticleSummary,
  Author,
  FooterData,
  Loadable,
  MegaMenuData,
  NavItem,
  Page,
  Project,
  ProjectSummary,
  SearchResults,
  SiteSettings,
  Song,
  TermRef,
  Topic,
} from '../contract/view.ts'

const loading = {status: 'loading'} as const

/** name 'settings' */
export function useSettings(): Loadable<SiteSettings> {
  return loading
}
/** name 'page' */
export function usePage(_slug: string): Loadable<Page> {
  return loading
}
/** name 'articles'. Newest first. */
export function useArticles(_opts?: {term?: string; limit?: number}): Loadable<ArticleSummary[]> {
  return loading
}
/** name 'article' */
export function useArticle(_slug: string): Loadable<Article> {
  return loading
}
/** name 'projects'. Featured first, then by order, then newest. */
export function useProjects(_opts?: {
  term?: string
  featured?: boolean
  limit?: number
}): Loadable<ProjectSummary[]> {
  return loading
}
/** name 'project' */
export function useProject(_slug: string): Loadable<Project> {
  return loading
}
/** name 'songs'. A random pick per visit; ?seed= fixes it. */
export function useSongs(_limit?: number): Loadable<Song[]> {
  return loading
}
/** name 'topic' */
export function useTopic(_term: string): Loadable<Topic> {
  return loading
}
/** name 'terms'. Tags with counts per content type. */
export function useTerms(): Loadable<TermRef[]> {
  return loading
}
/** name 'author' */
export function useAuthor(_slug: string): Loadable<Author> {
  return loading
}
/** name 'search' */
export function useSearch(_query: string): Loadable<SearchResults> {
  return loading
}
export function useNav(): {
  items: NavItem[]
  mega: Record<'articles' | 'projects', Loadable<MegaMenuData>>
  footer: FooterData
} {
  return {items: [], mega: {articles: loading, projects: loading}, footer: {columns: [], tagline: ''}}
}
