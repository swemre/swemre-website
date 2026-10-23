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

import {navigationDatabase} from '../database/navigationDatabase'
import type {ServiceMap} from '../types/type'
import {SearchService} from './SearchService'

export function createSearchService(
  services: Omit<ServiceMap, 'search'>,
): SearchService {
  return new SearchService()
    .register({
      category: 'Pages',
      icon: 'chevron-right',
      load: () => Promise.resolve(navigationDatabase),
      action: item => ({kind: 'navigate', to: item.to}),
    })
    .register({
      category: 'Articles',
      icon: 'file',
      load: () => services.article.findAll(),
      action: article => ({kind: 'navigate', to: `/articles/${article.slug}`}),
      keywords: article => [article.author],
      featured: 5,
    })
    .register({
      category: 'Projects',
      icon: 'repo',
      load: () => services.project.findAll(),
      action: project => ({kind: 'navigate', to: `/projects/${project.slug}`}),
      subtitle: project => `${project.year} · ${project.summary}`,
      featured: 0,
    })
    .register({
      category: 'Songs I liked',
      icon: 'spotify',
      load: () => services.song.findAll(),
      action: song => ({kind: 'play-song', song}),
      subtitle: song => song.artist,
      keywords: song => [song.artist, 'music', 'spotify'],
      featured: 0,
    })
    .register({
      category: 'Legal',
      icon: 'book',
      load: () => services.specialPage.findAll(),
      action: page => ({kind: 'navigate', to: `/sp/${page.slug}`}),
      featured: 0,
    })
}
