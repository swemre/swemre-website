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
// Static navigation and footer, plus the mega menu content built from data. Owner: agent C.
import type {ApiPublicationSummary} from '../contract/api.ts'
import type {
  ArticleSummary,
  FooterData,
  Link,
  MegaMenuData,
  NavItem,
  ProjectSummary,
  SiteSettings,
  TermRef,
} from '../contract/view.ts'
import {canonicalHref} from './rules.ts'
import {t} from '../i18n/index.ts'

export const NAV_ITEMS: NavItem[] = [
  {key: 'home', label: t('nav.home'), href: '/'},
  {
    key: 'articles',
    label: t('nav.articles'),
    href: '/articles',
    mega: 'articles',
  },
  {
    key: 'projects',
    label: t('nav.projects'),
    href: '/projects',
    mega: 'projects',
  },
]

const DEFAULT_TAGLINE = t('footer.tagline')
const PRIVACY: Link = {
  label: t('footer.privacy'),
  href: '/policies/privacy-policy',
}

function columns(policies: Link[], statusUrl?: string): FooterData['columns'] {
  return [
    {
      title: t('footer.explore'),
      links: [
        {label: t('nav.articles'), href: '/articles'},
        {label: t('nav.projects'), href: '/projects'},
        {label: t('footer.newsletter'), href: '/newsletter'},
        {label: t('footer.about'), href: '/authors/emre'},
      ],
    },
    {
      title: t('footer.contact'),
      links: [
        {label: t('footer.sendMessage'), href: '/contact'},
        {label: t('menu.callBack'), href: '/call-back'},
      ],
    },
    {
      title: t('footer.site'),
      links: [
        ...policies,
        {label: t('footer.rss'), href: '/rss.xml', external: true},
        {
          label: t('footer.status'),
          href: statusUrl ?? 'https://status.swemre.com',
          external: true,
        },
      ],
    },
  ]
}

/** The footer before settings load (and when they fail). */
export const FOOTER: FooterData = {
  columns: columns([PRIVACY]),
  tagline: DEFAULT_TAGLINE,
}

/** The footer with the tagline and status link from settings and the pages under /policies. */
export function footerWith(
  settings: SiteSettings,
  policies: ApiPublicationSummary[],
): FooterData {
  const links = policies.length
    ? policies.map(p => ({label: p.title, href: canonicalHref(p)}))
    : [PRIVACY]
  return {
    columns: columns(links, settings.statusUrl),
    tagline: settings.footerTagline || DEFAULT_TAGLINE,
  }
}

/** Articles menu: the 4 newest articles, the top 8 topics, and the list links. */
export function megaArticles(
  articles: ArticleSummary[],
  topics: TermRef[],
): MegaMenuData {
  return {
    featured: articles.slice(0, 4),
    topics: topics.slice(0, 8),
    links: [
      {label: t('nav.allArticles'), href: '/articles'},
      {label: t('mega.saved'), href: '/articles?saved=1'},
      {label: t('footer.rss'), href: '/rss.xml', external: true},
    ],
    also: [],
  }
}

/** Projects menu: the featured projects (up to 4), then the others as "Also". */
export function megaProjects(projects: ProjectSummary[]): MegaMenuData {
  const featured = projects.filter(p => p.featured).slice(0, 4)
  return {
    featured,
    topics: [],
    links: [
      {label: t('nav.allProjects'), href: '/projects'},
      {
        label: 'github.com/swemre',
        href: 'https://github.com/swemre',
        external: true,
      },
    ],
    also: projects
      .filter(p => !featured.includes(p))
      .map(p => ({label: p.title, href: p.href})),
  }
}
