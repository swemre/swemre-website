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
// Data hooks: every template reads the API through these. Owner: agent C.
// Each returns a Loadable: loading -> ready | empty | error (with retry). Reads are cached per
// request (store.ts), so many hooks on one page cost one call per resource.
// In dev and mock mode every hook honours ?state=<name>:<loading|empty|error>[,<name>:<status>],
// for example /?state=articles:error, so templates can show each board state.
import {useMemo} from 'react'
import {useLocation} from 'react-router-dom'
import type {ApiPublicationSummary} from '../contract/api.ts'
import type {
  Activity,
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
  TermRef,
  Topic,
} from '../contract/view.ts'
import {
  blocksOf,
  byNewest,
  byProjectOrder,
  crumbsOf,
  isReservedTag,
  seoOf,
  termRef,
  toArticleSummary,
  toPage,
  toProjectSummary,
  toSettings,
} from './adapters.ts'
import {DEV_SWITCHES} from './env.ts'
import {
  FOOTER,
  NAV_ITEMS,
  footerWith,
  megaArticles,
  megaProjects,
} from './nav.ts'
import {t} from '../i18n/index.ts'
import {AUTHOR, AUTHOR_SLUG, authorBody, authorRef} from './author.ts'
import {searchIndex} from './search.ts'
import {resources, useResource, type Entry} from './store.ts'

type Res<T> = Entry<T> & {retry: () => void}
type Forced = 'loading' | 'empty' | 'error' | undefined

/** Reads ?state=name:status (dev and mock mode only). */
function useForced(name: string): Forced {
  const {search} = useLocation()
  if (!DEV_SWITCHES) return undefined
  const spec = new URLSearchParams(search).get('state') ?? ''
  for (const part of spec.split(',')) {
    const [n, s] = part.split(':')
    if (n === name && (s === 'loading' || s === 'empty' || s === 'error'))
      return s
  }
  return undefined
}

const data = <T>(r: Res<T>): T =>
  (r as Extract<Entry<T>, {status: 'ready'}>).data

/**
 * Combines several reads into one Loadable. build runs when all are ready; undefined or an empty
 * array means 'empty'.
 */
function settle<T>(
  forced: Forced,
  parts: Res<unknown>[],
  build: () => T | undefined,
): Loadable<T> {
  const retry = () => parts.forEach(p => p.status === 'error' && p.retry())
  if (forced === 'loading') return {status: 'loading'}
  if (forced === 'empty') return {status: 'empty'}
  if (forced === 'error')
    return {status: 'error', error: new Error('forced by ?state='), retry}
  const failed = parts.find(p => p.status === 'error')
  if (failed)
    return {status: 'error', error: (failed as {error: unknown}).error, retry}
  if (parts.some(p => p.status === 'loading')) return {status: 'loading'}
  const value = build()
  if (value === undefined || (Array.isArray(value) && value.length === 0))
    return {status: 'empty'}
  return {status: 'ready', data: value}
}

// Shared reads --------------------------------------------------------------------------------

function useList(type: 'article' | 'project' | 'page') {
  return useResource(...resources.list(type))
}
function usePub(slug: string) {
  return useResource(...resources.pub(slug))
}

const articleSummaries = (items: ApiPublicationSummary[]) =>
  items.map(toArticleSummary).sort(byNewest)
const projectSummaries = (items: ApiPublicationSummary[]) =>
  items.map(toProjectSummary).sort(byProjectOrder)

/** Article topic tags with their article counts, most used first (terms order on ties). */
function articleTopics(
  articles: ApiPublicationSummary[],
  tags: {slug: string; name: string}[],
) {
  const counts = new Map<string, number>()
  for (const a of articles) {
    for (const t of a.terms) {
      if (t.kind === 'TAG' && !isReservedTag(t.slug))
        counts.set(t.slug, (counts.get(t.slug) ?? 0) + 1)
    }
  }
  // Ties keep the order of GET /terms (the CMS's order; the boards follow it).
  const order = new Map(tags.map((t, i) => [t.slug, i]))
  return [...counts.entries()]
    .sort(
      (a, b) => b[1] - a[1] || (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0),
    )
    .map(([slug, count]) => {
      const term = articles
        .flatMap(a => a.terms)
        .find(t => t.slug === slug && t.kind === 'TAG')!
      const full = tags.find(t => t.slug === slug)
      return termRef({...term, ...full, kind: 'TAG'}, count)
    })
}

// Hooks ---------------------------------------------------------------------------------------

/** name 'settings' */
export function useSettings(): Loadable<SiteSettings> {
  const forced = useForced('settings')
  const pub = usePub('site-settings')
  return useMemo(
    () => settle(forced, [pub], () => toSettings(data(pub))),
    [forced, pub],
  )
}

