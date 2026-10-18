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

import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {Icon} from './Icon'

export function HomeSection({
  index,
  label,
  title,
  moreTo,
  moreLabel = 'View all',
  children,
}: {
  index: string
  label: string
  title: string
  moreTo?: string
  moreLabel?: string
  children: ReactNode
}) {
  return (
    <section aria-label={label} className="animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-muted pb-5">
        <div>
          <p className="font-mono text-xs font-medium tracking-[0.2em] text-primary uppercase">
            {index} / {label}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-fg-strong sm:text-4xl">
            {title}
          </h2>
        </div>
        {moreTo && (
          <Link
            to={moreTo}
            className="group/more inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:no-underline"
          >
            {moreLabel}
            <Icon
              name="arrow-right"
              size={14}
              className="transition-transform duration-300 group-hover/more:translate-x-1"
            />
          </Link>
        )}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  )
}
