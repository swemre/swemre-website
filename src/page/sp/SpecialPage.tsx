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
import {useParams} from 'react-router-dom'
import {ContentBody} from '../../components/ContentBody'
import {NotFound} from '../../components/NotFound'
import {useAsyncData} from '../../hooks/useAsyncData'
import {useDocumentTitle} from '../../hooks/useDocumentTitle'
import {useService} from '../../hooks/useService'
import {CorporateTemplate} from '../../templates/CorporateTemplate'

export default function SpecialPage() {
  const {slug = ''} = useParams()
  const service = useService('specialPage')
  const loader = useCallback(() => service.findBySlug(slug), [service, slug])
  const {data: page, loading} = useAsyncData(loader)

  useDocumentTitle(
    loading
      ? undefined
      : (page?.seo.seoTitle ?? page?.title ?? 'Page not found'),
    {description: page?.summary, image: page?.seo.ogImageUrl},
  )

  if (loading) {
    return (
      <main
        id="main"
        className="mx-auto w-full max-w-page flex-1 px-4 py-10 text-fg-muted sm:px-6 lg:px-8"
      >
        Loading…
      </main>
    )
  }

  if (!page) {
    return <NotFound message="This page is not available right now." contact />
  }

  return (
    <CorporateTemplate page={page}>
      <ContentBody value={page.body} />
    </CorporateTemplate>
  )
}
