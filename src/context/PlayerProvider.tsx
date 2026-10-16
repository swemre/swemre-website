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

import {useRef, useState, type ReactNode} from 'react'
import {
  loadSpotifyIframeApi,
  spotifyTrackUri,
} from '../services/spotifyIframeApi'
import type {PlayerState, Song, SpotifyEmbedController} from '../types/type'
import {PlayerContext} from './PlayerContext'

export function PlayerProvider({children}: {children: ReactNode}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SpotifyEmbedController | null>(null)
  const [state, setState] = useState<PlayerState>({
    current: null,
    isPaused: true,
    failed: false,
    collapsed: false,
  })

  const mount = (song: Song) => {
    loadSpotifyIframeApi()
      .then(api => {
        const host = hostRef.current
        if (!host) return
        const target = document.createElement('div')
        host.replaceChildren(target)
        api.createController(
          target,
          {uri: spotifyTrackUri(song.spotifyId), width: '100%', height: 152},
          controller => {
            controllerRef.current = controller
            controller.addListener('ready', () => controller.play())
            controller.addListener('playback_update', event =>
              setState(s => ({...s, isPaused: event.data.isPaused})),
            )
          },
        )
      })
      .catch(() => setState(s => ({...s, failed: true})))
  }

  const toggle = (song: Song) => {
    const controller = controllerRef.current
    if (state.current?.id === song.id && controller) {
      controller.togglePlay()
      return
    }
    setState(s => ({...s, current: song, isPaused: true}))
    if (controller) {
      controller.loadUri(spotifyTrackUri(song.spotifyId))
      controller.play()
    } else if (!state.failed) {
      mount(song)
    }
  }

  const togglePlayback = () => controllerRef.current?.togglePlay()

  const setCollapsed = (collapsed: boolean) =>
    setState(s => ({...s, collapsed}))

  const close = () => {
    controllerRef.current?.destroy()
    controllerRef.current = null
    hostRef.current?.replaceChildren()
    setState(s => ({...s, current: null, isPaused: true}))
  }

  return (
    <PlayerContext
      value={{
        ...state,
        attachHost: element => {
          hostRef.current = element
        },
        toggle,
        togglePlayback,
        setCollapsed,
        close,
      }}
    >
      {children}
    </PlayerContext>
  )
}
