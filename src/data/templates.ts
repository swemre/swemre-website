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
// Templates load per route, one chunk each. The resolver awaits loadTemplate() before it
// shows a route, so the previous page stays on screen while the chunk loads and nothing
// suspends (no fallback flash). src/templates/index.ts stays the typed map of the same
// components; this table mirrors it with dynamic imports. Owner: agent C.
import type {TemplateComponent, TemplateKey} from '../contract/templates.ts'

import {ErrorTemplate} from '../templates/error/index.tsx'

type Loader = () => Promise<TemplateComponent>

const LOADERS: Record<TemplateKey, Loader> = {
  home: () => import('../templates/home/index.tsx').then(m => m.HomeTemplate),
  articles: () =>
    import('../templates/articles/index.tsx').then(m => m.ArticlesTemplate),
  topic: () =>
    import('../templates/topic/index.tsx').then(m => m.TopicTemplate),
  projects: () =>
    import('../templates/projects/index.tsx').then(m => m.ProjectsTemplate),
  search: () =>
    import('../templates/search/index.tsx').then(m => m.SearchTemplate),
  form: () => import('../forms/index.tsx').then(m => m.FormTemplate),
  article: () =>
    import('../templates/article/index.tsx').then(m => m.ArticleTemplate),
  project: () =>
    import('../templates/project/index.tsx').then(m => m.ProjectTemplate),
  author: () =>
    import('../templates/author/index.tsx').then(m => m.AuthorTemplate),
  single: () =>
    import('../templates/single/index.tsx').then(m => m.SingleTemplate),
  'newsletter-status': () =>
    import('../templates/newsletter-status/index.tsx').then(
      m => m.NewsletterStatusTemplate,
    ),
  'not-found': () =>
    import('../templates/not-found/index.tsx').then(m => m.NotFoundTemplate),
  // The error page is in the main chunk: the ErrorBoundary renders it without waiting.
  error: () => Promise.resolve(ErrorTemplate),
  unavailable: () =>
    import('../templates/unavailable/index.tsx').then(
      m => m.UnavailableTemplate,
    ),
}

const loaded: Partial<Record<TemplateKey, TemplateComponent>> = {}
const pending: Partial<Record<TemplateKey, Promise<TemplateComponent>>> = {}

/** Loads a template's chunk once; a failed load (offline, new deploy) may be tried again. */
export function loadTemplate(key: TemplateKey): Promise<TemplateComponent> {
  const done = loaded[key]
  if (done) return Promise.resolve(done)
  pending[key] ??= LOADERS[key]().then(
    c => (loaded[key] = c),
    (e: unknown) => {
      delete pending[key]
      throw e
    },
  )
  return pending[key]
}

/** The template if its chunk is in, else undefined. */
export function loadedTemplate(
  key: TemplateKey,
): TemplateComponent | undefined {
  return loaded[key]
}
