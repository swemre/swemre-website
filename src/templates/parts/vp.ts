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

// Hue colour helpers and per-viewport picks shared by the decoration and the templates.
import type {Hue} from '../../contract/view.ts'
import {useViewport, type Viewport} from '../../design/index.tsx'

export type PerVp<T> = {m: T; t?: T; d: T; k?: T}

export const rgb = (hue: Hue, a: number | string) =>
  `rgb(var(--a2-hue-${hue}-rgb) / ${a})`

export const hueVar = (hue: Hue) => `var(--a2-hue-${hue})`

/** Status pages fill the window: 100vh, in 1920 layout px at 4K. */
export function statusMinHeight(vp: Viewport) {
  return vp === '4k' ? 'calc(100vh / var(--a2-zoom, 2))' : '100vh'
}

/** Picks a per-viewport value (t falls back to m, k to d). */
export function usePick() {
  const vp = useViewport()
  return <T>(v: PerVp<T>): T =>
    vp === 'm'
      ? v.m
      : vp === 't'
        ? (v.t ?? v.m)
        : vp === '4k'
          ? (v.k ?? v.d)
          : v.d
}

/** The hero padding of the detail pages. */
export function useHeroPad() {
  const pick = usePick()
  return {
    paddingTop: pick({m: 112, t: 128, d: 160, k: 192}),
    paddingBottom: pick({m: 32, t: 32, d: 48, k: 64}),
  }
}
