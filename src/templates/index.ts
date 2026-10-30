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

// The template map: one component per TemplateKey. Each folder belongs to one agent (see
// contract/templates.ts); this file only wires them and does not change.
import type {TemplateMap} from '../contract/templates.ts'
import {FormTemplate} from '../forms/index.tsx'
import {ArticleTemplate} from './article/index.tsx'
import {ArticlesTemplate} from './articles/index.tsx'
import {AuthorTemplate} from './author/index.tsx'
import {ErrorTemplate} from './error/index.tsx'
import {HomeTemplate} from './home/index.tsx'
import {NewsletterStatusTemplate} from './newsletter-status/index.tsx'
import {NotFoundTemplate} from './not-found/index.tsx'
import {ProjectTemplate} from './project/index.tsx'
import {ProjectsTemplate} from './projects/index.tsx'
import {SearchTemplate} from './search/index.tsx'
import {SingleTemplate} from './single/index.tsx'
import {TopicTemplate} from './topic/index.tsx'
import {UnavailableTemplate} from './unavailable/index.tsx'

export const templates: TemplateMap = {
  home: HomeTemplate,
  articles: ArticlesTemplate,
  topic: TopicTemplate,
  projects: ProjectsTemplate,
  search: SearchTemplate,
  form: FormTemplate,
  article: ArticleTemplate,
  project: ProjectTemplate,
  author: AuthorTemplate,
  single: SingleTemplate,
  'newsletter-status': NewsletterStatusTemplate,
  'not-found': NotFoundTemplate,
  error: ErrorTemplate,
  unavailable: UnavailableTemplate,
}
