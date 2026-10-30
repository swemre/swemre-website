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

// "0b011 // listening": five random picks from the liked songs (static content, rows open
// Spotify), the cover fan and the branch rail, with the loading, empty and error boards.
import type {CSSProperties} from 'react'
import type {Loadable, SiteSettings, Song} from '../../contract/view.ts'
import {SongBars} from './Hero.tsx'
import {Split} from './kit/layout.tsx'
import {endGlow, useRailLeft} from './kit/Rail.tsx'
import {SectionBg} from './kit/SectionBg.tsx'
import {Skel, StatePanel} from './kit/StatePanel.tsx'
import {Anchor, Button, Icon, SectionHeader} from './kit/ui.ts'
import {useV} from './kit/vp.ts'

const SPOTIFY = 'https://open.spotify.com'
const lilac = (a: number | string) => `rgb(var(--a2-hue-lilac-rgb) / ${a})`

function SongsRail() {
  const v = useV()
  const left = useRailLeft()
  const wide = v(false, false, true)
  const top = v(87, 95, 130, 166)
  const branch = (d: string, edge: CSSProperties) => (
    <svg
      aria-hidden="true"
      width="32"
      height="48"
      viewBox="0 0 32 48"
      style={{
        position: 'absolute',
        left,
        opacity: 'var(--a2-rail-op)',
        ...edge,
      }}
    >
      <path
        d={d}
        strokeWidth="2"
        fill="none"
        style={{stroke: 'var(--a2-hue-lilac)'}}
      />
    </svg>
  )
  return (
    <>
      <span
        className="a2-rail"
        aria-hidden="true"
        style={{
          left,
          top: 0,
          bottom: 0,
          width: 2,
          background:
            'repeating-linear-gradient(to bottom,var(--a2-hue-peri) 0 6px,transparent 6px 12px)',
        }}
      />
      {wide ? (
        <>
          {branch('M1 0 C1 30, 30 18, 30 48', {top: 16})}
          <span
            className="a2-rail"
            aria-hidden="true"
            style={{
              left: left + 29,
              top: 64,
              bottom: 64,
              background: 'var(--a2-hue-lilac)',
            }}
          />
          {branch('M30 0 C30 30, 1 18, 1 48', {bottom: 16})}
          <span
            className="a2-node"
            aria-hidden="true"
            style={{
              left: left + 23.75,
              top,
              background: 'var(--a2-hue-lilac)',
              boxShadow: `0 0 0 2px var(--a2-hue-lilac),0 0 18px ${lilac('calc(0.7 * var(--a2-node-glow-k))')}`,
            }}
          />
          {[43, 85, 127, 169].map(dy => (
            <span
              key={dy}
              className="a2-node"
              aria-hidden="true"
              style={{
                left: left + 24.75,
                top: top + dy,
                width: 10,
                height: 10,
                boxShadow: `0 0 0 1.5px ${lilac('calc(0.55 * var(--a2-node-glow-k))')}`,
              }}
            />
          ))}
          <span
            className="a2-raillabel"
            aria-hidden="true"
            style={{
              left: left + 42,
              top: 80,
              transform: 'none',
              color: 'var(--a2-hue-lilac)',
            }}
          >
            feature/queue
          </span>
          <span
            className="a2-raillabel"
            aria-hidden="true"
            style={{left: left - 37, top: top + 6}}
          >
            faded01
          </span>
        </>
      ) : (
        <span
          className="a2-node"
          aria-hidden="true"
          style={{
            left: left - 4.25,
            top,
            background: 'var(--a2-hue-lilac)',
            boxShadow: endGlow('lilac'),
          }}
        />
      )}
    </>
  )
}

