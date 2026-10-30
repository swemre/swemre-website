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

export const NAV_ITEMS: NavItem[] = [
  {key: 'home', label: 'Home', href: '/'},
  {key: 'articles', label: 'Articles', href: '/articles', mega: 'articles'},
  {key: 'projects', label: 'Projects', href: '/projects', mega: 'projects'},
]

export const FOOTER: FooterData = {
  tagline: 'Notes and projects from a software engineer who writes Java, BTW.',
  columns: [
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
        {label: 'Privacy policy', href: '/policies/privacy-policy'},
        {label: 'RSS feed', href: '/rss.xml', external: true},
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
    eyebrow: 'writing',
    title: 'Articles',
    copy: 'Notes on building for the web.',
    all: {label: 'All articles', href: '/articles'},
  },
  projects: {
    eyebrow: 'building',
    title: 'Projects',
    copy: 'Things I have built and am building.',
    all: {label: 'All projects', href: '/projects'},
  },
} as const
