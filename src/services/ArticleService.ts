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

import type {Article, PublicPost} from '../types/type'
import {ArrayService} from './ArrayService'
import {
  fieldMediaAlt,
  fieldMediaSize,
  fieldMediaUrl,
  fieldNumber,
  fieldString,
  postSeo,
  shareImage,
  tagNames,
} from './apiClient'
import {publicApi} from './publicApi'

const toArticle = (post: PublicPost): Article => ({
  id: String(post.id),
  slug: post.slug,
  title: post.title,
  summary: fieldString(post.fields, 'summary') ?? '',
  author: post.author,
  createdAt: post.publishedAt,
  updatedAt: post.lastUpdatedAt,
  readingTime: fieldNumber(post.fields, 'readingTime') ?? 1,
  tags: tagNames(post),
  body: post.fields.body,
  coverUrl: fieldMediaUrl(post.fields, 'cover'),
  coverAlt: fieldMediaAlt(post.fields, 'cover'),
  coverWidth: fieldMediaSize(post.fields, 'cover', 'width'),
  coverHeight: fieldMediaSize(post.fields, 'cover', 'height'),
  coverPosition: fieldNumber(post.fields, 'coverPosition'),
  seo: postSeo(post.fields),
  shareImage: shareImage(post.fields, ['ogImage', 'cover']),
})

// Articles are the "article" content type of the website. The site only reads them, so the
// inherited write methods of ArrayService are not used.
export class ArticleService extends ArrayService<Article> {
  constructor() {
    super([], true)
  }

  override async findAll(): Promise<Article[]> {
    const posts = await publicApi.listPosts('article', {
      size: 100,
      sortBy: 'publishedAt',
      direction: 'DESC',
    })
    return posts.map(toArticle)
  }

  override async findById(id: string): Promise<Article | undefined> {
    return (await this.findAll()).find(article => article.id === id)
  }

  async findBySlug(slug: string): Promise<Article | undefined> {
    const post = await publicApi.getPost('article', slug)
    return post ? toArticle(post) : undefined
  }
}
