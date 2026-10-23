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
import type {MouseEvent} from 'react'
import {focusMain, useRouteFocus} from '../hooks/useRouteFocus'

function skipToMain(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  focusMain()
}

export function SkipLink() {
  const announcement = useRouteFocus()

  return (
    <>
      <a
        href="#main"
        onClick={skipToMain}
        className="sr-only rounded-sm bg-primary-solid text-sm font-semibold text-fg-on-emphasis shadow-lg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
    </>
  )
}
