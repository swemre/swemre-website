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

// Decorative layers of the V4 page sections, as drawn in the playables: the top glow behind the
// nav, the rail with its nodes and hash labels, section glows and textures. All aria-hidden.
import type {CSSProperties, ReactNode} from 'react'
import type {Hue} from '../../contract/view.ts'
import {useViewport, type Viewport} from '../../design/index.tsx'
import {hueVar, rgb, statusMinHeight, usePick, type PerVp} from './vp.ts'

const RAIL_LEFT: Record<Viewport, number> = {m: 8, t: 16, d: 48, '4k': 55}
const LABEL_LEFT: Record<Viewport, number> = {m: 0, t: 0, d: 11, '4k': 18}

/** The navy top wash behind the nav and hero ("top") or the plain one of status pages. */
export function TopGlow({status}: {status?: boolean}) {
  const vp = useViewport()
  const h = {m: 560, t: 640, d: 800, '4k': 880}[vp]
  const blur = {m: 60, t: 90, d: 120, '4k': 120}[vp]
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
          position: 'absolute',
          inset: 0,
          backgroundImage: status
            ? 'var(--a2-status-grad)'
            : 'var(--a2-top-grad)',
        }}
      />
      {!status && (
        <>
          <div
            style={{
              position: 'absolute',
              left: '32%',
              top: -h / 2,
              width: '38%',
              height: h * 0.7,
              borderRadius: 999,
              background: 'var(--a2-top-glow-1)',
              filter: `blur(${blur}px)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '66%',
              top: h / 10,
              width: '30%',
              height: h / 2,
              borderRadius: 999,
              background: 'var(--a2-top-glow-2)',
              filter: `blur(${blur}px)`,
            }}
          />
        </>
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: status ? 'var(--a2-grid-op-status)' : 'var(--a2-grid-op)',
          backgroundImage: status
            ? 'linear-gradient(to right,var(--a2-grid-line-status) 1px,transparent 1px),linear-gradient(var(--a2-grid-line-status) 1px,transparent 1px)'
            : 'linear-gradient(to right,var(--a2-grid-line) 1px,transparent 1px),linear-gradient(var(--a2-grid-line) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
          WebkitMaskImage: `linear-gradient(to bottom,#000 54px,transparent ${h * 0.7}px)`,
          maskImage: `linear-gradient(to bottom,#000 54px,transparent ${h * 0.7}px)`,
        }}
      />
    </div>
  )
}

/** The status-page backdrop (404, 500, 503, newsletter status): status wash, arc light, grid. */
export function StatusBackdrop() {
  const vp = useViewport()
  const arc = {
    m: {up: 260, height: 520},
    t: {up: 220, height: 700},
    d: {up: 180, height: 820},
    '4k': {up: 180, height: 900},
  }[vp]
  const minH = statusMinHeight(vp)
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: -120,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        WebkitMaskImage: `linear-gradient(to bottom,#000 0,#000 calc(${minH} - 40px),transparent 100%)`,
        maskImage: `linear-gradient(to bottom,#000 0,#000 calc(${minH} - 40px),transparent 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'var(--a2-status-grad)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -20,
          top: `calc(${minH} - ${arc.up}px)`,
          width: 'calc(100% + 40px)',
          height: arc.height,
          borderRadius: '50%',
          backgroundImage:
            'radial-gradient(ellipse 50% 40% at 50% 0%,var(--a2-arc-light),transparent 70%)',
          boxShadow: '0 -30px 80px -20px var(--a2-arc-light-2)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 'var(--a2-grid-op-status)',
          backgroundImage:
            'linear-gradient(to right,var(--a2-grid-line-status) 1px,transparent 1px),linear-gradient(var(--a2-grid-line-status) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
          WebkitMaskImage:
            'linear-gradient(to bottom,#000 54px,transparent 580px)',
          maskImage: 'linear-gradient(to bottom,#000 54px,transparent 580px)',
        }}
      />
    </div>
  )
}

/** The curve that brings the rail in from the left edge (desktop and 4K heroes). */
export function HeroCurve({hue, top}: {hue: Hue; top: number}) {
  const vp = useViewport()
  if (vp === 'm' || vp === 't') return null
  const x = vp === '4k' ? 56 : 49
  const d = `M -24 18 C 30 18, ${x} 44, ${x} 104`
  return (
    <svg
      aria-hidden="true"
      width="112"
      height="104"
      viewBox="0 0 112 104"
      style={{
        position: 'absolute',
        left: 0,
        top,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <path
        d={d}
        strokeWidth="6"
        fill="none"
        opacity=".1"
        style={{stroke: hueVar(hue), filter: 'blur(4px)'}}
      />
      <path
        d={d}
        strokeWidth="2"
        fill="none"
        style={{stroke: hueVar(hue), opacity: 'var(--a2-rail-op)'}}
      />
    </svg>
  )
}

export interface RailSpec {
  /** Gradient from this hue (defaults to `hue`). */
  from?: Hue
  hue: Hue
  top?: number
  bottom?: number
  height?: number
}

export function Rail({from, hue, top = 0, bottom = 0, height}: RailSpec) {
  const left = RAIL_LEFT[useViewport()]
  return (
    <span
      className="a2-rail"
      aria-hidden="true"
      style={{
        left,
        top,
        ...(height === undefined ? {bottom} : {height}),
        background: `linear-gradient(to bottom,${hueVar(from ?? hue)},${hueVar(hue)})`,
      }}
    />
  )
}

/** A rail node. `end` is the filled, ringed node that closes a rail or marks a page anchor. */
export function Node({
  hue,
  top,
  bottom,
  end,
}: {
  hue: Hue
  top?: number
  bottom?: number
  end?: boolean
}) {
  const left = RAIL_LEFT[useViewport()] - 5.25
  const pos: CSSProperties = top !== undefined ? {top} : {bottom}
  return (
    <span
      className="a2-node"
      aria-hidden="true"
      style={{
        left,
        ...pos,
        ...(end
          ? {
              background: hueVar(hue),
              boxShadow: `0 0 0 2px ${hueVar(hue)},0 0 0 6px ${rgb(hue, 'calc(0.14 * var(--a2-node-glow-k))')},0 0 26px ${rgb(hue, 'calc(0.55 * var(--a2-node-glow-k))')}`,
            }
          : {
              boxShadow: `0 0 0 2px ${hueVar(hue)},0 0 14px ${rgb(hue, 'calc(0.4 * var(--a2-node-glow-k))')}`,
            }),
      }}
    />
  )
}

/** The vertical commit-hash label under a node; desktop and 4K only. */
export function RailLabel({
  text,
  top,
  bottom,
}: {
  text: string
  top?: number
  bottom?: number
}) {
  const vp = useViewport()
  if (vp === 'm' || vp === 't') return null
  return (
    <span
      className="a2-raillabel"
      aria-hidden="true"
      style={{left: LABEL_LEFT[vp], ...(top !== undefined ? {top} : {bottom})}}
    >
      {text}
    </span>
  )
}

const GLOW: Record<'lg' | 'sm', Record<Viewport, [number, number]>> = {
  lg: {m: [560, 520], t: [840, 720], d: [1120, 860], '4k': [1485, 1107]},
  sm: {m: [420, 360], t: [640, 520], d: [920, 640], '4k': [1215, 810]},
}

/** A soft radial glow centred at (x, y). */
export function Glow({
  hue,
  x,
  y,
  a,
  size = 'lg',
}: {
  hue: Hue
  x: string
  y: string
  a: number
  size?: 'lg' | 'sm'
}) {
  const [w, h] = GLOW[size][useViewport()]
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
        background: `radial-gradient(closest-side,${rgb(hue, `calc(${a} * var(--a2-glow-k))`)},transparent)`,
      }}
    />
  )
}

export type TextureKind = 'grid' | 'dots' | 'lines' | 'diag' | 'rings'

/** A hue texture, masked to a soft ellipse around (x, y). */
export function Texture({
  kind,
  hue,
  x,
  y,
}: {
  kind: TextureKind
  hue: Hue
  x: string
  y: string
}) {
  const rings = {m: 360, t: 560, d: 680, '4k': 820}[useViewport()]
  const k = (a: number) => rgb(hue, `calc(${a} * var(--a2-tex-k))`)
  const mask = `radial-gradient(42% 38% at ${x} ${y},#000,transparent)`
  if (kind === 'rings') {
    return (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: rings,
          height: rings,
          transform: 'translate(-50%,-50%)',
          borderRadius: 999,
          backgroundImage: `repeating-radial-gradient(circle,${k(0.12)} 0,${k(0.12)} 1px,transparent 1px,transparent 7px)`,
          WebkitMaskImage: 'radial-gradient(closest-side,#000 35%,transparent)',
          maskImage: 'radial-gradient(closest-side,#000 35%,transparent)',
        }}
      />
    )
  }
  const bg: Record<Exclude<TextureKind, 'rings'>, CSSProperties> = {
    grid: {
      backgroundImage: `linear-gradient(to right,${k(0.14)} 1px,transparent 1px),linear-gradient(${k(0.14)} 1px,transparent 1px)`,
      backgroundSize: '28px 28px',
    },
    dots: {
      backgroundImage: `radial-gradient(${k(0.32)} 1px,transparent 1.5px)`,
      backgroundSize: '14px 14px',
    },
    lines: {
      backgroundImage: `repeating-linear-gradient(to bottom,${k(0.12)} 0,${k(0.12)} 1px,transparent 1px,transparent 4px)`,
    },
    diag: {
      backgroundImage: `repeating-linear-gradient(135deg,${k(0.11)} 0,${k(0.11)} 1px,transparent 1px,transparent 9px)`,
    },
  }
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        ...bg[kind],
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  )
}

