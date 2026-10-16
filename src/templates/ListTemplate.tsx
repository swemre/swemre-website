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
import {HeaderBand} from '../components/HeaderBand'

export function ListTemplate({
  title,
  lede,
  toolbar,
  sidebar,
  children,
}: {
  title: string
  lede: string
  toolbar?: ReactNode
  sidebar?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="flex-1">
      <HeaderBand />
      <div className="mx-auto w-full max-w-page px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-muted pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-fg-strong">
              {title}
            </h1>
            <p className="mt-2 max-w-measure text-lg text-fg-muted">{lede}</p>
          </div>
          {toolbar}
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-page gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[var(--container-sidebar)_minmax(0,1fr)] lg:px-8">
        {sidebar ? (
          <aside className="lg:sticky lg:top-sticky lg:self-start">
            {sidebar}
          </aside>
        ) : null}
        <div className={sidebar ? undefined : 'lg:col-span-2'}>{children}</div>
      </div>
    </main>
  )
}
