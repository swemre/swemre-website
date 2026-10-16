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

import {useEffect, useRef} from 'react'
import {usePlayer} from '../hooks/usePlayer'
import {spotifyEmbedUrl} from '../services/spotifyIframeApi'
import {cn} from '../utils/cn'
import {Icon} from './Icon'

const iconButton =
  'inline-grid size-7 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg-strong'

// Always mounted so the embed host survives; hidden until a song is chosen.
export function SpotifyPanel({forceCollapsed}: {forceCollapsed: boolean}) {
  const player = usePlayer()
  const hostRef = useRef<HTMLDivElement>(null)
  const {attachHost} = player

  useEffect(() => {
    attachHost(hostRef.current)
    return () => attachHost(null)
  }, [attachHost])
  const song = player.current
  const collapsed = player.collapsed || forceCollapsed

  return (
    <section
      aria-label="Music player"
      className={cn(
        'pointer-events-auto w-dock animate-pop overflow-hidden rounded-md border border-border bg-overlay shadow-xl',
        !song && 'hidden',
      )}
    >
      <div className="flex items-center gap-3 p-2.5">
        {song?.artworkUrl ? (
          <img
            src={song.artworkUrl}
            alt=""
            className="size-11 rounded-xs object-cover shadow-xs"
          />
        ) : (
          <span className="grid size-11 place-items-center rounded-xs bg-surface-muted text-spotify">
            <Icon name="spotify" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-2xs font-semibold tracking-wide text-spotify uppercase">
            <Icon name="spotify" size={11} />
            {player.isPaused ? 'Paused' : 'Now playing'}
          </p>
          <p className="truncate text-sm font-semibold text-fg-strong">
            {song?.title}
          </p>
          <p className="truncate text-xs text-fg-muted">{song?.artist}</p>
        </div>
        <button
          type="button"
          onClick={player.togglePlayback}
          disabled={player.failed}
          aria-label={player.isPaused ? 'Play' : 'Pause'}
          className="inline-grid size-9 place-items-center rounded-full bg-spotify text-cover-ink shadow-sm transition-transform hover:scale-105 disabled:opacity-50"
        >
          <Icon name={player.isPaused ? 'play' : 'pause'} size={14} />
        </button>
        <button
          type="button"
          onClick={() => player.setCollapsed(!player.collapsed)}
          aria-label={collapsed ? 'Expand player' : 'Collapse player'}
          aria-expanded={!collapsed}
          className={iconButton}
        >
          <Icon name={collapsed ? 'chevron-up' : 'chevron-down'} size={14} />
        </button>
        <button
          type="button"
          onClick={player.close}
          aria-label="Close player"
          data-sound="cancel"
          className={iconButton}
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      {/* Collapsing hides the embed without unmounting it, so audio continues. */}
      <div
        className={cn('px-2.5', collapsed ? 'h-0 overflow-hidden' : 'pb-2.5')}
      >
        {player.failed && song ? (
          <iframe
            title={`${song.title} on Spotify`}
            src={spotifyEmbedUrl(song.spotifyId)}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="block h-embed w-full rounded-md border-0"
          />
        ) : (
          <div
            ref={hostRef}
            className="h-embed overflow-hidden rounded-md [&_iframe]:block"
          />
        )}
      </div>
    </section>
  )
}
