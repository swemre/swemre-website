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
import {HeaderBand} from '../../components/HeaderBand'
import {LoadError} from '../../components/LoadError'
import {NotFound} from '../../components/NotFound'
import {SidebarNav} from '../../components/SidebarNav'
import {useAsyncData} from '../../hooks/useAsyncData'
import {useDocumentTitle} from '../../hooks/useDocumentTitle'
import {useFindAll} from '../../hooks/useFindAll'
import {useService} from '../../hooks/useService'
import {ProjectTemplate} from '../../templates/ProjectTemplate'
import {articleNavItem, projectNavItem} from '../../utils/navItems'

export default function ProjectPage() {
  const {slug = ''} = useParams()
  const service = useService('project')
  const loader = useCallback(() => service.findBySlug(slug), [service, slug])
  const {data: project, loading, error, retry} = useAsyncData(loader)
  const all = useFindAll(service)
  const articles = useFindAll(useService('article'))

  useDocumentTitle(
    loading
      ? undefined
      : error
        ? 'Content could not be loaded'
        : (project?.seo.seoTitle ?? project?.title ?? 'Project not found'),
    {
      description: project?.seo.seoDescription ?? project?.summary,
      image: project?.seo.ogImageUrl ?? project?.coverUrl,
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

  if (error) {
    return (
      <>
        <HeaderBand />
        <main className="mx-auto w-full max-w-page flex-1 px-4 py-10 sm:px-6 lg:px-8">
          <LoadError onRetry={retry} />
        </main>
      </>
    )
  }

  if (!project) {
    return (
      <NotFound
        band
        title="Project not found"
        message="This project does not exist or has been removed."
        backTo="/projects"
        backLabel="Back to projects"
      />
    )
  }

  const projects = all.data ?? []
  const index = projects.findIndex(p => p.id === project.id)

  return (
    <ProjectTemplate
      project={project}
      previous={index >= 0 ? projects[index + 1] : undefined}
      next={index > 0 ? projects[index - 1] : undefined}
      sidebar={
        <SidebarNav
          sections={[
            {
              title: 'Projects',
              icon: 'repo',
              moreTo: '/projects',
              items: projects.map(p => projectNavItem(p, project.id)),
            },
            {
              title: 'Articles',
              icon: 'book',
              moreTo: '/articles',
              items: (articles.data ?? []).map(a => articleNavItem(a)),
            },
          ]}
        />
      }
    >
      <ContentBody value={project.body} />
    </ProjectTemplate>
  )
}
