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
// Project page (boards Project-swemre-website-api, 4K -1/-2): hero with path line, View source /
// Read the docs and the Status / Started / Language / Stack / Updated strip; the numbered body
// sections; and the last section with related articles and related projects.
import type {TemplateProps} from '../../contract/templates.ts'
import type {Hue, Project} from '../../contract/view.ts'
import {useProject} from '../../data/hooks.ts'
import {
  ArticleRow,
  Button,
  ProjectCard,
  StatusBadge,
  useViewport,
} from '../../design/index.tsx'
import {ProjectBody, SectionNumber, badgeHue} from '../body/index.ts'
import {Glow, HeroCurve, Sec, Texture, TopGlow} from '../parts/deco.tsx'
import {fmtDate} from '../parts/format.ts'
import {ArrowLink, MetaStrip, PathLine, SectionHead} from '../parts/heads.tsx'
import {PageError, PageLoading} from '../parts/states.tsx'
import {useHeroPad, usePick} from '../parts/vp.ts'
import {NotFoundTemplate} from '../not-found/index.tsx'
import {t} from '../../i18n/index.ts'

export function ProjectTemplate({route}: TemplateProps) {
  const slug = route.params.slug ?? ''
  const res = useProject(slug)
  if (res.status === 'loading')
    return <PageLoading label={t('state.loading.project')} />
  if (res.status === 'error')
    return (
      <PageError
        what={t('state.what.project')}
        command={`GET /api/public/v2/channels/swemre-website/publications/${slug}`}
        onRetry={res.retry}
      />
    )
  if (res.status === 'empty')
    return <NotFoundTemplate route={{...route, notFoundKind: 'project'}} />
  return <ProjectView p={res.data} />
}

function VersionBadge({version, hue}: {version: string; hue: Hue}) {
  return (
    <span className="a2-badge" style={badgeHue(hue)}>
      {version}
    </span>
  )
}

