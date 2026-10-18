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
import {ListBox, ListRow} from '../../components/ListBox'
import {SongRow} from '../../components/SongRow'
import {siteConfig} from '../../config/site'
import {useDocumentTitle} from '../../hooks/useDocumentTitle'
import {useFindAll} from '../../hooks/useFindAll'
import {useResumeModal} from '../../hooks/useResumeModal'
import {useService} from '../../hooks/useService'
import {HomeTemplate} from '../../templates/HomeTemplate'
import {formatDate} from '../../utils/formatDate'

const LIMIT = 5

const bandButton =
  'inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-base font-medium whitespace-nowrap transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:no-underline'

function Loading() {
  return <li className="px-4 py-3 text-sm text-fg-muted">Loading…</li>
}

export default function HomePage() {
  useDocumentTitle()
  const resume = useResumeModal()
  const articles = useFindAll(useService('article'))
  const projects = useFindAll(useService('project'))
  const songs = useFindAll(useService('song'))

  return (
    <HomeTemplate
      avatar={
        <div className="relative shrink-0 self-start sm:self-center">
          <div
            aria-hidden="true"
            className="absolute -inset-1 rounded-xl bg-linear-to-br from-band-glow via-band-glow-2 to-band-glow-3 opacity-80 blur-md"
          />
          <img
            src={siteConfig.avatarLarge}
            alt={`${siteConfig.name}'s avatar`}
            className="relative size-28 rounded-xl bg-band-from shadow-xl ring-1 ring-cover-fg/30 sm:size-40"
          />
        </div>
      }
      kicker={
        <span className="inline-flex items-center gap-2 rounded-full border border-cover-fg/20 bg-cover-fg/10 px-3.5 py-1.5 text-xs font-medium text-cover-fg/90 backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Portfolio, articles and side projects
        </span>
      }
      title={
        <>
          {siteConfig.jobTitle}{' '}
          <span className="bg-linear-to-r from-cover-tint-1 via-cover-tint-2 to-cover-tint-3 bg-clip-text text-transparent">
            {siteConfig.name}
          </span>
        </>
      }
      tagline={siteConfig.tagline}
      actions={
        <>
          <a
            href={siteConfig.phoneHref}
            className={`${bandButton} border-cover-fg bg-cover-fg text-cover-ink shadow-cover-cta hover:bg-cover-fg/90`}
          >
            <Icon name="phone" />
            {siteConfig.phoneDisplay}
          </a>
          <button
            type="button"
            onClick={resume.open}
            data-sound="none"
            className={`${bandButton} border-cover-fg/25 bg-cover-fg/10 text-cover-fg backdrop-blur-md hover:bg-cover-fg/20`}
          >
            <Icon name="file" />
            Request my resume
          </button>
        </>
      }
    >
      <ListBox title="Articles" icon="book" moreTo="/articles">
        {articles.loading && <Loading />}
        {(articles.data ?? []).slice(0, LIMIT).map(article => (
          <ListRow
            key={article.id}
            icon={<Icon name="file" className="text-fg-subtle" />}
            title={
              <Link
                to={`/articles/${article.slug}`}
                className="text-fg-strong hover:text-primary"
              >
                {article.title}
              </Link>
            }
            meta={`${formatDate(article.createdAt)} · ${article.readingTime} min read`}
          />
        ))}
      </ListBox>

      <ListBox title="Projects" icon="repo" moreTo="/projects">
        {projects.loading && <Loading />}
        {(projects.data ?? []).slice(0, LIMIT).map(project => (
          <ListRow
            key={project.id}
            icon={<Icon name="repo" className="text-fg-subtle" />}
            title={
              <Link
                to={`/projects/${project.slug}`}
                className="text-fg-strong hover:text-primary"
              >
                {project.title}
              </Link>
            }
            meta={`${project.year} · ${project.summary}`}
          />
        ))}
      </ListBox>

      <ListBox title="Songs I liked" icon="spotify" divided={false}>
        {songs.loading && <Loading />}
        {(songs.data ?? []).slice(0, LIMIT).map((song, index) => (
          <SongRow key={song.id} song={song} index={index + 1} />
        ))}
      </ListBox>
    </HomeTemplate>
  )
}
