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

// Not found, chosen by route.notFoundKind: the 404 status page (any path), Article- and
// Project-not-found (the normal hero with "Did you mean" and the failed `open` line), and
// Single-Page-not-found (the status page pointing at the privacy policy).
import type {TemplateProps} from '../../contract/templates.ts'
import type {ArticleSummary, ProjectSummary} from '../../contract/view.ts'
import {useArticles, useProjects} from '../../data/hooks.ts'
import {Button, Icon, useViewport} from '../../design/index.tsx'
import {Link} from 'react-router-dom'
import {closest} from '../parts/closest.ts'
import {Sec, HeroCurve, TopGlow} from '../parts/deco.tsx'
import {fmtDate, minRead} from '../parts/format.ts'
import {ArrowLink} from '../parts/heads.tsx'
import {CodeMark, StatusHero, StatusLink} from '../parts/status.tsx'
import {useHeroPad, usePick} from '../parts/vp.ts'

export function NotFoundTemplate({route}: TemplateProps) {
  const kind = route.notFoundKind ?? 'page'
  if (kind === 'article' || kind === 'project')
    return (
      <MissingItem
        kind={kind}
        path={route.path}
        slug={route.params.slug ?? ''}
      />
    )
  if (kind === 'single')
    return (
      <StatusHero
        hue="blue"
        railLabel="404p0l1"
        mark={
          <CodeMark
            code="404"
            color="var(--a2-soft)"
            glow="var(--a2-hue-blue-rgb)"
          />
        }
        markLabel="Not found"
        markColor="var(--a2-soft)"
        eyebrow="error 404"
        detail={`swemre.com${route.path}`}
        title="This page is not available."
        lead="It may have been unpublished, or the link is old or mistyped. The privacy policy is still here."
        actions={
          <>
            <Button
              kind="primary"
              label="Privacy policy"
              iconLeft="shield"
              href="/policies/privacy-policy"
            />
            <StatusLink to="/">Home</StatusLink>
            <StatusLink to="/articles">Articles</StatusLink>
          </>
        }
      />
    )
  return (
    <StatusHero
      hue="blue"
      railLabel="404f0nd"
      mark={
        <CodeMark
          code="404"
          color="var(--a2-soft)"
          glow="var(--a2-hue-blue-rgb)"
        />
      }
      markLabel="Not found"
      markColor="var(--a2-soft)"
      eyebrow="error 404"
      detail={route.path}
      title="Nothing lives here."
      lead="The link may be old or mistyped. Everything that exists is one click away."
      actions={
        <>
          <Button kind="primary" label="Home" iconLeft="arrow-left" href="/" />
          <StatusLink to="/articles">Articles</StatusLink>
          <StatusLink to="/projects">Projects</StatusLink>
        </>
      }
    />
  )
}

const COPY = {
  article: {
    title: 'This article is not available.',
    lead: 'It may have been unpublished, or the link is old or mistyped. Everything that is published is one click away.',
    list: ['/articles', 'Articles'],
  },
  project: {
    title: 'This project is not available.',
    lead: 'It may have been renamed or made private, or the link is mistyped. Every public project is on the projects page.',
    list: ['/projects', 'Projects'],
  },
} as const

function useSuggestion(
  kind: 'article' | 'project',
  slug: string,
): ArticleSummary | ProjectSummary | undefined {
  const articles = useArticles()
  const projects = useProjects()
  const res = kind === 'article' ? articles : projects
  if (res.status !== 'ready') return undefined
  return closest<ArticleSummary | ProjectSummary>(slug, res.data)
}

function DidYouMean({item}: {item: ArticleSummary | ProjectSummary}) {
  const meta =
    'publishedAt' in item
      ? [fmtDate(item.publishedAt), minRead(item.readingTime)]
      : [item.language, item.tagline ?? '']
  return (
    <Link
      to={item.href}
      className="a2-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        maxWidth: 560,
        borderColor: 'var(--a2-line-blue-2)',
      }}
    >
      <span style={{flex: 1, minWidth: 0}}>
        <span className="a2-micro">Did you mean</span>
        <span
          className="a2-h4"
          style={{
            display: 'block',
            marginTop: 8,
            fontSize: 16,
            lineHeight: '24px',
          }}
        >
          {item.title}
        </span>
        <span className="a2-mono">{meta.filter(Boolean).join(' · ')}</span>
      </span>
      <span style={{color: 'var(--a2-link)'}}>
        <Icon name="arrow-right" size={18} />
      </span>
    </Link>
  )
}

function MissingItem({
  kind,
  path,
  slug,
}: {
  kind: 'article' | 'project'
  path: string
  slug: string
}) {
  const vp = useViewport()
  const pick = usePick()
  const big = vp === 'd' || vp === '4k'
  const pad = useHeroPad()
  const copy = COPY[kind]
  const suggestion = useSuggestion(kind, slug)
  const gap = big ? 48 : 32
  const end = pick({m: 48, t: 64, d: 96, k: 128})
  return (
    <>
      <TopGlow status />
      <div style={{position: 'relative'}}>
        <Sec
          deco={{
            rail: {hue: 'blue', top: pick({m: 0, d: 144})},
            node: {top: {m: 115, t: 131, d: 166, k: 198}},
            label: '404',
          }}
          style={pad}
        >
          <HeroCurve hue="blue" top={40} />
          <div className="a2-c">
            <span className="a2-eyebrow" style={{marginBottom: 16}}>
              {`// error 404 · ${path}`}
            </span>
            <h1 className="a2-d2">{copy.title}</h1>
            <p
              className="a2-lead"
              style={{marginTop: big ? 24 : 16, maxWidth: 760}}
            >
              {copy.lead}
            </p>
            <div style={{marginTop: gap, display: 'flex', gap: 16}}>
              <ArrowLink to={copy.list[0]}>{copy.list[1]}</ArrowLink>
              <ArrowLink to="/">Home</ArrowLink>
            </div>
            {suggestion && (
              <div style={{marginTop: gap}}>
                <DidYouMean item={suggestion} />
              </div>
            )}
            <p
              className="a2-mono"
              style={{
                marginTop: gap,
                whiteSpace: vp === 'm' ? 'normal' : 'nowrap',
              }}
            >
              <span className="a2-mint">$</span> open ~{path}
              <span style={{color: 'var(--a2-err-text)', marginLeft: 16}}>
                404 not found
              </span>
            </p>
          </div>
        </Sec>
        <Sec
          deco={{
            rail: {hue: 'blue', bottom: end},
            node: {bottom: {m: 43, t: 59, d: 90, k: 122}, end: true},
          }}
          style={{padding: `${end}px 0 0`}}
        >
          {null}
        </Sec>
      </div>
    </>
  )
}
