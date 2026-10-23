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
  fieldMediaUrl,
  fieldString,
  publicRequest,
  safely,
  workspacePath,
  type PagedContent,
  type PublicPost,
} from './apiClient'

// open.spotify.com/track/<id>?si=... becomes <id>; a bare id is kept as it is
export function spotifyTrackId(url: string | undefined): string {
  if (!url) return ''
  const match = /track\/([A-Za-z0-9]+)/.exec(url)
  return match ? match[1] : url
}

const toSong = (post: PublicPost): Song => ({
  id: String(post.id),
  title: post.title,
  artist: fieldString(post.fields, 'artist') ?? post.author,
  spotifyId: spotifyTrackId(fieldString(post.fields, 'spotifyUrl')),
  artworkUrl: fieldMediaUrl(post.fields, 'artwork'),
})

// Songs are the "song" content type of the website, listed in the "Songs I liked" box
export class SongService extends ArrayService<Song> {
  constructor() {
    super([], true)
  }

  override async findAll(): Promise<Song[]> {
    return safely(async () => {
      const page = await publicRequest<PagedContent<PublicPost>>(
        `${workspacePath}/posts?type=song&size=100&sort-by=title&direction=ASC`,
      )
      return (page?.content ?? [])
        .map(toSong)
        .filter(song => song.spotifyId !== '')
    }, [])
  }

  override async findById(id: string): Promise<Song | undefined> {
    return (await this.findAll()).find(song => song.id === id)
  }
}
