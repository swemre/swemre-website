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

// The home page (boards Home, Home-1..3, Home-Scrolled and the Home-<section>-<state> crops).
// Each data section renders its own loading, empty and error state.
import type {TemplateProps} from '../../contract/templates.ts'
import {
  useArticles,
  useProjects,
  useSettings,
  useSongs,
} from '../../data/hooks.ts'
import {ArticlesSection} from './ArticlesSection.tsx'
import {Hero} from './Hero.tsx'
import {NewsletterSection} from './NewsletterSection.tsx'
import {ProjectsSection} from './ProjectsSection.tsx'
import {SongsSection} from './SongsSection.tsx'
import {StackSection} from './StackSection.tsx'
import {PromiseStatement, ReelStatement} from './Statements.tsx'
import {SubscribeSection} from './SubscribeSection.tsx'

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- same props as every template
export function HomeTemplate(_props: TemplateProps) {
  const settingsState = useSettings()
  const settings =
    settingsState.status === 'ready' ? settingsState.data : undefined
  const articles = useArticles({limit: 4})
  const projects = useProjects()
  const songs = useSongs(5)
  const song = songs.status === 'ready' ? songs.data[0] : undefined
  return (
    <>
      <Hero settings={settings} song={song} />
      <StackSection settings={settings} />
      <ReelStatement />
      <ArticlesSection state={articles} />
      <ProjectsSection state={projects} settings={settings} />
      <SongsSection state={songs} settings={settings} />
      <PromiseStatement />
      <NewsletterSection />
      <SubscribeSection />
    </>
  )
}
