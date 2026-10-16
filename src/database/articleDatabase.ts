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

// Keep `id` stable after publishing; localStorage interactions are keyed by it.
export const articleDatabase: Article[] = [
  {
    id: 'a1f3c9d2',
    slug: 'getting-started-with-mdx',
    title: 'Getting Started with MDX in a Vite + React App',
    summary:
      'Write long-form content in Markdown, sprinkle in React components, and ship it as part of your bundle.',
    author: 'swemre',
    createdAt: '2026-09-02T09:00:00Z',
    readingTime: 11,
    tags: ['mdx', 'react', 'vite'],
  },
  {
    id: 'b7e20a54',
    slug: 'designing-local-first-interactions',
    title: 'Designing Local-First Interactions with localStorage',
    summary:
      'Views, likes and favorites without a backend: a small store built on useSyncExternalStore.',
    author: 'swemre',
    createdAt: '2026-10-05T12:30:00Z',
    readingTime: 10,
    tags: ['react', 'localStorage', 'architecture'],
  },
  {
    id: 'c4d81e6f',
    slug: 'token-only-design-system-tailwind-v4',
    title: 'A Token-Only Design System with Tailwind CSS v4',
    summary:
      'Clear every Tailwind default, define semantic tokens in one CSS file, and make off-system classes impossible.',
    author: 'swemre',
    createdAt: '2026-06-18T08:00:00Z',
    readingTime: 10,
    tags: ['tailwind', 'css', 'design-systems'],
  },
  {
    id: 'd92a3b17',
    slug: 'generic-service-layer-react',
    title: 'A Generic Service Layer for React: From Arrays to an API',
    summary:
      'One TypeScript interface, an in-memory implementation today and an HTTP one tomorrow, with zero component changes.',
    author: 'swemre',
    createdAt: '2026-07-14T10:15:00Z',
    readingTime: 10,
    tags: ['typescript', 'react', 'architecture'],
  },
  {
    id: 'e15f7c40',
    slug: 'persistent-spotify-player-react',
    title: 'A Spotify Player That Keeps Playing Across Pages',
    summary:
      'Use the Spotify iFrame API, a layout-level dock and one embed controller to play tracks while visitors browse.',
    author: 'swemre',
    createdAt: '2026-08-11T17:40:00Z',
    readingTime: 10,
    tags: ['react', 'spotify', 'ux'],
  },
  {
    id: 'f6b04d88',
    slug: 'nasa-style-docs-for-small-projects',
    title: 'NASA-Style Documentation for Small Projects',
    summary:
      'Requirements, design, interfaces, test plans and traceability, borrowed from NPR 7150.2 and scaled down to one developer.',
    author: 'swemre',
    createdAt: '2026-10-12T09:30:00Z',
    readingTime: 11,
    tags: ['documentation', 'testing', 'architecture'],
  },
]
