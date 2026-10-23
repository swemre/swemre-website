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
import {BandBackdrop} from '../components/BandBackdrop'
import {cn} from '../utils/cn'

export function ListTemplate({
  title,
  lede,
  toolbar,
  sidebar,
  sidebarFromLg = false,
  children,
}: {
  title: string
  lede: string
  toolbar?: ReactNode
  sidebar?: ReactNode
  sidebarFromLg?: boolean
  children: ReactNode
}) {
  return (
    <main className="flex-1">
      <div className="relative isolate pt-nav">
        <BandBackdrop />
        <div className="mx-auto flex w-full max-w-page animate-rise flex-wrap items-end justify-between gap-4 px-4 pt-14 pb-12 sm:px-6 lg:px-8 lg:pt-20">
          <div>
            <h1 className="bg-linear-to-r from-cover-fg via-cover-tint-1 to-cover-tint-2 bg-clip-text text-5xl font-extrabold tracking-tighter text-transparent sm:text-6xl">
              {title}
            </h1>
            <p className="mt-3 max-w-measure text-lg text-cover-fg/75">
              {lede}
            </p>
          </div>
          {toolbar}
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-page gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[var(--container-sidebar)_minmax(0,1fr)] lg:px-8">
        {sidebar ? (
          <aside
            className={cn(
              'lg:sticky lg:top-sticky lg:self-start',
              sidebarFromLg ? 'max-lg:hidden' : 'max-lg:order-last',
            )}
          >
            {sidebar}
          </aside>
        ) : null}
        <div className={sidebar ? undefined : 'lg:col-span-2'}>{children}</div>
      </div>
    </main>
  )
}
