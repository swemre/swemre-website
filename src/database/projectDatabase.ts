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

// TODO(swemre): p2 to p5 are placeholders; replace with real projects.
export const projectDatabase: Project[] = [
  {
    id: 'p1',
    slug: 'swemre-website',
    title: 'swemre-website',
    summary:
      'This site: React 19, TypeScript, Vite and MDX with a docs-style design system.',
    year: 2026,
    tags: ['react', 'typescript', 'mdx', 'tailwind'],
    repoUrl: 'https://github.com/swemre/swemre-website',
  },
  {
    id: 'p2',
    slug: 'local-first-notes',
    title: 'Local-first notes',
    summary:
      'Placeholder: an offline-first notes app with conflict-free sync between devices.',
    year: 2025,
    tags: ['pwa', 'indexeddb'],
  },
  {
    id: 'p3',
    slug: 'realtime-dashboard',
    title: 'Realtime dashboard',
    summary:
      'Placeholder: live metrics streamed over WebSockets into smooth, memory-bounded charts.',
    year: 2025,
    tags: ['websocket', 'charts'],
  },
  {
    id: 'p4',
    slug: 'mdx-link-checker',
    title: 'mdx-link-checker',
    summary:
      'Example: a CLI that finds broken routes, anchors and URLs in MDX content before deploy.',
    year: 2026,
    tags: ['cli', 'node', 'mdx'],
  },
  {
    id: 'p5',
    slug: 'token-forge',
    title: 'token-forge',
    summary:
      'Example: generates a Tailwind v4 theme from JSON design tokens, with a contrast report.',
    year: 2026,
    tags: ['tailwind', 'design-tokens', 'accessibility'],
  },
]
