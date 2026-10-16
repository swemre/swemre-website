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

import type {Song} from '../types/type'
import {ArrayService} from './ArrayService'
import {
  metaString,
  publicRequest,
  safely,
  workspacePath,
  type PagedContent,
  type PublicPost,
} from './apiClient'

const toSong = (post: PublicPost): Song => ({
  id: String(post.id),
  title: post.title,
  artist: metaString(post.meta, 'artist') ?? post.author,
  spotifyId: metaString(post.meta, 'spotifyId') ?? '',
  artworkUrl: metaString(post.meta, 'coverUrl'),
})

// Songs are SONG posts of the website, listed in the "Songs I liked" box
export class SongService extends ArrayService<Song> {
  constructor() {
    super([])
  }

  override async findAll(): Promise<Song[]> {
    return safely(async () => {
      const page = await publicRequest<PagedContent<PublicPost>>(
        `${workspacePath}/posts?type=SONG&size=100&sort-by=title&direction=ASC`,
      )
      return (page?.content ?? []).map(toSong)
    }, [])
  }

  override async findById(id: string): Promise<Song | undefined> {
    return (await this.findAll()).find(song => song.id === id)
  }
}
