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

import {useCallback} from 'react'
import {Link, useParams} from 'react-router-dom'
import {ContentBody} from '../../components/ContentBody'
import {useAsyncData} from '../../hooks/useAsyncData'
import {useDocumentTitle} from '../../hooks/useDocumentTitle'
import {useService} from '../../hooks/useService'
import {CorporateTemplate} from '../../templates/CorporateTemplate'

export default function SpecialPage() {
  const {slug = ''} = useParams()
  const service = useService('specialPage')
  const loader = useCallback(() => service.findBySlug(slug), [service, slug])
  const {data: page, loading} = useAsyncData(loader)

  useDocumentTitle(page?.title)

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-page px-8 py-10 text-fg-muted">
        Loading…
      </main>
    )
  }

  if (!page) {
    return (
      <main className="mx-auto w-full max-w-page px-8 py-16">
        <h1 className="text-3xl font-semibold text-fg-strong">
          Page not found
        </h1>
        <Link to="/" className="mt-4 inline-block text-primary">
          Back to home
        </Link>
      </main>
    )
  }

  return (
    <CorporateTemplate page={page}>
      <ContentBody value={page.body} />
    </CorporateTemplate>
  )
}
