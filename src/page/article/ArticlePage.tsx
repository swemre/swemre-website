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

import {useCallback, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {ContentBody} from '../../components/ContentBody'
import {HeaderBand} from '../../components/HeaderBand'
import {NotFound} from '../../components/NotFound'
import {SidebarNav} from '../../components/SidebarNav'
import {useAsyncData} from '../../hooks/useAsyncData'
import {useDocumentTitle} from '../../hooks/useDocumentTitle'
import {useFindAll} from '../../hooks/useFindAll'
import {useService} from '../../hooks/useService'
import {articleInteractionStore} from '../../services/ArticleInteractionStore'
import {ArticleTemplate} from '../../templates/ArticleTemplate'
import {articleNavItem, projectNavItem} from '../../utils/navItems'

export default function ArticlePage() {
  const {slug = ''} = useParams()
  const service = useService('article')
  const loader = useCallback(() => service.findBySlug(slug), [service, slug])
  const {data: article, loading} = useAsyncData(loader)
  const all = useFindAll(service)
  const projects = useFindAll(useService('project'))

  const id = article?.id
  useEffect(() => {
    if (id) articleInteractionStore.registerView(id)
  }, [id])

  useDocumentTitle(
    loading
      ? undefined
      : (article?.seo.seoTitle ?? article?.title ?? 'Article not found'),
    {
      description: article?.seo.seoDescription ?? article?.summary,
      image: article?.shareImage,
      article: article && {
        publishedTime: article.createdAt,
        modifiedTime: article.updatedAt,
      },
    },
  )

  if (loading) {
    return (
      <>
        <HeaderBand />
        <main className="mx-auto w-full max-w-page flex-1 px-4 py-10 text-fg-muted sm:px-6 lg:px-8">
          Loading…
        </main>
      </>
    )
  }

  if (!article) {
    return (
      <NotFound
        band
        title="Article not found"
        message="This article does not exist or has been removed."
        backTo="/articles"
        backLabel="Back to articles"
      />
    )
  }

  const articles = all.data ?? []
  const index = articles.findIndex(a => a.id === article.id)
  const previous = index >= 0 ? articles[index + 1] : undefined
  const next = index > 0 ? articles[index - 1] : undefined

  return (
    <ArticleTemplate
      article={article}
      previous={previous}
      next={next}
      sidebar={
        <SidebarNav
          sections={[
            {
              title: 'Articles',
              icon: 'book',
              moreTo: '/articles',
              items: articles.map(a => articleNavItem(a, article.id)),
            },
            {
              title: 'Projects',
              icon: 'repo',
              moreTo: '/projects',
              items: (projects.data ?? []).map(p => projectNavItem(p)),
            },
          ]}
        />
      }
    >
      <ContentBody value={article.body} />
    </ArticleTemplate>
  )
}
