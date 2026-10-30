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

// Texture, Glow, Grain (V4-Comp-Texture), the page grounds (hero and inner-page top) and the Rail
// (V4-Comp-Rail: the side line with nodes, commit labels and the hook). All decorative:
// aria-hidden, pointer-events none, hidden in print.
import type {CSSProperties, ReactNode} from 'react'
import {useViewport, type Viewport} from '../context.ts'
import {RAIL_X, hueRgb, railNodeStyle, type Hue, type RailNode} from './util.ts'

const fill: CSSProperties = {position: 'absolute', inset: 0}

export type TextureKind = 'grid' | 'dots' | 'scan' | 'rings' | 'paper' | 'hatch'

function textureStyle(
  kind: Exclude<TextureKind, 'rings' | 'paper'>,
  hue: Hue,
): CSSProperties {
  const c = (a: number) => hueRgb(hue, `calc(${a} * var(--a2-tex-k))`)
  switch (kind) {
    case 'grid':
      return {
        backgroundImage: `linear-gradient(to right,${c(0.14)} 1px,transparent 1px),linear-gradient(${c(0.14)} 1px,transparent 1px)`,
        backgroundSize: '28px 28px',
      }
    case 'dots':
      return {
        backgroundImage: `radial-gradient(${c(0.32)} 1px,transparent 1.5px)`,
        backgroundSize: '14px 14px',
      }
    case 'scan':
      return {
        backgroundImage: `repeating-linear-gradient(to bottom,${c(0.12)} 0,${c(0.12)} 1px,transparent 1px,transparent 4px)`,
      }
    case 'hatch':
      return {
        backgroundImage: `repeating-linear-gradient(135deg,${c(0.11)} 0,${c(0.11)} 1px,transparent 1px,transparent 9px)`,
      }
  }
}

/** One section texture in the section hue, masked to a soft spot ("42% 38% at 16% 30%"). */
export function Texture({
  kind,
  hue = 'blue',
  mask = '70% 70% at 50% 50%',
  ringsAt = ['50%', '50%'],
  ringsSize = 360,
}: {
  kind: TextureKind
  hue?: Hue
  mask?: string
  ringsAt?: [string, string]
  ringsSize?: number
}) {
  const m = `radial-gradient(${mask},#000,transparent)`
  if (kind === 'rings') {
    const c = hueRgb(hue, 'calc(0.12 * var(--a2-tex-k))')
    return (
      <div
        style={{
          position: 'absolute',
          left: ringsAt[0],
          top: ringsAt[1],
          width: ringsSize,
          height: ringsSize,
          transform: 'translate(-50%,-50%)',
          borderRadius: 999,
          backgroundImage: `repeating-radial-gradient(circle,${c} 0,${c} 1px,transparent 1px,transparent 7px)`,
          WebkitMaskImage: 'radial-gradient(closest-side,#000 35%,transparent)',
          maskImage: 'radial-gradient(closest-side,#000 35%,transparent)',
        }}
      />
    )
  }
  if (kind === 'paper')
    return (
      <div style={{...fill, WebkitMaskImage: m, maskImage: m}}>
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
      </div>
    )
  return (
    <div
      style={{
        ...fill,
        ...textureStyle(kind, hue),
        WebkitMaskImage: m,
        maskImage: m,
      }}
    />
  )
}

/** A soft hue light: radial gradient, alpha x --a2-glow-k (.66 in light). */
export function Glow({
  hue = 'blue',
  x,
  y,
  w,
  h,
  alpha = 0.15,
  color,
}: {
  hue?: Hue
  x: string
  y: string
  w: number
  h: number
  alpha?: number
  /** A token instead of the hue (var(--a2-stmt-glow)). */
  color?: string
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transform: 'translate(-50%,-50%)',
        borderRadius: 999,
        background: `radial-gradient(closest-side,${color ?? hueRgb(hue, `calc(${alpha} * var(--a2-glow-k))`)},transparent)`,
      }}
    />
  )
}

/** The section background layer (a2-bg) that holds glows and one texture. */
export function SectionBg({children}: {children: ReactNode}) {
  return (
    <div className="a2-bg" aria-hidden="true">
      {children}
    </div>
  )
}

/** Film grain over the whole page (fractal noise at --a2-grain-op; multiplied in light). */
export function Grain({fixed = true}: {fixed?: boolean}) {
  return (
    <div
      className={fixed ? 'a2-grain-layer a2-site-grain' : 'a2-grain-layer'}
      aria-hidden="true"
      style={
        fixed
          ? undefined
          : {
              position: 'absolute',
              inset: 0,
              zIndex: 60,
              pointerEvents: 'none',
              opacity: 'var(--a2-grain-op)',
            }
      }
    >
      <svg width="100%" height="100%" style={{display: 'block'}}>
        <filter id="a2-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#a2-grain)" />
      </svg>
    </div>
  )
}

const GRID_BG = (op: string, line: string): CSSProperties => ({
  ...fill,
  opacity: op,
  backgroundImage: `linear-gradient(to right,${line} 1px,transparent 1px),linear-gradient(${line} 1px,transparent 1px)`,
  backgroundSize: '56px 56px',
})

