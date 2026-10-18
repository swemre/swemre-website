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

// Decorative night-sky gradient with drifting aurora glows and a grid that fades out
// towards the edges. The parent must be `relative isolate` so the layers sit behind its content.
export function BandBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-band-from via-band-via to-band-to" />
      <div className="absolute -top-1/3 -left-1/6 size-glow-lg animate-drift rounded-full bg-band-glow/35 blur-3xl" />
      <div className="absolute -top-1/4 right-[-10%] size-glow-md animate-drift rounded-full bg-band-glow-2/25 blur-3xl [animation-delay:-7s]" />
      <div className="absolute bottom-[-40%] left-1/3 size-glow-sm animate-drift rounded-full bg-band-glow-3/20 blur-3xl [animation-delay:-13s]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-cover-fg)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-cover-fg)_1px,transparent_1px)] mask-radial-[ellipse_at_50%_0%] mask-radial-from-10% mask-radial-to-80% bg-size-[var(--spacing-band-cell)_var(--spacing-band-cell)] opacity-[0.08]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-cover-fg/25 to-transparent" />
    </div>
  )
}
