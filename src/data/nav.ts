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

export const NAV_ITEMS: NavItem[] = [
  {key: 'home', label: 'Home', href: '/'},
  {key: 'articles', label: 'Articles', href: '/articles', mega: 'articles'},
  {key: 'projects', label: 'Projects', href: '/projects', mega: 'projects'},
]

const DEFAULT_TAGLINE =
  'Notes and projects from a software engineer who writes Java, BTW.'
const PRIVACY: Link = {
  label: 'Privacy policy',
  href: '/policies/privacy-policy',
}

function columns(policies: Link[], statusUrl?: string): FooterData['columns'] {
  return [
    {
      title: 'Explore',
      links: [
        {label: 'Articles', href: '/articles'},
        {label: 'Projects', href: '/projects'},
        {label: 'Newsletter', href: '/newsletter'},
        {label: 'About Emre', href: '/authors/emre'},
      ],
    },
    {
      title: 'Contact',
      links: [
        {label: 'Send a message', href: '/contact'},
        {label: 'Request a call back', href: '/call-back'},
        {label: 'Request my resume', href: '/resume'},
      ],
    },
    {
      title: 'Site',
      links: [
        ...policies,
        {label: 'RSS feed', href: '/rss.xml', external: true},
        {
          label: 'Status',
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
      {label: 'All articles', href: '/articles'},
      {label: 'Saved articles', href: '/articles?saved=1'},
      {label: 'RSS feed', href: '/rss.xml', external: true},
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
      {label: 'All projects', href: '/projects'},
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
