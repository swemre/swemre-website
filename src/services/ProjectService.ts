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

import type {Project} from '../types/type'
import {ArrayService} from './ArrayService'
import {
  fieldMediaAlt,
  fieldMediaSize,
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

const toProject = (post: PublicPost): Project => ({
  id: String(post.id),
  slug: post.slug,
  title: post.title,
  summary: fieldString(post.fields, 'summary') ?? '',
  year:
    fieldNumber(post.fields, 'year') ??
    new Date(post.publishedAt).getFullYear(),
  tags: tagNames(post),
  url: fieldString(post.fields, 'url'),
  repoUrl: fieldString(post.fields, 'repoUrl'),
  body: post.fields.body,
  coverUrl: fieldMediaUrl(post.fields, 'cover'),
  coverAlt: fieldMediaAlt(post.fields, 'cover'),
  coverWidth: fieldMediaSize(post.fields, 'cover', 'width'),
  coverHeight: fieldMediaSize(post.fields, 'cover', 'height'),
})

// Projects are the "project" content type of the website; the site only reads them.
export class ProjectService extends ArrayService<Project> {
  constructor() {
    super([], true)
  }

  override async findAll(): Promise<Project[]> {
    return safely(async () => {
      const page = await publicRequest<PagedContent<PublicPost>>(
        `${workspacePath}/posts?type=project&size=100&sort-by=publishedAt&direction=DESC`,
      )
      return (page?.content ?? [])
        .map(toProject)
        .sort((a, b) => b.year - a.year)
    }, [])
  }

  override async findById(id: string): Promise<Project | undefined> {
    return (await this.findAll()).find(project => project.id === id)
  }

  findBySlug(slug: string): Promise<Project | undefined> {
    return safely(async () => {
      const post = await publicRequest<PublicPost>(
        `${workspacePath}/posts/project/${encodeURIComponent(slug)}`,
      )
      return post ? toProject(post) : undefined
    }, undefined)
  }
}
