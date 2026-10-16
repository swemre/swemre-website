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

// Classes that restyle navbar controls while the navbar is transparent over
// a cover image. The <header> carries `group/nav` and `data-tone="cover"`.
// Kept as literal strings so Tailwind can find them.

export const coverControl =
  'group-data-[tone=cover]/nav:border-cover-fg/25 group-data-[tone=cover]/nav:bg-cover-fg/10 group-data-[tone=cover]/nav:text-cover-fg group-data-[tone=cover]/nav:shadow-none group-data-[tone=cover]/nav:hover:bg-cover-fg/20 group-data-[tone=cover]/nav:hover:text-cover-fg'

export const coverText = 'group-data-[tone=cover]/nav:text-cover-fg'

export const coverKbd =
  'group-data-[tone=cover]/nav:border-cover-fg/25 group-data-[tone=cover]/nav:bg-transparent group-data-[tone=cover]/nav:text-cover-fg/80'

export const coverCta =
  'group-data-[tone=cover]/nav:border-cover-fg group-data-[tone=cover]/nav:bg-cover-fg group-data-[tone=cover]/nav:text-cover-ink group-data-[tone=cover]/nav:hover:border-cover-fg/90 group-data-[tone=cover]/nav:hover:bg-cover-fg/90'
