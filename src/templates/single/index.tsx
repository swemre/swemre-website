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

// Single page (boards Single-Page, 4K Single-Page-1/2): the path line, title, lead, the meta line
// (updated / read time / version / changelog) with Print and PDF, "At a glance", the numbered
// table of contents, the sections, the end line, and "Recent articles". Pages without a TOC,
// print or version (generic pages) get the plain variant: the same hero and body, no extras.
import {Fragment, type ReactNode} from 'react'
import type {Block} from '../../contract/blocks.ts'
import type {TemplateProps} from '../../contract/templates.ts'
import type {Page} from '../../contract/view.ts'
import {usePage} from '../../data/hooks.ts'
import {
  Button,
  Texture as PaperTexture,
  useViewport,
} from '../../design/index.tsx'
import {FactStrip, SingleBody, headingsOf} from '../body/index.ts'
import {Glow, HeroCurve, Sec, Texture, TopGlow} from '../parts/deco.tsx'
import {fmtLongDate, minRead} from '../parts/format.ts'
import {RecentArticles} from '../parts/recent.tsx'
import {useActiveHeading} from '../parts/scroll.ts'
import {PageError, PageLoading} from '../parts/states.tsx'
import {PageTocDisclosure, PageTocNav} from '../parts/toc.tsx'
import {useHeroPad, usePick} from '../parts/vp.ts'
import {NotFoundTemplate} from '../not-found/index.tsx'

export function SingleTemplate({route}: TemplateProps) {
  const slug = route.params.slug ?? ''
  const res = usePage(slug)
  if (res.status === 'loading') return <PageLoading label="Loading the page" />
  if (res.status === 'error')
    return (
      <PageError
        what="The page"
        command={`GET /api/public/v2/channels/swemre-website/publications/${slug}`}
        onRetry={res.retry}
      />
    )
  if (res.status === 'empty')
    return <NotFoundTemplate route={{...route, notFoundKind: 'single'}} />
  return <SingleView page={res.data} />
}

