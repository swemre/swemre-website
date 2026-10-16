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
  avatar,
  kicker,
  title,
  tagline,
  actions,
  children,
}: {
  avatar: ReactNode
  kicker: ReactNode
  title: string
  tagline: string
  actions: ReactNode
  children: ReactNode
}) {
  return (
    <div className="relative isolate flex min-h-0 flex-1 flex-col pt-nav">
      <BandBackdrop />
      <main className="mx-auto flex min-h-0 w-full max-w-page flex-1 flex-col justify-center gap-8 px-4 py-10 sm:px-6 lg:gap-12 lg:px-8 lg:py-6">
        <section className="flex max-w-hero flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          {avatar}
          <div>
            {kicker}
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-cover-fg sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-measure text-lg text-cover-fg/80">
              {tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
          </div>
        </section>
        <div className="grid min-h-0 gap-5 md:grid-cols-3">{children}</div>
      </main>
    </div>
  )
}
