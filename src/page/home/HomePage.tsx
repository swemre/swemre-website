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

import {BandBackdrop} from '../../components/BandBackdrop'
import {HomeSection} from '../../components/HomeSection'
import {ArticleShowcase} from '../../components/home/ArticleShowcase'
import {ProjectShowcase} from '../../components/home/ProjectShowcase'
import {Icon} from '../../components/Icon'
import {ListBox} from '../../components/ListBox'
import {SongRow} from '../../components/SongRow'
import {siteConfig} from '../../config/site'
import {useDocumentTitle} from '../../hooks/useDocumentTitle'
import {useFindAll} from '../../hooks/useFindAll'
import {useResumeModal} from '../../hooks/useResumeModal'
import {useService} from '../../hooks/useService'
import {HomeTemplate} from '../../templates/HomeTemplate'
import {buttonClass, fillClass, shineClass} from '../../utils/buttonClass'
import {cn} from '../../utils/cn'

const bandButton =
  'relative isolate inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-sm border px-6 text-base font-medium whitespace-nowrap transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:no-underline active:translate-y-0 active:scale-[0.97] [&>svg]:transition-transform [&>svg]:duration-300 hover:[&>svg]:translate-x-0.5'

const solidBandButton = cn(
  bandButton,
  'border-cover-fg bg-cover-fg text-cover-ink shadow-cover-cta before:via-band-glow/30',
  shineClass,
)

const glassBandButton = cn(
  bandButton,
  'border-cover-fg/25 bg-cover-fg/5 text-cover-fg backdrop-blur-md after:bg-cover-fg/15',
  fillClass,
)

const pad = (count: number) => String(count).padStart(2, '0')

function Loading() {
  return <p className="text-sm text-fg-muted">Loading…</p>
}

export default function HomePage() {
  useDocumentTitle()
  const requests = useResumeModal()
  const articles = useFindAll(useService('article'))
  const projects = useFindAll(useService('project'))
  const songs = useFindAll(useService('song'))

  const latestArticles = (articles.data ?? []).slice(0, 4)
  const featuredProjects = (projects.data ?? []).slice(0, 3)
  const playlist = (songs.data ?? []).slice(0, 6)

  // A section stays while it loads and disappears when its list is empty, so an empty
  // workspace shows only the hero and the contact panel; numbers follow the visible sections
  const visible = {
    articles: articles.loading || latestArticles.length > 0,
    projects: projects.loading || featuredProjects.length > 0,
    songs: songs.loading || playlist.length > 0,
  }
  const order = (Object.keys(visible) as Array<keyof typeof visible>).filter(
    key => visible[key],
  )
  const number = (key: keyof typeof visible | 'contact') =>
    pad((key === 'contact' ? order.length : order.indexOf(key)) + 1)

  const stats: Array<[string, number | undefined]> = [
    ['Articles', articles.data?.length],
    ['Projects', projects.data?.length],
    ['Songs', songs.data?.length],
  ]

  return (
    <HomeTemplate
      kicker={
        <p className="inline-flex items-center gap-3 font-mono text-xs font-medium tracking-[0.25em] text-cover-fg/70 uppercase">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-xs bg-cover-tint-2 opacity-70" />
            <span className="relative inline-flex size-2 rounded-xs bg-cover-tint-2" />
          </span>
          {siteConfig.brand} / Software engineering lab
        </p>
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
          <button
            type="button"
            onClick={requests.openCallback}
            data-sound="none"
            className={solidBandButton}
          >
            <Icon name="phone" />
            Request a call back
          </button>
          <button
            type="button"
            onClick={requests.open}
            data-sound="none"
            className={glassBandButton}
          >
            <Icon name="file" />
            Request my resume
          </button>
        </>
      }
      stats={
        <dl className="grid grid-cols-3 border-t border-cover-fg/15 pt-6">
          {stats.map(([label, count]) => (
            <div
              key={label}
              className="border-l border-cover-fg/15 pl-4 first:border-l-0 first:pl-0"
            >
              <dt className="font-mono text-2xs tracking-[0.2em] text-cover-fg/50 uppercase">
                {label}
              </dt>
              <dd className="mt-1 font-mono text-2xl font-semibold text-cover-fg">
                {count === undefined ? '--' : pad(count)}
              </dd>
            </div>
          ))}
        </dl>
      }
    >
      {visible.articles && (
        <HomeSection
          index={number('articles')}
          label="Writing"
          title="Latest articles"
          moreTo="/articles"
        >
          {articles.loading && <Loading />}
          <ArticleShowcase articles={latestArticles} />
        </HomeSection>
      )}

      {visible.projects && (
        <HomeSection
          index={number('projects')}
          label="Building"
          title="Selected projects"
          moreTo="/projects"
        >
          {projects.loading && <Loading />}
          <ProjectShowcase projects={featuredProjects} />
        </HomeSection>
      )}

      {visible.songs && (
        <HomeSection
          index={number('songs')}
          label="Listening"
          title="Songs I liked"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
            <p className="max-w-measure text-lg text-fg-muted">
              What plays while I work. Pick a track to listen right here.
            </p>
            <ListBox title="Playlist" icon="spotify" divided={false}>
              {songs.loading && (
                <li className="px-4 py-3 text-sm text-fg-muted">Loading…</li>
              )}
              {playlist.map((song, index) => (
                <SongRow key={song.id} song={song} index={index + 1} />
              ))}
            </ListBox>
          </div>
        </HomeSection>
      )}

      <section
        aria-label="Contact"
        className="relative isolate animate-rise overflow-hidden rounded-lg border border-border px-6 py-16 sm:px-12 lg:py-20"
      >
        <BandBackdrop />
        <p className="font-mono text-xs font-medium tracking-[0.2em] text-cover-fg/60 uppercase">
          {number('contact')} / Contact
        </p>
        <h2 className="mt-3 max-w-hero text-4xl font-extrabold tracking-tighter text-cover-fg sm:text-5xl">
          Let us build something together.
        </h2>
        <p className="mt-4 max-w-measure text-lg text-cover-fg/70">
          Leave your number and I will call you back, or ask for my resume.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={requests.openCallback}
            data-sound="none"
            className={solidBandButton}
          >
            <Icon name="phone" />
            Request a call back
          </button>
          <button
            type="button"
            onClick={requests.open}
            data-sound="none"
            className={glassBandButton}
          >
            <Icon name="file" />
            Request my resume
          </button>
          <a
            href={`mailto:${siteConfig.email}`}
            className={buttonClass(
              'ghost',
              'lg',
              'text-cover-fg/80 after:bg-cover-fg/10 hover:text-cover-fg',
            )}
          >
            <Icon name="mail" />
            {siteConfig.email}
          </a>
        </div>
      </section>
    </HomeTemplate>
  )
}
