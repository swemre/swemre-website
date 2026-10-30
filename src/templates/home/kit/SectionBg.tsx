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

// Section backgrounds: hue glows plus at most one texture (grid, dots, scan, rings, paper, hatch),
// as drawn on the V4 boards. Sizes are per viewport.
import type {CSSProperties} from 'react'
import type {Hue} from '../../../contract/view.ts'
import {useV} from './vp.ts'

export type Texture = 'grid' | 'dots' | 'scan' | 'rings' | 'paper' | 'hatch'
type At = [number, number]

const rgb = (hue: Hue, a: number, k: 'glow' | 'tex') =>
  `rgb(var(--a2-hue-${hue}-rgb) / calc(${a} * var(--a2-${k}-k)))`

function glow(
  at: At,
  size: [number, number],
  background: string,
): CSSProperties {
  return {
    position: 'absolute',
    left: `${at[0]}%`,
    top: `${at[1]}%`,
    width: size[0],
    height: size[1],
    transform: 'translate(-50%,-50%)',
    borderRadius: 999,
    background,
  }
}

function textureStyle(
  texture: Exclude<Texture, 'rings' | 'paper'>,
  hue: Hue,
): CSSProperties {
  switch (texture) {
    case 'grid': {
      const c = rgb(hue, 0.14, 'tex')
      return {
        backgroundImage: `linear-gradient(to right,${c} 1px,transparent 1px),linear-gradient(${c} 1px,transparent 1px)`,
        backgroundSize: '28px 28px',
      }
    }
    case 'dots':
      return {
        backgroundImage: `radial-gradient(${rgb(hue, 0.32, 'tex')} 1px,transparent 1.5px)`,
        backgroundSize: '14px 14px',
      }
    case 'scan': {
      const c = rgb(hue, 0.12, 'tex')
      return {
        backgroundImage: `repeating-linear-gradient(to bottom,${c} 0,${c} 1px,transparent 1px,transparent 4px)`,
      }
    }
    case 'hatch': {
      const c = rgb(hue, 0.11, 'tex')
      return {
        backgroundImage: `repeating-linear-gradient(135deg,${c} 0,${c} 1px,transparent 1px,transparent 9px)`,
      }
    }
  }
}

function Paper() {
  return (
    <svg
      className="a2-paper"
      aria-hidden="true"
      width="100%"
      height="100%"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        opacity: 'var(--a2-paper-op)',
      }}
    >
      <filter id="a2-paper">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.7"
          numOctaves={2}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#a2-paper)" />
    </svg>
  )
}

/** A content section background: a main glow, an optional second glow and an optional texture. */
export function SectionBg({
  hue,
  at,
  second,
  texture,
  alpha = 0.15,
}: {
  hue: Hue
  /** Main glow strength (0.15 on the home sections, 0.12 under list pages). */
  alpha?: number
  /** Main glow centre in % of the section; the texture is masked around it. */
  at: At
  second?: {hue?: Hue; at: At}
  texture?: Texture
}) {
  const v = useV()
  const big = v<[number, number]>(
    [560, 520],
    [840, 720],
    [1120, 860],
    [1485, 1107],
  )
  const small = v<[number, number]>(
    [420, 360],
    [640, 520],
    [920, 640],
    [1215, 810],
  )
  const mask = `radial-gradient(42% 38% at ${at[0]}% ${at[1]}%,#000,transparent)`
  return (
    <div className="a2-bg" aria-hidden="true">
      <div
        style={glow(
          at,
          big,
          `radial-gradient(closest-side,${rgb(hue, alpha, 'glow')},transparent)`,
        )}
      />
      {second && (
        <div
          style={glow(
            second.at,
            small,
            `radial-gradient(closest-side,${rgb(second.hue ?? hue, 0.075, 'glow')},transparent)`,
          )}
        />
      )}
      {texture === 'rings' ? (
        <div
          style={{
            ...glow(
              at,
              v<[number, number]>(
                [360, 360],
                [560, 560],
                [680, 680],
                [820, 820],
              ),
              'none',
            ),
            background: undefined,
            backgroundImage: `repeating-radial-gradient(circle,${rgb(hue, 0.12, 'tex')} 0,${rgb(hue, 0.12, 'tex')} 1px,transparent 1px,transparent 7px)`,
            WebkitMaskImage:
              'radial-gradient(closest-side,#000 35%,transparent)',
            maskImage: 'radial-gradient(closest-side,#000 35%,transparent)',
          }}
        />
      ) : texture === 'paper' ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        >
          <Paper />
        </div>
      ) : texture ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            ...textureStyle(texture, hue),
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        />
      ) : null}
    </div>
  )
}

/** The statement sections (is-xl): a wide neutral glow and two hue glows either side. */
export function StatementBg({left, right}: {left: Hue; right: Hue}) {
  const v = useV()
  const wide = v<[number, number]>(
    [600, 420],
    [900, 560],
    [1300, 640],
    [1700, 760],
  )
  const side = v<[number, number]>(
    [420, 300],
    [620, 420],
    [920, 560],
    [1215, 702],
  )
  return (
    <div className="a2-bg" aria-hidden="true">
      <div
        style={glow(
          [50, 50],
          wide,
          'radial-gradient(closest-side,var(--a2-stmt-glow),transparent)',
        )}
      />
      <div
        style={glow(
          [34, 52],
          side,
          `radial-gradient(closest-side,${rgb(left, 0.068, 'glow')},transparent)`,
        )}
      />
      <div
        style={glow(
          [66, 46],
          side,
          `radial-gradient(closest-side,${rgb(right, 0.068, 'glow')},transparent)`,
        )}
      />
    </div>
  )
}
