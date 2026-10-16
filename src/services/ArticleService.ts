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

import type {ComponentType} from 'react'
import type {Article} from '../types/type'
import {ArrayService} from './ArrayService'
import {
  metaString,
  publicRequest,
  safely,
  workspacePath,
  type PagedContent,
  type PublicPost,
} from './apiClient'
import {lazyBodies} from './mdxBodies'

const bodies = lazyBodies(
  import.meta.glob<{default: ComponentType}>('../page/article/*.mdx'),
)

const toArticle = (post: PublicPost): Article => ({
  id: String(post.id),
  slug: post.slug,
  title: post.title,
  summary: post.excerpt,
  author: post.author,
  createdAt: post.publishedAt,
  readingTime:
    typeof post.meta.readingTime === 'number' ? post.meta.readingTime : 1,
  tags: post.terms
    .filter(term => term.taxonomy === 'TAG')
    .map(term => term.name),
  body: post.content,
  bodyFormat: post.contentFormat,
  coverUrl: metaString(post.meta, 'coverUrl'),
})

// Articles are POST posts of the website. The site only reads them, so the inherited write
// methods of ArrayService are not used.
export class ArticleService extends ArrayService<Article> {
  constructor() {
    super([])
  }

  override async findAll(): Promise<Article[]> {
    return safely(async () => {
      const page = await publicRequest<PagedContent<PublicPost>>(
        `${workspacePath}/posts?type=POST&size=100&sort-by=publishedAt&direction=DESC`,
      )
      return (page?.content ?? []).map(toArticle)
    }, [])
  }

  override async findById(id: string): Promise<Article | undefined> {
    return (await this.findAll()).find(article => article.id === id)
  }

  findBySlug(slug: string): Promise<Article | undefined> {
    return safely(async () => {
      const post = await publicRequest<PublicPost>(
        `${workspacePath}/posts/POST/${encodeURIComponent(slug)}`,
      )
      return post ? toArticle(post) : undefined
    }, undefined)
  }

  getBody(slug: string): ComponentType | undefined {
    return bodies[slug]
  }
}
