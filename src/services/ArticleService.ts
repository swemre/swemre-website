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

import type {Article} from '../types/type'
import {ArrayService} from './ArrayService'
import {
  fieldMediaUrl,
  fieldNumber,
  fieldString,
  publicRequest,
  safely,
  tagNames,
  workspacePath,
  type PagedContent,
  type PublicPost,
} from './apiClient'

const toArticle = (post: PublicPost): Article => ({
  id: String(post.id),
  slug: post.slug,
  title: post.title,
  summary: fieldString(post.fields, 'summary') ?? '',
  author: post.author,
  createdAt: post.publishedAt,
  readingTime: fieldNumber(post.fields, 'readingTime') ?? 1,
  tags: tagNames(post),
  body: post.fields.body,
  coverUrl: fieldMediaUrl(post.fields, 'cover'),
})

// Articles are the "article" content type of the website. The site only reads them, so the
// inherited write methods of ArrayService are not used.
export class ArticleService extends ArrayService<Article> {
  constructor() {
    super([])
  }

  override async findAll(): Promise<Article[]> {
    return safely(async () => {
      const page = await publicRequest<PagedContent<PublicPost>>(
        `${workspacePath}/posts?type=article&size=100&sort-by=publishedAt&direction=DESC`,
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
        `${workspacePath}/posts/article/${encodeURIComponent(slug)}`,
      )
      return post ? toArticle(post) : undefined
    }, undefined)
  }
}
