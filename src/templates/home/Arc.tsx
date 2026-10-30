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

// The home hero arc: the glowing ellipse, its commit nodes and the HEAD tag. Geometry from the
// boards (ellipse centred on the hero bottom edge), scaled to the measured width.
import {useId, useRef} from 'react'
import {useViewport} from '../../design/index.tsx'
import {useReducedMotion, useWidth} from './kit/hooks.ts'

interface ArcSpec {
  /** Board width the x positions were drawn at. */
  board: number
  /** SVG height; the ellipse centre sits on it. */
  height: number
  /** Horizontal radius minus half the width. */
  overhang: number
  ry: number
  /** Glow stroke width. */
  glow: number
  nodes: number[]
  head: number
}

const ARC: Record<'m' | 't' | 'd' | '4k', ArcSpec> = {
  m: {
    board: 390,
    height: 344,
    overhang: 405,
    ry: 300,
    glow: 5,
    nodes: [84, 204],
    head: 318,
  },
  t: {
    board: 834,
    height: 1040,
    overhang: 8.7,
    ry: 340,
    glow: 7,
    nodes: [232, 320, 408, 496],
    head: 584,
  },
  d: {
    board: 1440,
    height: 1140,
    overhang: 15,
    ry: 420,
    glow: 7,
    nodes: [404, 556, 704, 856],
    head: 1012,
  },
  '4k': {
    board: 1920,
    height: 1350,
    overhang: 20,
    ry: 450,
    glow: 7,
    nodes: [540, 740, 940, 1140],
    head: 1350,
  },
}

export function Arc({label}: {label: string}) {
  const vp = useViewport()
  const spec = ARC[vp]
  const box = useRef<HTMLDivElement>(null)
  const w = useWidth(box, spec.board)
  const reduced = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const cx = w / 2
  const cy = spec.height
  const rx = cx + spec.overhang
  const y = (x: number) =>
    cy - spec.ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2))
  const sx = (x: number) => (x * w) / spec.board
  const end = rx - 0.8
  const endY = y(cx + end)
  const path = `M ${(cx - end).toFixed(1)} ${endY.toFixed(1)} A ${rx.toFixed(1)} ${spec.ry} 0 0 1 ${(cx + end).toFixed(1)} ${endY.toFixed(1)}`
  const hx = sx(spec.head)
  const hy = y(hx)
  return (
    <div
      ref={box}
      aria-hidden="true"
      style={{position: 'absolute', left: 0, right: 0, top: 0, height: 0}}
    >
      <svg
        width={w}
        height={spec.height}
        viewBox={`0 0 ${w} ${spec.height}`}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 0,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient
            id={`${id}g`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={w}
            y2="0"
          >
            <stop
              offset="0"
              style={{stopColor: 'var(--a2-arc-0)', stopOpacity: 0.9}}
            />
            <stop offset=".3" style={{stopColor: 'var(--a2-arc-1)'}} />
            <stop offset=".62" style={{stopColor: 'var(--a2-arc-2)'}} />
            <stop offset=".85" style={{stopColor: 'var(--a2-arc-1)'}} />
            <stop
              offset="1"
              style={{stopColor: 'var(--a2-arc-0)', stopOpacity: 0.7}}
            />
          </linearGradient>
          <filter id={`${id}b`} x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={`${id}t`} x="-50%" y="-100%" width="200%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
            <feComponentTransfer in="b" result="b2">
              <feFuncA type="linear" slope="0.55" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g
          fontSize="12"
          letterSpacing="0.4"
          style={{fontFamily: 'var(--font-mono)'}}
        >
          <path
            d={path}
            stroke={`url(#${id}g)`}
            strokeWidth={spec.glow}
            fill="none"
            style={{opacity: 'var(--a2-arc-blur-op)'}}
            filter={`url(#${id}b)`}
          />
          <path
            d={path}
            stroke={`url(#${id}g)`}
            strokeWidth="1.5"
            fill="none"
          />
          {spec.nodes.map((x, i) => (
            <circle
              key={x}
              cx={sx(x)}
              cy={y(sx(x))}
              r="4.5"
              strokeWidth="1.6"
              style={{
                fill: 'var(--a2-arc-node)',
                stroke:
                  i === 0 ? 'var(--a2-hue-sky)' : 'var(--a2-arc-node-line)',
              }}
            />
          ))}
          <line
            x1={hx}
            y1={hy - 7}
            x2={hx}
            y2={hy - 16}
            strokeWidth="1"
            style={{stroke: 'var(--a2-arc-stem)'}}
          />
          <rect
            x={hx - 48.9}
            y={hy - 38}
            width="97.8"
            height="22"
            rx="5"
            filter={`url(#${id}t)`}
            style={{fill: 'var(--a2-arc-tag)'}}
          />
          <text
            x={hx}
            y={hy - 23}
            textAnchor="middle"
            fontWeight="600"
            style={{fill: 'var(--a2-arc-tag-text)'}}
          >
            {label}
          </text>
          <circle
            cx={hx}
            cy={hy}
            r="7"
            fill="none"
            strokeWidth="1"
            opacity=".6"
            style={{stroke: 'var(--a2-arc-node-line)'}}
          >
            {!reduced && (
              <>
                <animate
                  attributeName="r"
                  values="7;20"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
          <circle
            cx={hx}
            cy={hy}
            r="11"
            opacity=".14"
            style={{fill: 'var(--a2-arc-node-line)'}}
          />
          <circle
            cx={hx}
            cy={hy}
            r="5.5"
            filter={`url(#${id}t)`}
            style={{fill: 'var(--a2-arc-node-line)'}}
          />
        </g>
      </svg>
    </div>
  )
}
