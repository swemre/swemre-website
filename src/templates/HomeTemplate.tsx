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
  title: ReactNode
  tagline: string
  actions: ReactNode
  children: ReactNode
}) {
  return (
    <div className="relative isolate flex min-h-0 flex-1 flex-col pt-nav">
      <BandBackdrop />
      <main className="mx-auto flex min-h-0 w-full max-w-page flex-1 flex-col justify-center gap-10 px-4 py-12 sm:px-6 lg:gap-14 lg:px-8 lg:py-8">
        <section className="flex max-w-hero animate-rise flex-col gap-7 sm:flex-row sm:items-center sm:gap-10">
          {avatar}
          <div>
            {kicker}
            <h1 className="mt-5 text-4xl font-extrabold tracking-tighter text-balance text-cover-fg sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-measure text-lg text-cover-fg/75 sm:text-xl">
              {tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
          </div>
        </section>
        <div className="grid min-h-0 animate-rise gap-5 [animation-delay:120ms] md:grid-cols-3">
          {children}
        </div>
      </main>
    </div>
  )
}
