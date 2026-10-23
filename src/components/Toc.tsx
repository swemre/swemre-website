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

import {useActiveHeading} from '../hooks/useActiveHeading'
import type {TocHeading} from '../types/type'
import {cn} from '../utils/cn'

export function Toc({
  headings,
  title = 'On this page',
  numbered = false,
  showTitle = true,
}: {
  headings: TocHeading[]
  title?: string
  numbered?: boolean
  showTitle?: boolean
}) {
  const active = useActiveHeading(headings)
  if (headings.length === 0) return null

  const numbers = headings.map(
    (_, i) => headings.slice(0, i + 1).filter(h => h.level === 2).length,
  )
  return (
    <nav aria-label={title} className="text-sm">
      {showTitle && (
        <p className="mb-3 text-xs font-semibold text-fg-strong">{title}</p>
      )}
      <ul className="border-l border-border-muted">
        {headings.map((heading, i) => {
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  '-ml-px block border-l-2 py-1 leading-snug transition-colors hover:no-underline',
                  heading.level === 3 ? 'pl-6' : 'pl-3',
                  active === heading.id
                    ? 'border-primary font-medium text-primary'
                    : 'border-transparent text-fg-muted hover:border-border-strong hover:text-fg-strong',
                )}
              >
                {numbered && heading.level === 2 && `${numbers[i]}. `}
                {heading.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
