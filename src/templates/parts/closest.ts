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

// "Did you mean": the published slug closest to a mistyped one (Levenshtein distance).

export function distance(a: string, b: string): number {
  const row = Array.from({length: b.length + 1}, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      prev = tmp
    }
  }
  return row[b.length]
}

/** The item whose slug is closest to `slug`, if it is close enough to be a typo. */
export function closest<T extends {slug: string}>(
  slug: string,
  items: T[],
): T | undefined {
  const s = slug.toLowerCase()
  let best: T | undefined
  let bestD = Infinity
  for (const it of items) {
    if (it.slug === s) continue
    const d = it.slug.startsWith(s) && s.length >= 4 ? 1 : distance(s, it.slug)
    if (d < bestD) {
      bestD = d
      best = it
    }
  }
  return best && bestD <= Math.max(3, Math.floor(s.length * 0.4))
    ? best
    : undefined
}
