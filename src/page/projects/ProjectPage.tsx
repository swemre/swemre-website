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
  const {data: project, loading} = useAsyncData(loader)
  const all = useFindAll(service)
  const articles = useFindAll(useService('article'))

  useDocumentTitle(project?.title)

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-page px-8 pt-sticky text-fg-muted">
        Loading…
      </main>
    )
  }

  if (!project) {
    return (
      <main className="mx-auto w-full max-w-page px-8 pt-sticky pb-16">
        <h1 className="text-3xl font-semibold text-fg-strong">
          Project not found
        </h1>
        <Link to="/projects" className="mt-4 inline-block text-primary">
          Back to projects
        </Link>
      </main>
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
