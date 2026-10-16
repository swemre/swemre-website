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
  'inline-flex h-11 items-center justify-center gap-2 rounded-sm border px-5 text-base font-medium whitespace-nowrap transition-colors hover:no-underline'

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
        <img
          src={siteConfig.avatarLarge}
          alt={`${siteConfig.name}'s avatar`}
          className="size-28 shrink-0 rounded-md bg-cover-fg/10 shadow-lg ring-1 ring-cover-fg/25 sm:size-36"
        />
      }
      kicker={
        <span className="inline-flex items-center gap-2 rounded-full border border-cover-fg/25 bg-cover-fg/10 px-3 py-1 text-xs font-medium text-cover-fg backdrop-blur-sm">
          <span className="size-2 rounded-full bg-success" />
          Portfolio, articles and side projects
        </span>
      }
      title={`${siteConfig.jobTitle} - ${siteConfig.name}`}
      tagline={siteConfig.tagline}
      actions={
        <>
          <a
            href={siteConfig.phoneHref}
            className={`${bandButton} border-cover-fg bg-cover-fg text-cover-ink hover:bg-cover-fg/90`}
          >
            <Icon name="phone" />
            {siteConfig.phoneDisplay}
          </a>
          <button
            type="button"
            onClick={resume.open}
            data-sound="none"
            className={`${bandButton} border-cover-fg/30 bg-cover-fg/10 text-cover-fg hover:bg-cover-fg/20`}
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
