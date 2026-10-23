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

import {Link} from 'react-router-dom'
import {useDocumentTitle} from '../hooks/useDocumentTitle'
import {buttonClass} from '../utils/buttonClass'
import {Icon} from './Icon'

export function ErrorPage() {
  useDocumentTitle('Something went wrong')

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-page flex-1 animate-rise px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <p className="font-mono text-xs font-medium tracking-[0.2em] text-primary uppercase">
        Error
      </p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tighter text-balance text-fg-strong sm:text-5xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-measure text-lg text-fg-muted">
        This page could not be shown. Reload to try again, or go back to the
        home page.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={buttonClass('primary', 'md')}
        >
          Reload
        </button>
        <Link to="/" className={buttonClass('secondary', 'md')}>
          <Icon name="arrow-left" size={14} /> Back to home
        </Link>
      </div>
    </main>
  )
}
