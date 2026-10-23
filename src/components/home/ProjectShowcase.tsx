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
import {blocksFromValue, plainText} from 'swemre-blocks'
import type {Project} from '../../types/type'
import {buttonClass} from '../../utils/buttonClass'
import {cn} from '../../utils/cn'
import {CoverImage} from '../CoverImage'
import {Icon} from '../Icon'

const EXCERPT = 220

function excerpt(project: Project): string {
  const text = plainText(blocksFromValue(project.body)).trim()
  if (text.length <= EXCERPT) return text
  return `${text.slice(0, text.lastIndexOf(' ', EXCERPT))}…`
}

const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

function ProjectRow({project, index}: {project: Project; index: number}) {
  const flipped = index % 2 === 1
  const details = excerpt(project)
  const facts: Array<[string, string]> = [
    ['Year', String(project.year)],
    ['Stack', project.tags.join(', ') || '—'],
    ['Live', project.url ? hostOf(project.url) : 'Private'],
  ]

  return (
    <li className="group/project grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <Link
        to={`/projects/${project.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          'block overflow-hidden rounded-lg border border-border bg-surface shadow-md transition-[border-color,box-shadow,transform] duration-500 group-hover/project:-translate-y-1 group-hover/project:border-primary/40 group-hover/project:shadow-xl',
          flipped && 'lg:order-last',
        )}
      >
        <div className="flex items-center gap-1.5 border-b border-border-muted bg-surface-muted px-3 py-2">
          <span className="size-2 rounded-xs bg-border-strong" />
          <span className="size-2 rounded-xs bg-border-strong" />
          <span className="size-2 rounded-xs bg-border-strong" />
          <span className="ml-2 truncate font-mono text-2xs text-fg-subtle">
            {project.url ? hostOf(project.url) : `${project.slug}.local`}
          </span>
        </div>
        <div className="aspect-[16/10] overflow-hidden bg-inset">
          <CoverImage
            src={project.coverUrl}
            alt={project.coverAlt}
            width={project.coverWidth}
            height={project.coverHeight}
            title={project.title}
            className="group-hover/project:scale-105"
          />
        </div>
      </Link>

      <div className="min-w-0">
        <p className="font-mono text-xs font-medium tracking-[0.2em] text-primary uppercase">
          P-{String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="mt-3 text-3xl font-bold tracking-tight text-fg-strong sm:text-4xl">
          <Link
            to={`/projects/${project.slug}`}
            className="text-fg-strong hover:text-primary hover:no-underline"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-4 text-lg text-fg">{project.summary}</p>
        {details && (
          <p className="mt-3 text-sm leading-6 text-fg-muted">{details}</p>
        )}
        <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border-muted bg-border-muted sm:grid-cols-3">
          {facts.map(([term, value]) => (
            <div key={term} className="min-w-0 bg-surface px-4 py-3">
              <dt className="font-mono text-2xs tracking-[0.2em] text-fg-subtle uppercase">
                {term}
              </dt>
              <dd className="mt-1 truncate text-sm font-medium text-fg-strong">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to={`/projects/${project.slug}`}
            className={buttonClass('primary', 'md')}
          >
            Case study <Icon name="arrow-right" size={14} />
          </Link>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonClass('secondary', 'md')}
            >
              <Icon name="external" size={14} /> Live site
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonClass('ghost', 'md')}
            >
              <Icon name="github" size={14} /> Source
            </a>
          )}
        </div>
      </div>
    </li>
  )
}

export function ProjectShowcase({projects}: {projects: Project[]}) {
  return (
    <ul className="space-y-20 lg:space-y-28">
      {projects.map((project, index) => (
        <ProjectRow key={project.id} project={project} index={index} />
      ))}
    </ul>
  )
}