/** name 'activity'. The projects activity strip, from the site settings; empty without weeks. */
export function useActivity(): Loadable<Activity> {
  const forced = useForced('activity')
  const pub = usePub('site-settings')
  return useMemo(
    () =>
      settle(forced, [pub], () => {
        const a = (data(pub)?.fields as {activity?: Activity} | undefined)
          ?.activity
        return a?.weeks?.length ? {weeks: a.weeks, latest: a.latest} : undefined
      }),
    [forced, pub],
  )
}

/** name 'page' */
export function usePage(slug: string): Loadable<Page> {
  const forced = useForced('page')
  const pub = usePub(slug)
  return useMemo(
    () =>
      settle(forced, [pub], () => {
        const p = data(pub)
        return p ? toPage(p) : undefined
      }),
    [forced, pub],
  )
}

/** name 'articles'. Newest first. term filters by tag (or section) slug. */
export function useArticles(opts?: {
  term?: string
  limit?: number
}): Loadable<ArticleSummary[]> {
  const forced = useForced('articles')
  const list = useList('article')
  const term = opts?.term
  const limit = opts?.limit
  return useMemo(
    () =>
      settle(forced, [list], () => {
        const items = data(list).filter(
          p => !term || p.terms.some(t => t.slug === term),
        )
        return articleSummaries(items).slice(0, limit)
      }),
    [forced, list, term, limit],
  )
}

function neighbours(
  all: ArticleSummary[],
  slug: string,
  f: Record<string, unknown>,
) {
  const i = all.findIndex(a => a.slug === slug)
  const pick = (s: unknown) => all.find(a => a.slug === s)
  return {
    prev: pick(f.previous) ?? all[i + 1],
    next: pick(f.next) ?? (i > 0 ? all[i - 1] : undefined),
  }
}

/** Related items: the explicit slugs, else items sharing the most tags. */
function relatedOf(
  pub: ApiPublicationSummary,
  articles: ArticleSummary[],
  projects: ProjectSummary[],
  max: number,
): (ArticleSummary | ProjectSummary)[] {
  const explicit = (pub.fields.related as string[] | undefined) ?? []
  const pool = [...articles, ...projects].filter(x => x.slug !== pub.slug)
  if (explicit.length) {
    return explicit
      .map(s => pool.find(x => x.slug === s))
      .filter(x => x !== undefined)
      .slice(0, max)
  }
  const tags = new Set(pub.terms.map(t => t.slug))
  const score = (x: ArticleSummary | ProjectSummary) =>
    ('tags' in x ? x.tags : x.stack).filter(t => tags.has(t.slug)).length
  return pool
    .map(x => ({x, s: score(x)}))
    .filter(e => e.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, max)
    .map(e => e.x)
}

/** name 'article' */
export function useArticle(slug: string): Loadable<Article> {
  const forced = useForced('article')
  const pub = usePub(slug)
  const articles = useList('article')
  const projects = useList('project')
  return useMemo(
    () =>
      settle(forced, [pub, articles, projects], () => {
        const p = data(pub)
        if (!p || p.contentType !== 'article') return undefined
        const all = articleSummaries(data(articles))
        const allProjects = projectSummaries(data(projects))
        const f = p.fields
        return {
          ...toArticleSummary(p),
          body: blocksOf(p),
          author: authorRef(),
          revision: f.revision as number | undefined,
          faq: (f.faq as {q: string; a: string}[] | undefined) ?? [],
          seo: seoOf(p),
          ...neighbours(all, p.slug, f),
          related: relatedOf(p, all, allProjects, 4),
        }
      }),
    [forced, pub, articles, projects],
  )
}

/** name 'projects'. Featured first, then by order, then most recently updated. */
export function useProjects(opts?: {
  term?: string
  featured?: boolean
  limit?: number
}): Loadable<ProjectSummary[]> {
  const forced = useForced('projects')
  const list = useList('project')
  const {term, featured, limit} = opts ?? {}
  return useMemo(
    () =>
      settle(forced, [list], () =>
        projectSummaries(
          data(list).filter(p => !term || p.terms.some(t => t.slug === term)),
        )
          .filter(p => featured === undefined || p.featured === featured)
          .slice(0, limit),
      ),
    [forced, list, term, featured, limit],
  )
}

/** name 'project' */
export function useProject(slug: string): Loadable<Project> {
  const forced = useForced('project')
  const pub = usePub(slug)
  const articles = useList('article')
  const projects = useList('project')
  return useMemo(
    () =>
      settle(forced, [pub, articles, projects], () => {
        const p = data(pub)
        if (!p || p.contentType !== 'project') return undefined
        const related = relatedOf(
          p,
          articleSummaries(data(articles)),
          projectSummaries(data(projects)),
          8,
        )
        return {
          ...toProjectSummary(p),
          body: blocksOf(p),
          seo: seoOf(p),
          crumbs: crumbsOf(p),
          relatedArticles: related
            .filter((x): x is ArticleSummary => 'publishedAt' in x)
            .slice(0, 3),
          relatedProjects: related
            .filter((x): x is ProjectSummary => !('publishedAt' in x))
            .slice(0, 2),
        }
      }),
    [forced, pub, articles, projects],
  )
}

