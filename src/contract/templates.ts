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

// Template registry contract. The resolver (agent C) turns a URL into a ResolvedRoute; the
// template map (src/templates/index.ts) renders it. Owner: agent C.
import type {ComponentType} from 'react'
import type {ApiPublication} from './api.ts'

/**
 * Who builds which template:
 * - agent B: home, articles, topic, projects, search
 * - agent C: form (newsletter, contact, call back)
 * - agent D: article, project, author, single, newsletter-status, not-found, error, unavailable
 */
export type TemplateKey =
  | 'home'
  | 'articles'
  | 'topic'
  | 'projects'
  | 'search'
  | 'form'
  | 'article'
  | 'project'
  | 'author'
  | 'single'
  | 'newsletter-status'
  | 'not-found'
  | 'error'
  | 'unavailable'

/** Which not-found board to show. */
export type NotFoundKind = 'article' | 'project' | 'single' | 'page'

export interface ResolvedRoute {
  template: TemplateKey
  /** The pathname that was resolved. */
  path: string
  /** Absent for code-only templates (not-found, error, unavailable). */
  publication?: ApiPublication
  /** slug, term, token, requestId and every query parameter (q, view, topic, stack, ...). */
  params: Record<string, string>
  notFoundKind?: NotFoundKind
  /** The 503 page shows the logo bar (logo and notice badge, no links or search) and no footer. */
  chrome: {
    nav: boolean
    footer: boolean
    /** 'logo': the 503 bar. Default 'full'. */
    bar?: 'full' | 'logo'
    /** The badge text of the logo bar; SiteShell defaults to "Maintenance in progress". */
    notice?: string
  }
}

export interface TemplateProps {
  route: ResolvedRoute
}
export type TemplateComponent = ComponentType<TemplateProps>
export type TemplateMap = Record<TemplateKey, TemplateComponent>

/**
 * Template selection from the website-page distribution. Rules are tried in order, then the
 * content type decides (article -> article, project -> project, author -> author, page -> single).
 * The section (category) is the site area and first URL segment; reserved layout-* tags pick the
 * template; other tags are topics.
 */
export interface TemplateRule {
  template: TemplateKey
  contentType?: string
  /** Section slug; '*' any. */
  section?: string
  /** A reserved tag the publication must carry. */
  tag?: string
}

export const RESERVED_TAGS = [
  'layout-home',
  'layout-listing',
  'layout-topic',
  'layout-search',
  'layout-form',
  'layout-status',
  'layout-author',
  'featured',
] as const
