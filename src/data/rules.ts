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
// Template selection and canonical paths from a publication's content type, section and
// reserved layout-* tags (src/contract/templates.ts). Pure functions. Owner: agent C.
import type {ApiPublicationSummary} from '../contract/api.ts'
import type {TemplateKey, TemplateRule} from '../contract/templates.ts'

/** Tried in order; the first match wins, then the content type decides. */
export const TEMPLATE_RULES: TemplateRule[] = [
  {template: 'home', contentType: 'page', tag: 'layout-home'},
  {
    template: 'articles',
    contentType: 'page',
    section: 'articles',
    tag: 'layout-listing',
  },
  {
    template: 'projects',
    contentType: 'page',
    section: 'projects',
    tag: 'layout-listing',
  },
  {template: 'topic', contentType: 'page', tag: 'layout-topic'},
  {template: 'search', contentType: 'page', tag: 'layout-search'},
  {template: 'form', contentType: 'page', tag: 'layout-form'},
  {
    template: 'newsletter-status',
    contentType: 'page',
    section: 'newsletter',
    tag: 'layout-status',
  },
  {template: 'author', contentType: 'page', tag: 'layout-author'},
]

const BY_TYPE: Record<string, TemplateKey> = {
  article: 'article',
  project: 'project',
  author: 'author',
  page: 'single',
}

type Pub = Pick<
  ApiPublicationSummary,
  'contentType' | 'slug' | 'section' | 'terms'
>

const hasTag = (pub: Pub, slug: string) =>
  pub.terms.some(t => t.kind === 'TAG' && t.slug === slug)

export function selectTemplate(
  pub: Pub,
  rules: TemplateRule[] = TEMPLATE_RULES,
): TemplateKey {
  const rule = rules.find(
    r =>
      (!r.contentType || r.contentType === pub.contentType) &&
      (!r.section || r.section === '*'
        ? true
        : pub.section?.slug === r.section) &&
      (!r.tag || hasTag(pub, r.tag)),
  )
  return rule?.template ?? BY_TYPE[pub.contentType] ?? 'not-found'
}

/**
 * article -> /articles/<slug>; project -> /projects/<slug>; author -> /authors/<slug>;
 * layout-home -> /; layout-listing, layout-search, layout-form -> /<section or slug>;
 * otherwise /<section>/<slug>, or /<slug> without a section.
 */
export function canonicalHref(pub: Pub): string {
  if (pub.contentType === 'article') return `/articles/${pub.slug}`
  if (pub.contentType === 'project') return `/projects/${pub.slug}`
  if (pub.contentType === 'author') return `/authors/${pub.slug}`
  if (hasTag(pub, 'layout-home')) return '/'
  if (
    ['layout-listing', 'layout-search', 'layout-form'].some(t => hasTag(pub, t))
  ) {
    return `/${pub.section?.slug ?? pub.slug}`
  }
  return pub.section ? `/${pub.section.slug}/${pub.slug}` : `/${pub.slug}`
}
