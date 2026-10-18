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
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
      />
      <div className="flex items-center gap-3">
        <span className="inline-grid size-10 shrink-0 place-items-center rounded-md bg-primary-muted text-primary">
          <Icon name="repo" size={18} />
        </span>
        <Link
          to={`/projects/${project.slug}`}
          className="truncate text-lg font-semibold text-fg-strong after:absolute after:inset-0 hover:text-primary hover:no-underline"
        >
          {project.title}
        </Link>
        <span className="ml-auto rounded-xs border border-border px-2 py-0.5 font-mono text-2xs font-medium text-fg-muted">
          {project.year}
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-fg-muted">
        {project.summary}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map(tag => (
          <TagLabel key={tag}>{tag}</TagLabel>
        ))}
      </div>
      {(project.url || project.repoUrl) && (
        <div className="relative z-10 mt-5 flex gap-4 border-t border-border-muted pt-4 text-xs font-medium">
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
