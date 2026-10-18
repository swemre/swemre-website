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

import {usePlayer} from '../hooks/usePlayer'
import type {Song} from '../types/type'
import {cn} from '../utils/cn'
import {Icon} from './Icon'

const barDelays = ['', '[animation-delay:-300ms]', '[animation-delay:-600ms]']

function Equalizer() {
  return (
    <span aria-hidden="true" className="flex h-3.5 items-end gap-0.5">
      {barDelays.map(delay => (
        <span
          key={delay}
          className={cn(
            'h-full w-0.75 origin-bottom animate-eq rounded-xs bg-primary',
            delay,
          )}
        />
      ))}
    </span>
  )
}

export function SongRow({song, index}: {song: Song; index: number}) {
  const player = usePlayer()
  const isCurrent = player.current?.id === song.id
  const isPlaying = isCurrent && !player.isPaused

  return (
    <li>
      <button
        type="button"
        onClick={() => player.toggle(song)}
        aria-label={`${isPlaying ? 'Pause' : 'Play'} ${song.title} by ${song.artist}`}
        className={cn(
          'group grid w-full grid-cols-[1.75rem_2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-sm px-2 py-1.5 text-left transition-colors',
          isCurrent ? 'bg-surface-muted' : 'hover:bg-surface-muted',
        )}
      >
        <span className="grid place-items-center text-sm text-fg-muted tabular-nums">
          {isPlaying ? (
            <>
              <span className="group-hover:hidden">
                <Equalizer />
              </span>
              <Icon
                name="pause"
                size={14}
                className="hidden text-fg-strong group-hover:block"
              />
            </>
          ) : isCurrent ? (
            <Icon name="play" size={14} className="text-spotify" />
          ) : (
            <>
              <span className="group-hover:hidden">{index}</span>
              <Icon
                name="play"
                size={14}
                className="hidden text-fg-strong group-hover:block"
              />
            </>
          )}
        </span>

        {song.artworkUrl ? (
          <img
            src={song.artworkUrl}
            alt=""
            loading="lazy"
            className="size-10 rounded-xs object-cover shadow-xs"
          />
        ) : (
          <span className="grid size-10 place-items-center rounded-xs bg-surface-muted text-fg-subtle">
            <Icon name="spotify" />
          </span>
        )}

        <span className="min-w-0">
          <span
            className={cn(
              'block truncate text-sm font-medium',
              isCurrent ? 'text-spotify' : 'text-fg-strong',
            )}
          >
            {song.title}
          </span>
          <span className="block truncate text-xs text-fg-muted">
            {song.artist}
          </span>
        </span>

        <Icon
          name="spotify"
          size={16}
          className={cn(
            'transition-opacity',
            isCurrent
              ? 'text-spotify'
              : 'text-fg-subtle opacity-0 group-hover:opacity-100',
          )}
        />
      </button>
    </li>
  )
}
