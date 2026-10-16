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

import type {FeedItem} from '../types/type'

// Append-only log of RSS items for songs and notes, newest at the bottom. Articles, projects and
// songs are not listed here: the RSS generator reads them from swemre-website-api. Keep `id` stable
// after publishing; feed readers use it to detect new items.
export const feedDatabase: FeedItem[] = [
  {
    id: 'feed-note-2026-10-15',
    kind: 'note',
    title: 'The feed now includes projects and songs',
    summary:
      'Besides articles, this feed now announces new project write-ups and songs added to the "Songs I liked" list.',
    link: '/',
    publishedAt: '2026-10-15T12:00:00Z',
  },
]
