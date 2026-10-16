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

// Decorative primary-tone gradient, glow and grid. The parent must be
// `relative isolate` so the layers sit behind its content.
export function BandBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-band-from via-band-via to-band-to" />
      <div className="absolute inset-0 bg-radial-[at_80%_0%] from-band-glow/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-cover-fg)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-cover-fg)_1px,transparent_1px)] bg-size-[var(--spacing-band-cell)_var(--spacing-band-cell)] opacity-[0.07]" />
    </div>
  )
}