/** Words of the body at 150 words a minute (dense policy text), rounded up. */
function readMinutes(blocks: Block[]) {
  let words = 0
  const count = (s: string) => {
    words += s.split(/\s+/).filter(Boolean).length
  }
  const walk = (v: unknown) => {
    if (typeof v === 'string') count(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  blocks.forEach(b => walk(b.props))
  return Math.max(1, Math.ceil(words / 150))
}

function Sep() {
  return <span style={{color: 'var(--a2-text-dim)', padding: '0 8px'}}>/</span>
}

function printPage() {
  window.print()
}

function PrintButtons({pdfUrl, long}: {pdfUrl?: string; long?: boolean}) {
  const vp = useViewport()
  return (
    <div
      data-print="hide"
      style={
        vp === 'm'
          ? {display: 'flex', flexDirection: 'column', gap: 16}
          : {
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: long ? 'wrap' : 'nowrap',
            }
      }
    >
      <Button
        kind="secondary"
        label="Print"
        iconLeft="file-text"
        onClick={printPage}
      />
      {pdfUrl ? (
        <Button
          kind="secondary"
          label={long ? 'Download PDF' : 'PDF'}
          iconLeft="download"
          href={pdfUrl}
        />
      ) : (
        <Button
          kind="secondary"
          label={long ? 'Download PDF' : 'PDF'}
          iconLeft="download"
          onClick={printPage}
          title="Save as PDF from the print dialog"
        />
      )}
    </div>
  )
}

function SingleView({page}: {page: Page}) {
  const vp = useViewport()
  const pick = usePick()
  const big = vp === 'd' || vp === '4k'
  const pad = useHeroPad()
  const full = page.showToc || page.showPrint || !!page.policyVersion
  const strip = page.body.find(
    (b): b is Extract<Block, {type: 'facts'}> =>
      b.type === 'facts' && b.props.layout === 'strip',
  )
  const body = page.body.filter(b => b !== strip)
  const toc = page.showToc ? headingsOf(body) : []
  const active = useActiveHeading(toc.map(t => t.id))
  const minutes = readMinutes(body)
  const date = page.effectiveDate ?? page.updatedAt
  const segments = page.href.split('/').filter(Boolean)
  const leaf = segments.pop() ?? page.slug

  const metaLine: ReactNode[] = [
    <Fragment key="u">
      updated&nbsp;<span className="a2-hi">{fmtLongDate(page.updatedAt)}</span>
    </Fragment>,
    <Fragment key="r">{minRead(minutes)}</Fragment>,
  ]
  if (page.policyVersion)
    metaLine.push(
      <Fragment key="v">
        version&nbsp;<span className="a2-hi">{page.policyVersion}</span>
      </Fragment>,
    )
  if (page.changelogUrl)
    metaLine.push(
      <a key="c" className="a2-ilink" href={page.changelogUrl}>
        changelog
      </a>,
    )
  const meta = (
    <p
      className="a2-mono"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px 0',
      }}
    >
      {metaLine.map((m, i) => (
        <Fragment key={i}>
          {i > 0 && <Sep />}
          {m}
        </Fragment>
      ))}
    </p>
  )
  const showPrint = full && page.showPrint

  const article = (
    <article style={{maxWidth: 720, minWidth: 0}}>
      <SingleBody blocks={body} />
      {full && (
        <div
          style={{
            display: 'flex',
            ...(vp === 'm'
              ? {flexDirection: 'column', gap: 16}
              : {
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }),
            marginTop: big ? 64 : 48,
            paddingTop: 24,
            borderTop: '1px solid var(--a2-line)',
          }}
        >
          <span className="a2-mono">
            {[
              'end of document',
              page.policyVersion && `v${page.policyVersion}`,
              fmtLongDate(date),
            ]
              .filter(Boolean)
              .join(' / ')}
          </span>
          {page.showPrint && <PrintButtons pdfUrl={page.pdfUrl} long />}
        </div>
      )}
    </article>
  )

  const paper = pick({
    m: '300px 260px',
    t: '480px 400px',
    d: '600px 480px',
    k: '720px 560px',
  })

  return (
    <>
      <TopGlow />
      <div style={{position: 'relative'}}>
        <Sec
          deco={{
            rail: {hue: 'blue', top: pick({m: 0, d: 144})},
            node: {top: {m: 115, t: 131, d: 166, k: 198}},
            label: '9011cy1',
            bg: <Texture kind="grid" hue="blue" x="16%" y="30%" />,
          }}
          style={pad}
        >
          <HeroCurve hue="blue" top={40} />
          <div className="a2-c">
            <span className="a2-eyebrow" style={{marginBottom: 16}}>
              {'// swemre.com/'}
              {segments.map(s => `${s}/`).join('')}
              <span className="a2-hi">{leaf}</span>
            </span>
            <h1 className="a2-d2" style={{textWrap: 'balance'}}>
              {page.title}
            </h1>
            {page.lead && (
              <p
                className="a2-lead"
                style={{marginTop: pick({m: 16, d: 24}), maxWidth: 760}}
              >
                {page.lead}
              </p>
            )}
            <div style={{marginTop: big ? 48 : 32}}>
              {showPrint && vp !== 'm' ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 32,
                  }}
                >
                  {meta}
                  <div style={{flex: 'none'}}>
                    <PrintButtons pdfUrl={page.pdfUrl} />
                  </div>
                </div>
              ) : (
                meta
              )}
            </div>
            {strip && (
              <div style={{marginTop: big ? 48 : 32}}>
                <FactStrip
                  title={strip.props.title ?? 'At a glance'}
                  facts={strip.props.facts}
                />
              </div>
            )}
            <div className="a2-fhr" style={{marginTop: big ? 64 : 48}} />
          </div>
        </Sec>

        <Sec
          deco={{
            rail: {from: 'blue', hue: 'peri'},
            node: {top: {m: 37, t: 37, d: 52, k: 68}},
            label: 'd0c5e11',
            bg: (
              <>
                <Glow hue="peri" x="84%" y="640px" a={0.15} />
                <Glow hue="peri" x="10%" y="60%" a={0.075} size="sm" />
                <PaperTexture kind="paper" mask={`${paper} at 84% 640px`} />
              </>
            ),
          }}
          style={{paddingTop: pick({m: 32, d: 48, k: 64})}}
        >
          <div className="a2-c">
            {big && toc.length > 0 ? (
              <div className="a2-g12" style={{alignItems: 'start'}}>
                <div style={{gridColumn: '1 / span 3', minWidth: 0}}>
                  <div data-print="hide" style={{position: 'sticky', top: 96}}>
                    <PageTocNav entries={toc} active={active} />
                  </div>
                </div>
                <div style={{gridColumn: '5 / span 8', minWidth: 0}}>
                  {article}
                </div>
              </div>
            ) : (
              <>
                {vp === 't' && toc.length > 0 && (
                  <div data-print="hide">
                    <PageTocDisclosure entries={toc} active={active} />
                  </div>
                )}
                {article}
              </>
            )}
          </div>
        </Sec>

        <Sec
          hidePrint
          deco={{
            rail: {from: 'peri', hue: 'blue'},
            node: {top: {m: 103, t: 119, d: 150, k: 182}, end: true},
            label: 'c0ffee1',
            bg: (
              <>
                <Glow hue="blue" x="20%" y="40%" a={0.135} />
                <Texture kind="dots" hue="blue" x="20%" y="40%" />
              </>
            ),
          }}
        >
          <div className="a2-c">
            <RecentArticles />
          </div>
        </Sec>
      </div>
    </>
  )
}