const TOP: Record<Viewport, {h: number; blur: number}> = {
  m: {h: 560, blur: 60},
  t: {h: 640, blur: 90},
  d: {h: 800, blur: 120},
  '4k': {h: 880, blur: 120},
}

/** The inner-page top ground: top gradient, two glows and the 56px grid, faded out. 'status' is
 * the neutral ground of the error pages. */
export function TopGround({
  tone = 'navy',
  height,
}: {
  tone?: 'navy' | 'status'
  height?: number
}) {
  const vp = useViewport()
  const {h: h0, blur} = TOP[vp]
  const h = height ?? h0
  const gridMask = `linear-gradient(to bottom,#000 54px,transparent ${Math.round(h * 0.7)}px)`
  const glow = (
    left: string,
    top: number,
    w: string,
    gh: number,
    bg: string,
  ): CSSProperties => ({
    position: 'absolute',
    left,
    top,
    width: w,
    height: gh,
    borderRadius: 999,
    background: bg,
    filter: `blur(${blur}px)`,
  })
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: h,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        WebkitMaskImage:
          'linear-gradient(to bottom,#000 0,#000 40%,transparent 100%)',
        maskImage:
          'linear-gradient(to bottom,#000 0,#000 40%,transparent 100%)',
      }}
    >
      <div
        style={{
          ...fill,
          backgroundImage:
            tone === 'navy' ? 'var(--a2-top-grad)' : 'var(--a2-status-grad)',
        }}
      />
      {tone === 'navy' && (
        <>
          <div
            style={glow(
              '32%',
              -h * 0.5,
              '38%',
              h * 0.7,
              'var(--a2-top-glow-1)',
            )}
          />
          <div
            style={glow('66%', h * 0.1, '30%', h * 0.5, 'var(--a2-top-glow-2)')}
          />
        </>
      )}
      <div
        style={{
          ...(tone === 'navy'
            ? GRID_BG('var(--a2-grid-op)', 'var(--a2-grid-line)')
            : GRID_BG(
                'var(--a2-grid-op-status)',
                'var(--a2-grid-line-status)',
              )),
          WebkitMaskImage: gridMask,
          maskImage: gridMask,
        }}
      />
    </div>
  )
}

export interface RailProps {
  /** Gradient from the previous section's hue to this one. */
  from?: Hue
  to?: Hue
  top?: number
  bottom?: number
  dashed?: boolean
  nodes?: RailNode[]
  /** Commit label (desktop and 4K only), placed 30 under the first node unless given. */
  label?: {text: string; top?: number; bottom?: number}
  /** The hook that bends the rail in from the left edge, at this top (desktop and 4K only).
   * The line then starts 104 lower. */
  hook?: number
}

export function Rail({
  from = 'blue',
  to,
  top = 0,
  bottom = 0,
  dashed,
  nodes = [],
  label,
  hook,
}: RailProps) {
  const vp = useViewport()
  const x = RAIL_X[vp]
  const wide = vp === 'd' || vp === '4k'
  const end = to ?? from
  const lineTop = wide && hook !== undefined ? hook + 104 : top
  return (
    <>
      {wide && hook !== undefined && (
        <svg
          aria-hidden="true"
          width="112"
          height="104"
          viewBox="0 0 112 104"
          style={{
            position: 'absolute',
            left: 0,
            top: hook,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <path
            d={`M -24 18 C 30 18, ${x + 1} 44, ${x + 1} 104`}
            strokeWidth="6"
            fill="none"
            opacity=".1"
            style={{stroke: `var(--a2-hue-${from})`, filter: 'blur(4px)'}}
          />
          <path
            d={`M -24 18 C 30 18, ${x + 1} 44, ${x + 1} 104`}
            strokeWidth="2"
            fill="none"
            style={{
              stroke: `var(--a2-hue-${from})`,
              opacity: 'var(--a2-rail-op)',
            }}
          />
        </svg>
      )}
      <span
        className="a2-rail"
        aria-hidden="true"
        style={{
          left: x,
          top: lineTop,
          bottom,
          ...(dashed
            ? {
                width: 2,
                background: `repeating-linear-gradient(to bottom,var(--a2-hue-${end}) 0 6px,transparent 6px 12px)`,
              }
            : {
                background: `linear-gradient(to bottom,var(--a2-hue-${from}),var(--a2-hue-${end}))`,
              }),
        }}
      />
      {nodes.map((n, i) => (
        <span
          key={i}
          className="a2-node"
          aria-hidden="true"
          style={railNodeStyle(x, n, end)}
        />
      ))}
      {wide && label && (
        <span
          className="a2-raillabel"
          aria-hidden="true"
          style={{
            left: x - 37,
            ...(label.bottom !== undefined
              ? {bottom: label.bottom}
              : {top: label.top ?? (nodes[0]?.top ?? 0) + 30}),
          }}
        >
          {label.text}
        </span>
      )}
    </>
  )
}
