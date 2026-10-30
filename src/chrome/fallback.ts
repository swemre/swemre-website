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

// The boards' chrome copy, used while useNav() / useSettings() are loading (or when the CMS
// leaves a field empty), so the bar and footer never jump.
import type {FooterData, NavItem, SiteSettings} from '../contract/view.ts'
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

export const FOOTER: FooterData = {
  tagline: t('footer.tagline'),
  columns: [
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
        {label: t('footer.privacy'), href: '/policies/privacy-policy'},
        {label: t('footer.rss'), href: '/rss.xml', external: true},
      ],
    },
  ],
}

export const SOCIAL: SiteSettings['social'] = {
  github: 'https://github.com/swemre',
  youtube: 'https://www.youtube.com/@swemre',
  linkedin: 'https://www.linkedin.com/in/swemre',
}

export const MEGA_COPY = {
  articles: {
    eyebrow: t('mega.articles.eyebrow'),
    title: t('nav.articles'),
    copy: t('mega.articles.copy'),
    all: {label: t('nav.allArticles'), href: '/articles'},
  },
  projects: {
    eyebrow: t('mega.projects.eyebrow'),
    title: t('nav.projects'),
    copy: t('mega.projects.copy'),
    all: {label: t('nav.allProjects'), href: '/projects'},
  },
} as const
