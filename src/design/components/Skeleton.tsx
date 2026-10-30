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

// Skeleton (V4-Comp-Skeleton): the shimmer primitive and the loading patterns of the boards
// (article rows, cover cards, project cards, song rows, chip rows). Patterns are aria-hidden; the
// list that shows them carries one a2-sr "Loading …" status.
import type {CSSProperties} from 'react'
import {useViewport} from '../context.ts'

export interface SkelProps {
  w: number | string
  h: number | string
  r?: number
  style?: CSSProperties
}

/** One shimmer block. Radius 6 by default (10 for blocks, 4 for badges). */
export function Skel({w, h, r = 6, style}: SkelProps) {
  return (
    <div
      className="a2-skel"
      style={{width: w, height: h, borderRadius: r, ...style}}
    />
  )
}

/** Screen-reader status for a loading list ("Loading articles"). */
export function LoadingStatus({label}: {label: string}) {
  return (
    <span className="a2-sr" role="status">
      {label}
    </span>
  )
}

export type SkeletonPattern =
  'arow' | 'card' | 'project' | 'song' | 'chips' | 'line' | 'row'

export interface SkeletonProps {
  pattern: SkeletonPattern
  /** How many items. */
  count?: number
  /** arow: the first row is the feature row (taller title). */
  featureFirst?: boolean
  /** chips: the widths of the chip placeholders. */
  widths?: number[]
}

const dots = (
  <div
    style={{position: 'absolute', left: 24, top: 24, display: 'flex', gap: 8}}
  >
    {[0, 1, 2].map(i => (
      <span
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: 9,
          background: 'var(--a2-line-soft)',
        }}
      />
    ))}
  </div>
)

function ArticleRowSkel({feature}: {feature: boolean}) {
  return (
    <div className="a2-arow" aria-hidden="true">
      <div className="a2-adate" style={{paddingTop: 4}}>
        <Skel w={96} h={12} />
      </div>
      <div>
        <Skel w="64%" h={feature ? 28 : 20} />
        <Skel w="94%" h={14} style={{marginTop: 16}} />
        <Skel w="72%" h={14} style={{marginTop: 8}} />
        <div style={{display: 'flex', gap: 16, marginTop: 16}}>
          <Skel w={160} h={12} />
          <Skel w={72} h={12} />
        </div>
      </div>
      <div>
        <Skel w={18} h={18} r={4} />
      </div>
    </div>
  )
}

/** The Articles cover-card placeholder (16:9 cover with the three dots). */
function CardSkel() {
  return (
    <div aria-hidden="true">
      <div
        className="a2-skel"
        style={{
          width: '100%',
          aspectRatio: '16/9',
          height: 'auto',
          borderRadius: 10,
          position: 'relative',
        }}
      >
        {dots}
      </div>
      <Skel w={168} h={12} style={{marginTop: 24}} />
      <Skel w="82%" h={20} style={{marginTop: 8}} />
      <Skel w="56%" h={20} style={{marginTop: 8}} />
      <Skel w="96%" h={14} style={{marginTop: 8}} />
      <Skel w="70%" h={14} style={{marginTop: 8}} />
      <div style={{display: 'flex', gap: 8, marginTop: 16}}>
        <Skel w={48} h={24} r={4} />
        <Skel w={88} h={24} r={4} />
        <Skel w={64} h={24} r={4} />
      </div>
    </div>
  )
}

function ProjectSkel() {
  return (
    <div className="a2-card">
      <div
        aria-hidden="true"
        style={{display: 'flex', flexDirection: 'column', gap: 16}}
      >
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <Skel w={112} h={24} r={4} />
          <Skel w={40} h={12} style={{marginTop: 4}} />
        </div>
        <Skel w="52%" h={28} />
        <Skel w="96%" h={14} style={{marginTop: 4}} />
        <Skel w="84%" h={14} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <Skel w={150} h={12} />
          <Skel w={80} h={12} />
        </div>
      </div>
    </div>
  )
}

function SongSkel({art}: {art: number}) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 0',
      }}
    >
      <Skel w={24} h={12} />
      <Skel w={art} h={art} />
      <div style={{flex: 1}}>
        <Skel w="42%" h={16} />
        <Skel w="64%" h={12} style={{marginTop: 8}} />
      </div>
      <Skel w={64} h={12} />
    </div>
  )
}

/** The "Text only" article row placeholder. */
function TextRowSkel() {
  return (
    <div
      className="a2-arow p2-row"
      aria-hidden="true"
      style={{alignItems: 'start'}}
    >
      <div
        className="a2-adate"
        style={{display: 'flex', flexDirection: 'column', gap: 8}}
      >
        <Skel w={96} h={12} />
        <Skel w={72} h={12} />
      </div>
      <div>
        <Skel w="58%" h={20} />
        <Skel w="92%" h={14} style={{marginTop: 12}} />
        <Skel w="66%" h={14} style={{marginTop: 8}} />
        <div style={{display: 'flex', gap: 8, marginTop: 16}}>
          <Skel w={48} h={24} r={4} />
          <Skel w={88} h={24} r={4} />
          <Skel w={64} h={24} r={4} />
        </div>
      </div>
      <div>
        <Skel w={18} h={18} r={4} />
      </div>
    </div>
  )
}

export function Skeleton({
  pattern,
  count = 1,
  featureFirst = true,
  widths,
}: SkeletonProps) {
  const vp = useViewport()
  const n = Array.from({length: count}, (_, i) => i)
  switch (pattern) {
    case 'arow':
      return (
        <>
          {n.map(i => (
            <ArticleRowSkel key={i} feature={featureFirst && i === 0} />
          ))}
        </>
      )
    case 'row':
      return (
        <>
          {n.map(i => (
            <TextRowSkel key={i} />
          ))}
        </>
      )
    case 'card':
      return (
        <>
          {n.map(i => (
            <CardSkel key={i} />
          ))}
        </>
      )
    case 'project':
      return (
        <>
          {n.map(i => (
            <ProjectSkel key={i} />
          ))}
        </>
      )
    case 'song':
      return (
        <>
          {n.map(i => (
            <SongSkel key={i} art={vp === 'm' ? 48 : 56} />
          ))}
        </>
      )
    case 'chips':
      return (
        <div className="a2-chips" aria-hidden="true">
          {(widths ?? [56, 80, 116, 92, 104, 128, 96, 72]).map((w, i) => (
            <Skel key={i} w={w} h={32} />
          ))}
        </div>
      )
    default:
      return (
        <>
          {n.map(i => (
            <Skel
              key={i}
              w="100%"
              h={16}
              style={i ? {marginTop: 8} : undefined}
            />
          ))}
        </>
      )
  }
}
