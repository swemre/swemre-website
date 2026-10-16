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

import type {SpotifyIframeApi, SpotifyWindow} from '../types/type'

const SCRIPT_SRC = 'https://open.spotify.com/embed/iframe-api/v1'

let pending: Promise<SpotifyIframeApi> | null = null

export function loadSpotifyIframeApi(): Promise<SpotifyIframeApi> {
  if (pending) return pending
  pending = new Promise((resolve, reject) => {
    const spotifyWindow: SpotifyWindow = window
    spotifyWindow.onSpotifyIframeApiReady = resolve
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onerror = () => {
      pending = null
      script.remove()
      reject(new Error('Spotify iFrame API failed to load'))
    }
    document.body.appendChild(script)
  })
  return pending
}

export const spotifyTrackUri = (id: string) => `spotify:track:${id}`
export const spotifyTrackUrl = (id: string) =>
  `https://open.spotify.com/track/${id}`
export const spotifyEmbedUrl = (id: string) =>
  `https://open.spotify.com/embed/track/${id}?utm_source=generator`
