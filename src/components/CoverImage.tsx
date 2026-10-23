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

import {cn} from '../utils/cn'

// A cover fills its parent, which sets the aspect ratio and clips the zoom on hover.
// Without an image, the title's initials sit on the blue band gradient and grid.
export function CoverImage({
  src,
  title,
  alt,
  width,
  height,
  className,
}: {
  src?: string
  title: string
  alt?: string
  width?: number
  height?: number
  className?: string
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? ''}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn(
          'size-full object-cover transition-transform duration-700 ease-out',
          className,
        )}
      />
    )
  }
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative grid size-full place-items-center overflow-hidden bg-linear-to-br from-band-from via-band-via to-band-to transition-transform duration-700 ease-out',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-cover-fg)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-cover-fg)_1px,transparent_1px)] mask-radial-[ellipse_at_50%_50%] mask-radial-from-20% mask-radial-to-90% bg-size-[var(--spacing-band-cell)_var(--spacing-band-cell)] opacity-10" />
      <span className="relative font-mono text-5xl font-bold tracking-widest text-cover-fg/80">
        {initials}
      </span>
    </div>
  )
}
