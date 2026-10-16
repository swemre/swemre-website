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
import type {SpecialPage} from '../types/type'
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
  import.meta.glob<{default: ComponentType}>('../page/sp/*.mdx'),
)

const toSpecialPage = (post: PublicPost): SpecialPage => ({
  id: String(post.id),
  slug: post.slug,
  title: post.title,
  summary: post.excerpt,
  version: metaString(post.meta, 'version') ?? '1.0',
  effectiveDate:
    metaString(post.meta, 'effectiveDate') ?? post.publishedAt.slice(0, 10),
  updatedAt:
    metaString(post.meta, 'updatedAt') ?? post.lastUpdatedAt.slice(0, 10),
})

// Special pages (legal pages such as the privacy policy) are PAGE posts of the website
export class SpecialPageService extends ArrayService<SpecialPage> {
  constructor() {
    super([])
  }

  override async findAll(): Promise<SpecialPage[]> {
    return safely(async () => {
      const page = await publicRequest<PagedContent<PublicPost>>(
        `${workspacePath}/posts?type=PAGE&size=100&sort-by=title&direction=ASC`,
      )
      return (page?.content ?? []).map(toSpecialPage)
    }, [])
  }

  override async findById(id: string): Promise<SpecialPage | undefined> {
    return (await this.findAll()).find(page => page.id === id)
  }

  findBySlug(slug: string): Promise<SpecialPage | undefined> {
    return safely(async () => {
      const post = await publicRequest<PublicPost>(
        `${workspacePath}/posts/PAGE/${encodeURIComponent(slug)}`,
      )
      return post ? toSpecialPage(post) : undefined
    }, undefined)
  }

  getBody(slug: string): ComponentType | undefined {
    return bodies[slug]
  }
}