export interface SecDeco {
  rail: RailSpec
  node?: {top?: PerVp<number>; bottom?: PerVp<number>; end?: boolean; hue?: Hue}
  label?: string
  /** Glows and textures, drawn inside .a2-bg. */
  bg?: ReactNode
  /** A layer drawn before .a2-bg and the rail, unclipped (the status backdrop). */
  backdrop?: ReactNode
}

/** A page section (.a2-sec) with its rail, node, label and background layers. */
export function Sec({
  deco,
  style,
  children,
  id,
  labelledBy,
  hidePrint,
}: {
  /** Leave the section out of the printed page. */
  hidePrint?: boolean
  deco: SecDeco
  style?: CSSProperties
  children: ReactNode
  id?: string
  labelledBy?: string
}) {
  const pickVp = usePick()
  const pick = (v?: PerVp<number>) => (v === undefined ? undefined : pickVp(v))
  const nodeTop = pick(deco.node?.top)
  const nodeBottom = pick(deco.node?.bottom)
  const hue = deco.node?.hue ?? deco.rail.hue
  return (
    <section
      className="a2-sec"
      data-cut
      style={style}
      id={id}
      aria-labelledby={labelledBy}
      data-print={hidePrint ? 'hide' : undefined}
    >
      {deco.backdrop}
      {deco.bg && (
        <div className="a2-bg" aria-hidden="true">
          {deco.bg}
        </div>
      )}
      <Rail {...deco.rail} />
      {deco.node && (
        <Node hue={hue} top={nodeTop} bottom={nodeBottom} end={deco.node.end} />
      )}
      {deco.label && (
        <RailLabel
          text={deco.label}
          top={nodeTop === undefined ? undefined : nodeTop + 30}
          bottom={
            nodeTop === undefined && nodeBottom !== undefined ? 0 : undefined
          }
        />
      )}
      {children}
    </section>
  )
}
