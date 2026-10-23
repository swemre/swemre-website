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
import {Icon} from '../../components/Icon'
import {LoadError} from '../../components/LoadError'
import {ProjectCard} from '../../components/ProjectCard'
import {SidebarNav} from '../../components/SidebarNav'
import {useDocumentTitle} from '../../hooks/useDocumentTitle'
import {useFindAll} from '../../hooks/useFindAll'
import {useService} from '../../hooks/useService'
import type {DocumentMeta} from '../../types/type'
import {ListTemplate} from '../../templates/ListTemplate'
import {buttonClass} from '../../utils/buttonClass'
import {articleNavItem} from '../../utils/navItems'

const LIST_META: DocumentMeta = {schema: {kind: 'list'}}

export default function ProjectsPage() {
  useDocumentTitle('Projects', LIST_META)
  const projects = useFindAll(useService('project'))
  const articles = useFindAll(useService('article'))
  const list = projects.data ?? []
  const articleItems = (articles.data ?? []).map(article =>
    articleNavItem(article),
  )

  return (
    <ListTemplate
      title="Projects"
      lede="Things I have built and am building."
      sidebar={
        articleItems.length > 0 ? (
          <SidebarNav
            sections={[
              {
                title: 'Articles',
                icon: 'book',
                moreTo: '/articles',
                items: articleItems,
              },
            ]}
          />
        ) : undefined
      }
    >
      {projects.loading && <p className="text-sm text-fg-muted">Loading…</p>}
      {projects.error !== undefined && <LoadError onRetry={projects.retry} />}
      {!projects.loading && !projects.error && list.length === 0 && (
        <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-border bg-surface px-6 py-12 sm:items-center sm:px-10 sm:text-center">
          <span className="inline-grid size-10 place-items-center rounded-md bg-primary-muted text-primary">
            <Icon name="repo" size={20} />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-fg-strong">
              No projects yet
            </h2>
            <p className="mt-2 max-w-measure text-fg-muted">
              Case studies are on the way. In the meantime, read what I have
              been writing.
            </p>
          </div>
          <Link to="/articles" className={buttonClass('secondary', 'md')}>
            Read the articles <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      )}
      {list.length > 0 && (
        <ul className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {list.map(project => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </ListTemplate>
  )
}
