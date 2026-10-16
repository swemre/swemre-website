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
import {Breadcrumbs} from './Breadcrumbs'

export function DocHeader({
  crumbs,
  badges,
  title,
  summary,
  meta,
  actions,
}: {
  crumbs: Array<{label: string; to?: string}>
  badges?: ReactNode
  title: string
  summary: string
  meta?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="mb-8 border-b border-border-muted pb-6">
      <Breadcrumbs items={crumbs} />
      {badges && (
        <div className="mt-5 flex flex-wrap items-center gap-2">{badges}</div>
      )}
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance text-fg-strong">
        {title}
      </h1>
      <p className="mt-3 max-w-measure text-lg text-fg-muted">{summary}</p>
      {(meta || actions) && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-muted">
            {meta}
          </div>
          {actions}
        </div>
      )}
    </header>
  )
}
