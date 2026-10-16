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

import {useCallback, useEffect, useRef} from 'react'
import {Link, useParams} from 'react-router-dom'
import {MdxBody} from '../../components/MdxBody'
import {ContentBody} from '../../components/ContentBody'
import {SidebarNav} from '../../components/SidebarNav'
import {docsMdxComponents} from '../../components/mdx/docsMdxComponents'
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
  const Body = service.getBody(slug)
  const counted = useRef<string | null>(null)

  const id = article?.id
  useEffect(() => {
    // Ref guard keeps StrictMode's double-invoked effect from counting twice.
    if (!id || counted.current === id) return
    counted.current = id
    articleInteractionStore.registerView(id)
  }, [id])

  useDocumentTitle(article?.title)

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-page px-8 pt-sticky text-fg-muted">
        Loading…
      </main>
    )
  }

  if (!article) {
    return (
      <main className="mx-auto w-full max-w-page px-8 pt-sticky pb-16">
        <h1 className="text-3xl font-semibold text-fg-strong">
          Article not found
        </h1>
        <Link to="/articles" className="mt-4 inline-block text-primary">
          Back to articles
        </Link>
      </main>
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
      {Body ? (
        <MdxBody body={Body} components={docsMdxComponents} />
      ) : (
        <ContentBody body={article.body ?? ''} format={article.bodyFormat} />
      )}
    </ArticleTemplate>
  )
}