function ProjectView({p}: {p: Project}) {
  const vp = useViewport()
  const pick = usePick()
  const big = vp === 'd' || vp === '4k'
  const pad = useHeroPad()
  const sections = p.body.filter(b => b.type === 'section')
  const lastHue: Hue =
    (sections.at(-1)?.type === 'section' && sections.at(-1)?.props.hue) ||
    'blue'
  const hasRelated =
    p.relatedArticles.length > 0 || p.relatedProjects.length > 0
  const relHue: Hue = 'aqua'
  const relNumber = `0x${String(sections.length + 1).padStart(2, '0')}`
  const endRail = pick({m: 48, t: 64, d: 96, k: 128})
  const endNode = {m: 43, t: 59, d: 90, k: 122}

  const buttons = (
    <div
      style={
        vp === 'm'
          ? {display: 'flex', flexDirection: 'column', gap: 16}
          : {display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16}
      }
    >
      {p.sourceAvailable && p.repoUrl && (
        <Button
          kind="primary"
          label={t('project.viewSource')}
          iconLeft="github"
          href={p.repoUrl}
        />
      )}
      {p.live && p.url && (
        <Button
          kind={p.sourceAvailable ? 'secondary' : 'primary'}
          label={t('project.visitSite')}
          iconLeft="external"
          href={p.url}
        />
      )}
      {p.docsUrl && (
        <Button
          kind="secondary"
          label={t('project.docs')}
          iconLeft="book-open"
          href={p.docsUrl}
        />
      )}
    </div>
  )
  const heading = (
    <>
      <PathLine root="projects" href="/projects" leaf={p.slug} />
      <h1 className="a2-d2" style={{textWrap: 'balance'}}>
        {p.title}
      </h1>
      <p
        className="a2-lead"
        style={{marginTop: pick({m: 16, d: 24}), maxWidth: 760}}
      >
        {p.summary}
      </p>
    </>
  )
  const meta = (
    <MetaStrip
      items={[
        {
          label: t('projects.status'),
          value: (
            <>
              <StatusBadge p={p} hue={p.hue} />
              {p.version && <VersionBadge version={p.version} hue={p.hue} />}
            </>
          ),
        },
        ...(p.year
          ? [{label: t('project.started'), value: String(p.year)}]
          : []),
        ...(p.language
          ? [{label: t('project.language'), value: p.language}]
          : []),
        {
          label: t('projects.stack'),
          value: p.stack.map(t => (
            <span key={t.slug} className="a2-badge">
              {t.name}
            </span>
          )),
        },
        {
          label: t('project.updated'),
          value: <time dateTime={p.updatedAt}>{fmtDate(p.updatedAt)}</time>,
        },
      ]}
    />
  )

  return (
    <>
      <TopGlow />
      <div style={{position: 'relative'}}>
        <Sec
          deco={{
            rail: {hue: 'blue', top: pick({m: 0, d: 144})},
            node: {top: {m: 115, t: 131, d: 166, k: 198}},
            label: '9c1a7e2',
            bg: <Texture kind="grid" hue="blue" x="16%" y="30%" />,
          }}
          style={pad}
        >
          <HeroCurve hue="blue" top={40} />
          <div className="a2-c">
            {vp === 'm' ? (
              <>
                {heading}
                <div style={{marginTop: 24}}>{buttons}</div>
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: big ? 32 : 24,
                }}
              >
                <div style={{minWidth: 0}}>{heading}</div>
                <div style={{flex: 'none'}}>{buttons}</div>
              </div>
            )}
            <div style={{marginTop: big ? 48 : 32}}>{meta}</div>
            <div className="a2-fhr" style={{marginTop: big ? 64 : 48}} />
          </div>
        </Sec>

        <ProjectBody blocks={p.body} from="blue" />

        {hasRelated && (
          <Sec
            deco={{
              rail: {from: lastHue, hue: relHue, bottom: endRail},
              node: {bottom: endNode, end: true},
              label: 'acce55d',
              bg: (
                <>
                  <Glow hue={relHue} x="80%" y="20%" a={0.135} />
                  <Texture kind="diag" hue={relHue} x="80%" y="20%" />
                </>
              ),
            }}
          >
            <div className="a2-c">
              {p.relatedArticles.length > 0 && (
                <>
                  <SectionHead
                    above={
                      <div style={{marginBottom: big ? 32 : 24}}>
                        <SectionNumber number={relNumber} hue={relHue} />
                      </div>
                    }
                    eyebrow={t('project.readMore')}
                    title={t('project.relatedArticles')}
                    action={
                      <ArrowLink to="/articles">
                        {t('nav.allArticles')}
                      </ArrowLink>
                    }
                  />
                  <div className="a2-rows">
                    {p.relatedArticles.map(a => (
                      <ArticleRow
                        key={a.slug}
                        article={a}
                        tags={false}
                        variant="list"
                      />
                    ))}
                  </div>
                </>
              )}
              {p.relatedProjects.length > 0 && (
                <div
                  style={
                    p.relatedArticles.length
                      ? {marginTop: big ? 64 : 48}
                      : undefined
                  }
                >
                  <SectionHead
                    eyebrow={t('project.keepExploring')}
                    title={t('project.relatedProjects')}
                    action={
                      <ArrowLink to="/projects">
                        {t('nav.allProjects')}
                      </ArrowLink>
                    }
                  />
                  <div
                    className="a2-cols"
                    style={{
                      gridTemplateColumns: `repeat(${vp === 'm' ? 1 : 2},minmax(0,1fr))`,
                      gap: pick({m: 16, t: 24, d: 32}),
                    }}
                  >
                    {p.relatedProjects.map((rp, i) => (
                      <ProjectCard
                        key={rp.slug}
                        project={rp}
                        variant="grid"
                        index={i}
                        hue={rp.hue}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Sec>
        )}
      </div>
    </>
  )
}
