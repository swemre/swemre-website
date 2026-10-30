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

// PageHeader (V4-Comp-PageHeader): the inner-page top section. Top ground, grid texture, rail
// with hook (desktop, 4K), crumbs, optional number, // eyebrow, the d2 h1, lead, a right slot
// (beside the title except on mobile), a below slot (chips) and the faded rule.
import {Fragment, type ReactNode} from 'react'
import type {Crumb} from '../../contract/view.ts'
import {useViewport, type Viewport} from '../context.ts'
import {Anchor} from './Link.tsx'
import {Rail, SectionBg, Texture, TopGround} from './Decor.tsx'
import {Eyebrow, SectionNumber} from './SectionHeader.tsx'
import type {Hue} from './util.ts'

const M: Record<
  Viewport,
  {
    pt: number
    pb: number
    node: number
    lead: number
    rule: number
    gap: number
  }
> = {
  m: {pt: 112, pb: 32, node: 3, lead: 16, rule: 48, gap: 24},
  t: {pt: 128, pb: 32, node: 3, lead: 16, rule: 48, gap: 24},
  d: {pt: 160, pb: 48, node: 6, lead: 24, rule: 64, gap: 32},
  '4k': {pt: 192, pb: 64, node: 6, lead: 24, rule: 64, gap: 32},
}

export interface PageHeaderProps {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  /** "swemre.com / articles / java"; the last crumb has no href. */
  crumbs?: Crumb[]
  number?: [string, string?, string?, Hue?]
  /** Beside the title (below it on mobile): view toggles, a count chip. */
  right?: ReactNode
  /** Under the title block: filter chips. */
  below?: ReactNode
  hue?: Hue
  /** The rail's commit label (desktop and 4K). */
  commit?: string
  /** Neutral status ground for error pages. */
  tone?: 'navy' | 'status'
  /** Leave out the faded rule under the header. */
  noRule?: boolean
  /** h1 id (SiteShell focuses the first h1 on navigation). */
  id?: string
}

export function Crumbs({crumbs}: {crumbs: Crumb[]}) {
  return (
    <nav aria-label="Breadcrumb">
      <p className="a2-mono" style={{marginBottom: 32}}>
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
              <Anchor href={c.href}>{c.label}</Anchor>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </Fragment>
        ))}
      </p>
    </nav>
  )
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  number,
  right,
  below,
  hue = 'blue',
  commit,
  tone = 'navy',
  noRule,
  id,
}: PageHeaderProps) {
  const vp = useViewport()
  const m = M[vp]
  const wide = vp === 'd' || vp === '4k'
  const nodeTop = m.pt + m.node + (crumbs && wide ? 28 : 0)
  const head = (
    <div style={{minWidth: 0}}>
      <Eyebrow style={{marginBottom: 16}}>{eyebrow}</Eyebrow>
      <h1 className="a2-d2" id={id}>
        {title}
      </h1>
      {lead && (
        <p className="a2-lead" style={{marginTop: m.lead, maxWidth: 760}}>
          {lead}
        </p>
      )}
    </div>
  )
  return (
    <>
      <TopGround tone={tone} />
      <section
        className="a2-sec"
        data-cut
        style={{paddingTop: m.pt, paddingBottom: m.pb}}
      >
        <SectionBg>
          <Texture kind="grid" hue={hue} mask="42% 38% at 16% 30%" />
        </SectionBg>
        <Rail
          from={hue}
          hook={40}
          top={wide ? 144 : 0}
          nodes={[{top: nodeTop}]}
          label={commit ? {text: commit} : undefined}
        />
        <div className="a2-c">
          {crumbs && crumbs.length > 0 && <Crumbs crumbs={crumbs} />}
          {number && (
            <div style={{marginBottom: 32}}>
              <SectionNumber number={number} />
            </div>
          )}
          {right && vp !== 'm' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: m.gap,
              }}
            >
              {head}
              <div style={{flex: 'none'}}>{right}</div>
            </div>
          ) : (
            <>
              {head}
              {right && <div style={{marginTop: 24}}>{right}</div>}
            </>
          )}
          {below && <div style={{marginTop: 48}}>{below}</div>}
          {!noRule && <div className="a2-fhr" style={{marginTop: m.rule}} />}
        </div>
      </section>
    </>
  )
}
