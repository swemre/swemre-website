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

// Per-viewport values for B's templates (home, articles, topic, projects, search). The boards draw
// every metric per viewport; v(m, t, d, k) picks the one for the current viewport (k falls back to
// d, the 4K layout being the 1920 desktop layout zoomed).
import {useViewport, type Viewport} from '../../../design/index.tsx'

export type Pick4 = <T>(m: T, t: T, d: T, k?: T) => T

export function pick4(vp: Viewport): Pick4 {
  return (m, t, d, k) => {
    if (vp === 'm') return m
    if (vp === 't') return t
    if (vp === '4k') return k === undefined ? d : k
    return d
  }
}

/** Returns v(m, t, d, k?) for the current viewport. */
export function useV(): Pick4 {
  return pick4(useViewport())
}

/** True on mobile and tablet (the compact layouts). */
export function useCompact(): boolean {
  const vp = useViewport()
  return vp === 'm' || vp === 't'
}
