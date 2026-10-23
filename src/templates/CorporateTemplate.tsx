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
import {Breadcrumbs} from '../components/Breadcrumbs'
import {Icon} from '../components/Icon'
import {Toc} from '../components/Toc'
import {siteConfig} from '../config/site'
import {useSiteSettings} from '../hooks/useSiteSettings'
import {useHeadings} from '../hooks/useHeadings'
import type {SpecialPage} from '../types/type'

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

export function CorporateTemplate({
  page,
  children,
}: {
  page: SpecialPage
  children: ReactNode
}) {
  const {contactEmail} = useSiteSettings()
  const bodyRef = useRef<HTMLDivElement>(null)
  const headings = useHeadings(bodyRef, 'h2')

  return (
    <main className="flex-1">
      <div className="border-b border-border-muted bg-canvas-subtle">
        <div className="mx-auto w-full max-w-page px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              {label: siteConfig.handle, to: '/'},
              {label: 'legal'},
              {label: page.title},
            ]}
          />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg-strong">
            {page.title}
          </h1>
          <p className="mt-2 max-w-measure text-fg-muted">{page.summary}</p>
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {[
              ['Version', page.version],
              ['Effective', longDate(page.effectiveDate)],
              ['Last updated', longDate(page.updatedAt)],
            ].map(([term, value]) => (
              <div key={term} className="flex gap-2">
                <dt className="text-fg-muted">{term}</dt>
                <dd className="font-medium text-fg-strong">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-page gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[var(--container-sidebar)_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-sticky lg:self-start">
          <Toc headings={headings} title="Contents" numbered />
          <div className="mt-6 rounded-md border border-border bg-surface p-4 text-sm">
            <p className="font-semibold text-fg-strong">Questions?</p>
            <p className="mt-1 text-fg-muted">
              Contact{' '}
              <a href={`mailto:${contactEmail}`} className="text-primary">
                {contactEmail}
              </a>
            </p>
          </div>
        </aside>

        <article className="min-w-0 overflow-hidden rounded-md border border-border bg-surface shadow-xs">
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface-muted px-4 py-2.5 text-sm">
            <Icon name="file" className="text-fg-muted" />
            <span className="font-mono font-semibold text-fg-strong">
              {page.slug}.md
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-2xs font-medium text-fg-muted">
              v{page.version}
            </span>
            <span className="ml-auto text-xs text-fg-muted">
              Updated {longDate(page.updatedAt)}
            </span>
          </div>
          <div
            ref={bodyRef}
            className="max-w-none px-6 py-8 text-base leading-7 [counter-reset:section] sm:px-10"
          >
            {children}
          </div>
        </article>
      </div>
    </main>
  )
}
