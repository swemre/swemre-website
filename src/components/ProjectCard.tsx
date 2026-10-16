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
import type {Project} from '../types/type'
import {Icon} from './Icon'
import {TagLabel} from './TagLabel'

export function ProjectCard({project}: {project: Project}) {
  return (
    <article className="flex h-full flex-col rounded-md border border-border bg-surface p-5 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2">
        <Icon name="repo" className="text-fg-muted" />
        <Link
          to={`/projects/${project.slug}`}
          className="truncate font-semibold text-primary"
        >
          {project.title}
        </Link>
        <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-2xs font-medium text-fg-muted">
          {project.year}
        </span>
      </div>
      <p className="mt-2 flex-1 text-sm text-fg-muted">{project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map(tag => (
          <TagLabel key={tag}>{tag}</TagLabel>
        ))}
      </div>
      {(project.url || project.repoUrl) && (
        <div className="mt-4 flex gap-4 border-t border-border-muted pt-3 text-xs">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-fg-muted hover:text-primary"
            >
              <Icon name="external" size={13} /> Live
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-fg-muted hover:text-primary"
            >
              <Icon name="github" size={13} /> Source
            </a>
          )}
        </div>
      )}
    </article>
  )
}
