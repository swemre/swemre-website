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

// The CMS saves a focal point from 0 to 100; covers crop around it in steps of 5, which main.css
// lists for Tailwind (@source inline) because the class name is built here
export function coverPositionClass(position?: number): string | undefined {
  if (position === undefined || !Number.isFinite(position)) return undefined
  const step = Math.min(100, Math.max(0, Math.round(position / 5) * 5))
  return `object-[center_${step}%]`
}
