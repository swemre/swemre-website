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

/* eslint-disable react-refresh/only-export-components -- the rail helpers live with the rail */
// The section rail: the side line in the section hues, its commit node and the hash label.
// Desktop and 4K draw the label; tablet and mobile draw the line and node only.
import type {CSSProperties} from 'react'
import type {Hue} from '../../../contract/view.ts'
import {useViewport} from '../../../design/index.tsx'
import {useV} from './vp.ts'

const RAIL_LEFT = {m: 8, t: 16, d: 48, '4k': 55} as const

export function useRailLeft(): number {
  return RAIL_LEFT[useViewport()]
}

export function nodeGlow(hue: Hue): string {
  return `0 0 0 2px var(--a2-hue-${hue}),0 0 14px rgb(var(--a2-hue-${hue}-rgb) / calc(0.4 * var(--a2-node-glow-k)))`
}

/** The filled end node of the last rail on a page. */
export function endGlow(hue: Hue): string {
  return `0 0 0 2px var(--a2-hue-${hue}),0 0 0 6px rgb(var(--a2-hue-${hue}-rgb) / calc(0.14 * var(--a2-node-glow-k))),0 0 26px rgb(var(--a2-hue-${hue}-rgb) / calc(0.55 * var(--a2-node-glow-k)))`
}

export function Rail({
  from,
  to,
  node,
  label,
  hook = false,
  end = false,
}: {
  from: Hue
  to: Hue
  /** Node top per viewport: [m, t, d, k]. */
  node: [number, number, number, number]
  /** The hash label (desktop and 4K). */
  label?: string
  /** The entry hook from the hero into the first rail (desktop and 4K). */
  hook?: boolean
  /** The rail ends at its node (the last section on the page). */
  end?: boolean
}) {
  const v = useV()
  const left = useRailLeft()
  const wide = v(false, false, true)
  const top = v(...node)
  const withHook = hook && wide
  const railStyle: CSSProperties = {
    left,
    top: withHook ? 104 : 0,
    background: `linear-gradient(to bottom,var(--a2-hue-${from}),var(--a2-hue-${to}))`,
    ...(end ? {height: top + v(5, 5, 6)} : {bottom: 0}),
  }
  return (
    <>
      {withHook && (
        <svg
          aria-hidden="true"
          width="112"
          height="104"
          viewBox="0 0 112 104"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <path
            d={`M -24 18 C 30 18, ${left + 1} 44, ${left + 1} 104`}
            strokeWidth="6"
            fill="none"
            opacity=".1"
            style={{stroke: `var(--a2-hue-${to})`, filter: 'blur(4px)'}}
          />
          <path
            d={`M -24 18 C 30 18, ${left + 1} 44, ${left + 1} 104`}
            strokeWidth="2"
            fill="none"
            style={{
              stroke: `var(--a2-hue-${to})`,
              opacity: 'var(--a2-rail-op)',
            }}
          />
        </svg>
      )}
      <span className="a2-rail" aria-hidden="true" style={railStyle} />
      <span
        className="a2-node"
        aria-hidden="true"
        style={{
          left: left - 5.25,
          top,
          ...(end
            ? {background: `var(--a2-hue-${to})`, boxShadow: endGlow(to)}
            : {boxShadow: nodeGlow(to)}),
        }}
      />
      {label && wide && (
        <span
          className="a2-raillabel"
          aria-hidden="true"
          style={{left: left - 37, top: top + 30}}
        >
          {label}
        </span>
      )}
    </>
  )
}
