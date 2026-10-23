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
import {useSiteSettings} from '../hooks/useSiteSettings'
import {useDocumentTitle} from '../hooks/useDocumentTitle'
import {buttonClass} from '../utils/buttonClass'
import {HeaderBand} from './HeaderBand'
import {Icon} from './Icon'

export function NotFound({
  title = 'Page not found',
  message = 'The page you are looking for does not exist or has moved.',
  backTo = '/',
  backLabel = 'Back to home',
  band = false,
  contact = false,
}: {
  title?: string
  message?: string
  backTo?: string
  backLabel?: string
  band?: boolean
  contact?: boolean
}) {
  const {contactEmail} = useSiteSettings()
  useDocumentTitle(title)

  return (
    <>
      {band && <HeaderBand />}
      <main className="mx-auto w-full max-w-page flex-1 animate-rise px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <p className="font-mono text-xs font-medium tracking-[0.2em] text-primary uppercase">
          404
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tighter text-balance text-fg-strong sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-measure text-lg text-fg-muted">{message}</p>
        {contact && (
          <p className="mt-3 max-w-measure text-fg-muted">
            Questions? Write to{' '}
            <a href={`mailto:${contactEmail}`} className="text-primary">
              {contactEmail}
            </a>
            .
          </p>
        )}
        <Link to={backTo} className={buttonClass('secondary', 'md', 'mt-8')}>
          <Icon name="arrow-left" size={14} /> {backLabel}
        </Link>
      </main>
    </>
  )
}
