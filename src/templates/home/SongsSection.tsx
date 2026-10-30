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

// "0b011 // listening": five liked songs kept in the site (rows open Spotify), the cover fan and
// the branch rail.
import type {CSSProperties} from 'react'
import type {SiteSettings, Song} from '../../contract/view.ts'
import {SongBars} from './Hero.tsx'
import {Split} from './kit/layout.tsx'
import {endGlow, useRailLeft} from './kit/Rail.tsx'
import {SectionBg} from './kit/SectionBg.tsx'
import {Anchor, Icon, SectionHeader} from './kit/ui.ts'
import {useV} from './kit/vp.ts'
import {t} from '../../i18n/index.ts'

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
        song.artwork?.alt ??
        t('home.songs.cover', {album: song.album ?? song.title})
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

export function SongsSection({
  songs,
  settings,
}: {
  songs: Song[]
  settings?: SiteSettings
}) {
  const v = useV()
  const total = settings?.likedSongsTotal
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
            <>
              <SongFan songs={songs} />
              <div style={{marginTop: v(48, 48, 64)}}>
                <SongRows songs={songs} />
              </div>
            </>
          }
          right={
            <SectionHeader
              id="home-songs"
              number={['011', '0b', '', 'lilac']}
              eyebrow={t('home.songs.eyebrow')}
              title={t('home.songs.title')}
              copy={t('home.songs.copy')}
              extra={
                total ? (
                  <span className="a2-mono" style={{fontSize: 12}}>
                    {t('home.songs.count', {picks: songs.length, total})}
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
