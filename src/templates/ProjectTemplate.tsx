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

import type {ReactNode} from 'react'
import {DocHeader} from '../components/DocHeader'
import {HeaderBand} from '../components/HeaderBand'
import {Icon} from '../components/Icon'
import {PagerLink} from '../components/PagerLink'
import {TagLabel} from '../components/TagLabel'
import type {Project} from '../types/type'
import {buttonClass} from '../utils/buttonClass'
import {DocsLayout} from './DocsLayout'

export function ProjectTemplate({
  project,
  sidebar,
  previous,
  next,
  children,
}: {
  project: Project
  sidebar: ReactNode
  previous?: Project
  next?: Project
  children: ReactNode
}) {
  return (
    <>
      <HeaderBand />
      <DocsLayout
        sidebar={sidebar}
        before={
          <DocHeader
            crumbs={[
              {label: 'Projects', to: '/projects'},
              {label: project.title},
            ]}
            badges={
              <>
                <span className="inline-flex items-center gap-1.5 rounded-xs border border-border px-2.5 py-0.5 text-xs font-medium text-fg-muted">
                  <Icon name="repo" size={12} /> {project.year}
                </span>
                {project.tags.map(tag => (
                  <TagLabel key={tag}>{tag}</TagLabel>
                ))}
              </>
            }
            title={project.title}
            summary={project.summary}
            cover={{
              src: project.coverUrl,
              alt: project.coverAlt,
              width: project.coverWidth,
              height: project.coverHeight,
            }}
            actions={
              (project.url || project.repoUrl) && (
                <div className="flex flex-wrap gap-2">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={buttonClass('primary', 'sm')}
                    >
                      <Icon name="external" size={14} /> Live site
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={buttonClass('secondary', 'sm')}
                    >
                      <Icon name="github" size={14} /> Source
                    </a>
                  )}
                </div>
              )
            }
          />
        }
        after={
          (previous || next) && (
            <nav
              aria-label="More projects"
              className="mt-12 grid gap-4 sm:grid-cols-2"
            >
              {previous && (
                <PagerLink
                  to={`/projects/${previous.slug}`}
                  title={previous.title}
                  direction="previous"
                />
              )}
              {next && (
                <PagerLink
                  to={`/projects/${next.slug}`}
                  title={next.title}
                  direction="next"
                />
              )}
            </nav>
          )
        }
      >
        {children}
      </DocsLayout>
    </>
  )
}