function Cover({song, size}: {song: Song; size: number}) {
  return (
    <div
      className="a2-island"
      role="img"
      aria-label={
        song.artwork?.alt ?? `${song.album ?? song.title} album cover`
      }
      style={{
        position: 'relative',
        width: size,
        aspectRatio: '1/1',
        overflow: 'hidden',
        background: 'var(--a2-album-bg)',
      }}
    >
      {song.artwork && (
        <img
          src={song.artwork.url}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  )
}

/** Fan geometry per viewport. */
function useFan() {
  const v = useV()
  return v(
    {
      box: [342, 176],
      back: 136,
      lefts: [8, 40, 166, 198],
      top: 24,
      front: 176,
      frontLeft: 83,
    },
    {
      box: [342, 176],
      back: 136,
      lefts: [8, 40, 166, 198],
      top: 24,
      front: 176,
      frontLeft: 83,
    },
    {
      box: [608, 272],
      back: 208,
      lefts: [24, 74, 343, 393],
      top: 40,
      front: 272,
      frontLeft: 168,
    },
  )
}

const ANGLES = [-8, -4, 4, 8]

/** The first pick in front, picks 4, 5, 2, 3 fanned out behind it. */
function SongFan({songs}: {songs: Song[]}) {
  const v = useV()
  const fan = useFan()
  const back = [songs[3], songs[4], songs[1], songs[2]]
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: v('center', 'center', 'flex-start'),
      }}
    >
      <div
        style={{
          position: 'relative',
          width: fan.box[0],
          maxWidth: '100%',
          height: fan.box[1],
        }}
      >
        {back.map(
          (s, i) =>
            s && (
              <div
                key={s.slug}
                style={{
                  position: 'absolute',
                  left: fan.lefts[i],
                  top: fan.top,
                  width: fan.back,
                  transform: `rotate(${ANGLES[i]}deg)`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid var(--a2-line-2)',
                  filter: 'var(--a2-side-cover-filter)',
                  boxShadow: 'var(--a2-shadow-media)',
                }}
              >
                <Cover song={s} size={fan.back} />
              </div>
            ),
        )}
        <div
          style={{
            position: 'absolute',
            left: fan.frontLeft,
            top: 0,
            width: fan.front,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--a2-line-3)',
            boxShadow: `0 0 0 2px var(--a2-hue-lilac),0 0 40px -6px ${lilac('calc(0.55 * var(--a2-glow-k))')},var(--a2-shadow-front)`,
          }}
        >
          <Cover song={songs[0]} size={fan.front} />
        </div>
      </div>
    </div>
  )
}

function SongRows({songs}: {songs: Song[]}) {
  const v = useV()
  return (
    <div className="a2-rows">
      {songs.map((s, i) => (
        <Anchor
          key={s.slug}
          href={s.href}
          external
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 0',
          }}
        >
          <span
            className="a2-mono"
            style={{
              width: 24,
              color: i === 0 ? 'var(--a2-hue-lilac)' : 'var(--a2-text-lo)',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <span
            style={{
              flex: 'none',
              borderRadius: 6,
              overflow: 'hidden',
              border: '1px solid var(--a2-line-2)',
            }}
          >
            <Cover song={s} size={v(48, 56, 56)} />
          </span>
          <span style={{minWidth: 0, flex: 1}}>
            <span
              className="a2-h4"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 16,
                lineHeight: '24px',
                color: i === 0 ? 'var(--a2-song-current)' : 'var(--a2-text-hi)',
              }}
            >
              {i === 0 && <SongBars size={14} />}
              {s.title}
            </span>
            <span className="a2-cap" style={{display: 'block'}}>
              {[s.artist, s.album, s.year].filter(Boolean).join(' · ')}
            </span>
          </span>
          <span className="a2-link" style={{fontSize: 13}}>
            Spotify
            <Icon name="arrow-up-right" size={14} />
          </span>
        </Anchor>
      ))}
    </div>
  )
}

