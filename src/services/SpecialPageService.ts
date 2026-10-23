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

import type {PublicPost, SpecialPage} from '../types/type'
import {ArrayService} from './ArrayService'
import {fieldString, postSeo, safely} from './apiClient'
import {publicApi} from './publicApi'

const toSpecialPage = (post: PublicPost): SpecialPage => ({
  id: String(post.id),
  slug: post.slug,
  title: post.title,
  summary:
    fieldString(post.fields, 'summary') ??
    fieldString(post.fields, 'seoDescription') ??
    '',
  version: fieldString(post.fields, 'version') ?? '1.0',
  effectiveDate:
    fieldString(post.fields, 'effectiveDate') ?? post.publishedAt.slice(0, 10),
  updatedAt: post.lastUpdatedAt.slice(0, 10),
  body: post.fields.body,
  seo: postSeo(post.fields),
})

// Special pages (legal pages such as the privacy policy) are a "page" content type, made in the
// CMS with a rich text "body" field and optional summary, version and effectiveDate fields.
// Without that type every special page is not found.
export class SpecialPageService extends ArrayService<SpecialPage> {
  constructor() {
    super([], true)
  }

  override async findAll(): Promise<SpecialPage[]> {
    return safely(async () => {
      const posts = await publicApi.listPosts('page', {
        size: 100,
        sortBy: 'title',
        direction: 'ASC',
      })
      return posts.map(toSpecialPage)
    }, [])
  }

  override async findById(id: string): Promise<SpecialPage | undefined> {
    return (await this.findAll()).find(page => page.id === id)
  }

  findBySlug(slug: string): Promise<SpecialPage | undefined> {
    return safely(async () => {
      const post = await publicApi.getPost('page', slug)
      return post ? toSpecialPage(post) : undefined
    }, undefined)
  }
}
