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

// The site's one author. The author page is the website's own: its text is in texts.json, its
// data here; SWEPress has no author content.
import type {Block} from '../contract/blocks.ts'
import type {AuthorRef} from '../contract/view.ts'
import {t} from '../i18n/index.ts'

export const AUTHOR_SLUG = 'emre'

export const AUTHOR = {
  writingSince: 2018,
  stack: ['java', 'spring-boot', 'postgresql', 'react', 'typescript'],
  currentProject: 'swepress',
  links: [
    {label: 'GitHub', href: 'https://github.com/swemre', external: true},
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/swemre',
      external: true,
    },
    {label: 'RSS', href: '/rss.xml', external: false},
  ],
}

export function authorRef(): AuthorRef {
  return {
    name: 'Emre',
    role: t('author.profile.role'),
    href: `/authors/${AUTHOR_SLUG}`,
    avatar: {
      url: '/images/avatar-384.png',
      alt: 'Emre',
      width: 384,
      height: 384,
    },
  }
}

export function authorBody(): Block[] {
  return [
    {
      id: 'author-01',
      type: 'paragraph',
      v: 2,
      props: {text: [{text: t('author.profile.body')}]},
    },
  ]
}
