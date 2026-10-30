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
// Template and canonical path of a CMS publication. The site's own routes never come from the
// CMS (src/data/resolve.ts). Pure functions.
import type {ApiPublicationSummary} from '../contract/api.ts'
import type {TemplateKey} from '../contract/templates.ts'

type Pub = Pick<ApiPublicationSummary, 'contentType' | 'slug' | 'section'>

const BY_TYPE: Record<string, TemplateKey> = {
  article: 'article',
  project: 'project',
  page: 'single',
}

export function selectTemplate(pub: Pub): TemplateKey {
  return BY_TYPE[pub.contentType] ?? 'not-found'
}

/** article -> /articles/<slug>; project -> /projects/<slug>; page -> /<section>/<slug> or /<slug>. */
export function canonicalHref(pub: Pub): string {
  if (pub.contentType === 'article') return `/articles/${pub.slug}`
  if (pub.contentType === 'project') return `/projects/${pub.slug}`
  return pub.section ? `/${pub.section.slug}/${pub.slug}` : `/${pub.slug}`
}
