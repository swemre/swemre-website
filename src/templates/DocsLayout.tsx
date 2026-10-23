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

import {useRef, type ReactNode} from 'react'
import {Icon} from '../components/Icon'
import {Toc} from '../components/Toc'
import {useHeadings} from '../hooks/useHeadings'
import {docsColumns} from '../utils/layout'

export function DocsLayout({
  sidebar,
  before,
  after,
  children,
}: {
  sidebar: ReactNode
  before?: ReactNode
  after?: ReactNode
  children: ReactNode
}) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const headings = useHeadings(bodyRef)

  return (
    <div className={`${docsColumns} flex-1 py-10`}>
      <aside
        aria-label="Related"
        className="hidden lg:sticky lg:top-sticky lg:block lg:max-h-[calc(100dvh-var(--spacing-sticky))] lg:self-start lg:overflow-y-auto"
      >
        {sidebar}
      </aside>

      <main id="main" className="min-w-0">
        <div className="mx-auto max-w-reading">
          {before}
          {headings.length > 0 && (
            <details className="group mb-8 rounded-lg border border-border bg-surface shadow-xs xl:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-fg-strong [&::-webkit-details-marker]:hidden">
                On this page
                <Icon
                  name="chevron-down"
                  size={16}
                  className="text-fg-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="border-t border-border-muted px-4 py-3">
                <Toc headings={headings} showTitle={false} />
              </div>
            </details>
          )}
          <div ref={bodyRef} className="text-reading">
            {children}
          </div>
          {after}
        </div>
      </main>

      <aside
        aria-label="On this page"
        className="hidden xl:sticky xl:top-sticky xl:block xl:self-start"
      >
        <Toc headings={headings} />
      </aside>
    </div>
  )
}