/** name 'topic'. A tag with no articles (e.g. kotlin) is ready with empty lists. */
export function useTopic(term: string): Loadable<Topic> {
  const forced = useForced('topic')
  const articles = useList('article')
  const projects = useList('project')
  const tags = useResource(...resources.tags())
  return useMemo(
    () =>
      settle(forced, [articles, projects, tags], () => {
        const t = data(tags).find(x => x.slug === term)
        if (!t || isReservedTag(t.slug)) return undefined
        const topics = articleTopics(data(articles), data(tags))
        const own = articleSummaries(
          data(articles).filter(p =>
            p.terms.some(x => x.kind === 'TAG' && x.slug === term),
          ),
        )
        return {
          term: termRef(t, own.length),
          articles: own,
          projects: projectSummaries(
            data(projects).filter(p =>
              p.terms.some(x => x.kind === 'TAG' && x.slug === term),
            ),
          ),
          others: topics.filter(x => x.slug !== term),
          related: t.related?.length
            ? t.related.map(
                slug =>
                  topics.find(x => x.slug === slug) ??
                  termRef(data(tags).find(x => x.slug === slug) ?? t, 0),
              )
            : undefined,
        }
      }),
    [forced, articles, projects, tags, term],
  )
}

/** name 'terms'. The article topics (tags used by articles) with article counts, most used first. */
export function useTerms(): Loadable<TermRef[]> {
  const forced = useForced('terms')
  const articles = useList('article')
  const tags = useResource(...resources.tags())
  return useMemo(
    () =>
      settle(forced, [articles, tags], () =>
        articleTopics(data(articles), data(tags)),
      ),
    [forced, articles, tags],
  )
}

/** name 'author'. The author page is the site's own; only the project and stack come from the API. */
export function useAuthor(slug: string): Loadable<Author> {
  const forced = useForced('author')
  const projects = useList('project')
  const tags = useResource(...resources.tags())
  return useMemo(
    () =>
      settle(forced, [projects, tags], () => {
        if (slug !== AUTHOR_SLUG) return undefined
        const current = data(projects).find(
          x => x.slug === AUTHOR.currentProject,
        )
        const stack = AUTHOR.stack
          .map(s => data(tags).find(t => t.slug === s))
          .filter(t => t !== undefined)
          .map(t => termRef(t))
        return {
          ...authorRef(),
          headline: t('author.profile.headline'),
          body: authorBody(),
          writingSince: AUTHOR.writingSince,
          availability: t('author.profile.availability'),
          availableFrom: t('author.profile.availableFrom'),
          links: AUTHOR.links,
          currentProject: current ? toProjectSummary(current) : undefined,
          focus: t('author.profile.focus'),
          backgroundNote: t('author.profile.background'),
          stack,
        }
      }),
    [forced, slug, projects, tags],
  )
}

/** name 'search'. Client-side over articles and projects; empty when nothing matches. */
export function useSearch(query: string): Loadable<SearchResults> {
  const forced = useForced('search')
  const articles = useList('article')
  const projects = useList('project')
  const index = useMemo(
    () =>
      articles.status === 'ready' && projects.status === 'ready'
        ? searchIndex(
            articleSummaries(data(articles)),
            projectSummaries(data(projects)),
          )
        : undefined,
    [articles, projects],
  )
  return useMemo(
    () =>
      settle(forced, [articles, projects], () => {
        const results = index!.search(query)
        return results.total ? results : undefined
      }),
    [forced, articles, projects, index, query],
  )
}

export function useNav(): {
  items: NavItem[]
  mega: Record<'articles' | 'projects', Loadable<MegaMenuData>>
  footer: FooterData
} {
  const articles = useList('article')
  const projects = useList('project')
  const tags = useResource(...resources.tags())
  const settings = usePub('site-settings')
  const pages = useList('page')
  const forcedA = useForced('mega')
  return useMemo(() => {
    const articlesMega = settle(forcedA, [articles, tags], () =>
      megaArticles(
        articleSummaries(data(articles)),
        articleTopics(data(articles), data(tags)),
      ),
    )
    const projectsMega = settle(forcedA, [projects], () =>
      megaProjects(projectSummaries(data(projects))),
    )
    const footer =
      settings.status === 'ready' && pages.status === 'ready'
        ? footerWith(
            toSettings(data(settings)),
            data(pages).filter(p => p.section?.slug === 'policies'),
          )
        : FOOTER
    return {
      items: NAV_ITEMS,
      mega: {articles: articlesMega, projects: projectsMega},
      footer,
    }
  }, [articles, projects, tags, settings, pages, forcedA])
}