function Loading() {
  const v = useV()
  const fan = useFan()
  const thumb = v(48, 56, 56)
  const box = v([342, 176], [342, 176], [624, 272])
  const lefts = v([8, 198, 83], [8, 198, 83], [24, 393, 176])
  const cards: [number, number, number, number][] = [
    [lefts[0], fan.top, fan.back, -8],
    [lefts[1], fan.top, fan.back, 8],
    [lefts[2], 0, fan.front, 0],
  ]
  return (
    <>
      <span className="a2-sr" role="status">
        Loading songs
      </span>
      <div
        style={{
          display: 'flex',
          justifyContent: v('center', 'center', 'flex-start'),
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'relative',
            width: box[0],
            maxWidth: '100%',
            height: box[1],
          }}
        >
          {cards.map(([left, top, size, angle], i) => (
            <Skel
              key={i}
              w={size}
              h={size}
              r={10}
              style={{
                position: 'absolute',
                left,
                top,
                transform: `rotate(${angle}deg)`,
                opacity: i < 2 ? 0.5 : 1,
                backgroundColor: 'var(--a2-deck-back)',
                boxShadow: 'var(--a2-shadow-media)',
              }}
            />
          ))}
        </div>
      </div>
      <div className="a2-rows" style={{marginTop: v(48, 48, 64)}}>
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 0',
            }}
          >
            <Skel w={24} h={12} />
            <Skel w={thumb} h={thumb} />
            <div style={{flex: 1}}>
              <Skel w="42%" h={16} />
              <Skel w="64%" h={12} style={{marginTop: 8}} />
            </div>
            <Skel w={64} h={12} />
          </div>
        ))}
      </div>
    </>
  )
}

function Body({state, spotify}: {state: Loadable<Song[]>; spotify: string}) {
  const v = useV()
  switch (state.status) {
    case 'loading':
      return <Loading />
    case 'empty':
      return (
        <StatePanel
          hue="lilac"
          icon="music"
          title="No songs to pick from"
          copy="The liked-songs playlist is empty right now, so there is nothing to draw from. New picks show up on the next visit."
          command="playlist-sync --liked"
          result="0 tracks"
          actions={
            <Button
              label="Open Spotify"
              kind="secondary"
              iconRight="arrow-up-right"
              href={spotify}
            />
          }
        />
      )
    case 'error':
      return (
        <StatePanel
          icon="cloud-off"
          title="Spotify did not answer"
          copy="The picks could not be fetched from Spotify. The rest of the page works; try again in a moment."
          command="GET /api/public/v2/channels/swemre/songs"
          result="502 Bad Gateway"
          actions={
            <>
              <Button
                label="Try again"
                kind="secondary"
                iconLeft="refresh"
                onClick={state.retry}
              />
              <Button
                label="Open Spotify"
                kind="ghost"
                iconRight="arrow-up-right"
                href={spotify}
              />
            </>
          }
        />
      )
    case 'ready':
      return (
        <>
          <SongFan songs={state.data} />
          <div style={{marginTop: v(48, 48, 64)}}>
            <SongRows songs={state.data} />
          </div>
        </>
      )
  }
}

export function SongsSection({
  state,
  settings,
}: {
  state: Loadable<Song[]>
  settings?: SiteSettings
}) {
  const total = settings?.likedSongsTotal
  const picks = state.status === 'ready' ? state.data.length : 5
  return (
    <section className="a2-sec" data-cut aria-labelledby="home-songs">
      <SectionBg
        hue="lilac"
        at={[26, 34]}
        second={{at: [78, 30]}}
        texture="rings"
      />
      <SongsRail />
      <div className="a2-c">
        <Split
          spans={[1, 6, 8, 5]}
          reverse
          left={
            <Body state={state} spotify={settings?.social.spotify ?? SPOTIFY} />
          }
          right={
            <SectionHeader
              id="home-songs"
              number={['011', '0b', '', 'lilac']}
              eyebrow="listening"
              title="Random picks from my liked songs"
              copy="Five tracks drawn at random from my Spotify liked songs. Each one opens in Spotify."
              extra={
                total ? (
                  <span className="a2-mono" style={{fontSize: 12}}>
                    {picks} of {total} liked songs
                  </span>
                ) : undefined
              }
            />
          }
        />
      </div>
    </section>
  )
}
