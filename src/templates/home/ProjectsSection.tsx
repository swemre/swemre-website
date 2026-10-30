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

// "02 // building": two featured projects and the "Also" links, with the loading, empty and
// error boards.
import type {
  Loadable,
  ProjectSummary,
  SiteSettings,
} from '../../contract/view.ts'
import {Split} from './kit/layout.tsx'
import {Rail} from './kit/Rail.tsx'
import {SectionBg} from './kit/SectionBg.tsx'
import {Skel, StatePanel} from './kit/StatePanel.tsx'
import {Anchor, Button, ProjectCard, SectionHeader, TextLink} from './kit/ui.ts'
import {useV} from './kit/vp.ts'

function useCols() {
  const v = useV()
  return {
    gridTemplateColumns: `repeat(${v(1, 2, 2)},minmax(0,1fr))`,
    columnGap: v(16, 24, 32),
  }
}

function CardSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{display: 'flex', flexDirection: 'column', gap: 16}}
    >
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <Skel w={112} h={24} r={4} />
        <Skel w={40} h={12} style={{marginTop: 4}} />
      </div>
      <Skel w="52%" h={28} />
      <Skel w="96%" h={14} style={{marginTop: 4}} />
      <Skel w="84%" h={14} />
      <div
        style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}
      >
        <Skel w={150} h={12} />
        <Skel w={80} h={12} />
      </div>
    </div>
  )
}

function Body({
  state,
  github,
}: {
  state: Loadable<ProjectSummary[]>
  github: string
}) {
  const v = useV()
  const cols = useCols()
  switch (state.status) {
    case 'loading':
      return (
        <>
          <span className="a2-sr" role="status">
            Loading projects
          </span>
          <div className="a2-cols" style={{...cols, rowGap: v(32, 32, 48)}}>
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div
            aria-hidden="true"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '16px 24px',
              marginTop: v(48, 48, 64),
            }}
          >
            <Skel w={40} h={12} />
            {[112, 168, 120, 88, 112].map((w, i) => (
              <Skel key={i} w={w} h={20} r={4} />
            ))}
          </div>
        </>
      )
    case 'empty':
      return (
        <StatePanel
          hue="peri"
          icon="folder"
          title="No projects to show yet"
          copy="Projects appear here once they have a public page. The code of everything I build is on GitHub in the meantime."
          command="ls ~/projects --public"
          result="0 results"
          actions={
            <Button
              label="Open GitHub"
              kind="secondary"
              iconLeft="github"
              href={github}
            />
          }
        />
      )
    case 'error':
      return (
        <StatePanel
          icon="cloud-off"
          title="Projects could not be loaded"
          copy="The project list did not load. Nothing is lost; try again, or open the projects page."
          command="GET /api/public/v2/channels/swemre/projects"
          result="503 Service Unavailable"
          actions={
            <>
              <Button
                label="Try again"
                kind="secondary"
                iconLeft="refresh"
                onClick={state.retry}
              />
              <TextLink label="All projects" href="/projects" />
            </>
          }
        />
      )
    case 'ready': {
      const featured = state.data.filter(p => p.featured).slice(0, 2)
      const shown = featured.length ? featured : state.data.slice(0, 2)
      const also = state.data
        .filter(p => !shown.includes(p))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5)
      return (
        <>
          <div className="a2-cols" style={{...cols, rowGap: v(48, 32, 48)}}>
            {shown.map((p, i) => (
              <ProjectCard key={p.slug} project={p} variant="home" index={i} />
            ))}
          </div>
          {also.length > 0 && (
            <div style={{marginTop: v(48, 48, 64)}}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '8px 24px',
                  fontSize: 14,
                }}
              >
                <span className="a2-micro">Also</span>
                {also.map(p => (
                  <Anchor key={p.slug} className="a2-ulink" href={p.href}>
                    {p.title}
                  </Anchor>
                ))}
              </div>
            </div>
          )}
        </>
      )
    }
  }
}

export function ProjectsSection({
  state,
  settings,
}: {
  state: Loadable<ProjectSummary[]>
  settings?: SiteSettings
}) {
  return (
    <section className="a2-sec" data-cut aria-labelledby="home-projects">
      <SectionBg hue="peri" at={[20, 46]} texture="scan" />
      <Rail from="blue" to="peri" node={[69, 95, 130, 166]} label="5ca1ab1" />
      <div className="a2-c">
        <Split
          spans={[1, 4, 6, 7]}
          left={
            <SectionHeader
              id="home-projects"
              number={['02', '', '', 'peri']}
              eyebrow="building"
              title="Selected projects"
              copy="What I am building right now, newest activity first."
              link={['All projects', '/projects']}
            />
          }
          right={
            <Body
              state={state}
              github={settings?.social.github ?? 'https://github.com/swemre'}
            />
          }
        />
      </div>
    </section>
  )
}
