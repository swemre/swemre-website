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

// The header of B's list pages (Articles, Topic, Projects, Search): top ground, grid texture,
// hooked rail, breadcrumb, eyebrow, h1, lead, a control beside the title and the row below.
// Board metrics per viewport: padding 112/128/160/192 top, breadcrumb gap 24/24/32, the row
// below at 32/32/48 and the rule at 48/48/64.
import {Fragment, type ReactNode} from 'react'
import {
  Anchor,
  Eyebrow,
  Rail,
  SectionBg,
  Texture,
  TopGround,
  useViewport,
} from '../../../design/index.tsx'
import type {Hue} from '../../../contract/view.ts'
import {useV} from './vp.ts'

export function ListHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  right,
  below,
  hue = 'blue',
  commit,
}: {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  /** Path crumbs; the last one is the current page. */
  crumbs?: {label: string; href?: string}[]
  /** Beside the title block; under the lead on mobile. */
  right?: ReactNode
  below?: ReactNode
  hue?: Hue
  commit?: string
}) {
  const vp = useViewport()
  const v = useV()
  const pt = v(112, 128, 160, 192)
  return (
    <>
      <TopGround />
      <section
        className="a2-sec"
        data-cut
        style={{paddingTop: pt, paddingBottom: v(32, 32, 48, 64)}}
      >
        <SectionBg>
          <Texture kind="grid" hue={hue} mask="42% 38% at 16% 30%" />
        </SectionBg>
        <Rail
          from={hue}
          hook={40}
          top={v(0, 0, 144)}
          nodes={[{top: pt + v(3, 3, 6)}]}
          label={commit ? {text: commit} : undefined}
        />
        <div className="a2-c">
          {crumbs && (
            <nav aria-label="Breadcrumb">
              <p className="a2-mono" style={{marginBottom: v(24, 24, 32)}}>
                {crumbs.map((c, i) => (
                  <Fragment key={i}>
                    {i > 0 && (
                      <span
                        aria-hidden="true"
                        style={{color: 'var(--a2-text-dim)', padding: '0 8px'}}
                      >
                        /
                      </span>
                    )}
                    {c.href ? (
                      <Anchor className="a2-ulink" href={c.href}>
                        {c.label}
                      </Anchor>
                    ) : i === crumbs.length - 1 ? (
                      <span className="a2-hi" aria-current="page">
                        {c.label}
                      </span>
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </Fragment>
                ))}
              </p>
            </nav>
          )}
          {vp === 'm' ? (
            <>
              <Head eyebrow={eyebrow} title={title} lead={lead} />
              {right && <div style={{marginTop: 24}}>{right}</div>}
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: v(24, 24, 32),
              }}
            >
              <Head eyebrow={eyebrow} title={title} lead={lead} />
              {right && <div style={{flex: 'none'}}>{right}</div>}
            </div>
          )}
          {below && <div style={{marginTop: v(32, 32, 48)}}>{below}</div>}
          <div className="a2-fhr" style={{marginTop: v(48, 48, 64)}} />
        </div>
      </section>
    </>
  )
}

function Head({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
}) {
  const v = useV()
  return (
    <div style={{minWidth: 0}}>
      <Eyebrow style={{marginBottom: 16}}>{eyebrow}</Eyebrow>
      <h1 className="a2-d2">{title}</h1>
      {lead && (
        <p
          className="a2-lead"
          style={{marginTop: v(16, 16, 24), maxWidth: 760}}
        >
          {lead}
        </p>
      )}
    </div>
  )
}
