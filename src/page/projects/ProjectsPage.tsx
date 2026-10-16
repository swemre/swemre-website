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

import {ProjectCard} from '../../components/ProjectCard'
import {SidebarNav} from '../../components/SidebarNav'
import {useDocumentTitle} from '../../hooks/useDocumentTitle'
import {useFindAll} from '../../hooks/useFindAll'
import {useService} from '../../hooks/useService'
import {ListTemplate} from '../../templates/ListTemplate'
import {articleNavItem, projectNavItem} from '../../utils/navItems'

export default function ProjectsPage() {
  useDocumentTitle('Projects')
  const projects = useFindAll(useService('project'))
  const articles = useFindAll(useService('article'))

  return (
    <ListTemplate
      title="Projects"
      lede="Things I have built and am building."
      sidebar={
        <SidebarNav
          sections={[
            {
              title: 'Projects',
              icon: 'repo',
              items: (projects.data ?? []).map(p => projectNavItem(p)),
            },
            {
              title: 'Articles',
              icon: 'book',
              moreTo: '/articles',
              items: (articles.data ?? []).map(article =>
                articleNavItem(article),
              ),
            },
          ]}
        />
      }
    >
      {projects.loading && <p className="text-sm text-fg-muted">Loading…</p>}
      <ul className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {(projects.data ?? []).map(project => (
          <li key={project.id}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </ListTemplate>
  )
}
