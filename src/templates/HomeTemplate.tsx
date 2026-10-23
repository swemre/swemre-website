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

export function HomeTemplate({
  kicker,
  title,
  tagline,
  actions,
  stats,
  children,
}: {
  kicker: ReactNode
  title: ReactNode
  tagline: string
  actions: ReactNode
  stats: ReactNode
  children: ReactNode
}) {
  return (
    <main id="main" className="flex-1">
      <section
        data-band
        className="relative isolate flex min-h-dvh flex-col pt-nav"
      >
        <BandBackdrop />
        <div className="mx-auto flex w-full max-w-page flex-1 animate-rise flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          {kicker}
          <h1 className="mt-6 max-w-hero text-5xl font-extrabold tracking-tighter text-balance text-cover-fg sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-measure text-lg text-cover-fg/70 sm:text-xl">
            {tagline}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">{actions}</div>
        </div>
        <div className="mx-auto w-full max-w-page px-4 pb-8 max-sm:pb-dock-clear sm:px-6 lg:px-8">
          {stats}
        </div>
      </section>
      <div className="mx-auto w-full max-w-page space-y-28 px-4 py-24 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  )
}
