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

// ProjectCard: grid (the Projects page cards with the big number), list (the Projects "list"
// rows with the glyph tile, key facts and buttons), home (the home "Selected projects" items)
// and card (V4-Comp-ProjectCard: the home item on a hue card).
import type {Hue, ProjectSummary} from '../../contract/view.ts'
import {useViewport} from '../context.ts'
import {Anchor} from './Link.tsx'
import {Button} from './Button.tsx'
import {Badge, BadgeList, Tags, TextLink} from './Text.tsx'
import {hueRgb, projectGlyph, projectHue, relativeTime} from './util.ts'

export function StatusBadge({
  p,
  hue,
  both,
}: {
  p: ProjectSummary
  hue: Hue
  both?: boolean
}) {
  const building =
    p.status === 'now-building' ? (
      <Badge key="b" label="now building" hue={hue} dot pulse />
    ) : null
  const live = p.url ? <Badge key="l" label="Live" tone="ok" dot /> : null
  const other =
    p.status === 'source-only' ? (
      <Badge key="s" label="source only" />
    ) : p.status === 'archived' ? (
      <Badge key="a" label="archived" />
    ) : null
  if (both) return <>{[building, live ?? other]}</>
  return building ?? live ?? other
}

function ProjectLink({p}: {p: ProjectSummary}) {
  return p.url ? (
    <TextLink label="Visit site" href={p.url} icon="external" external />
  ) : (
    <TextLink label="View project" href={p.href} />
  )
}

export interface ProjectCardProps {
  project: ProjectSummary
  variant?: 'grid' | 'list' | 'home' | 'card'
  /** Position in the list: the number (01, 02...) and, until content carries one, the hue. */
  index?: number
  hue?: Hue
}

export function ProjectCard({
  project: p,
  variant = 'grid',
  index = 0,
  hue,
}: ProjectCardProps) {
  const vp = useViewport()
  const h = hue ?? projectHue(p, index)
  const num = String(index + 1).padStart(2, '0')
  const tags = p.stack.map(t => t.name)
  const numStyle = (size: number) => ({
    fontSize: size,
    lineHeight: 1,
    color: `var(--a2-hue-${h})`,
    textShadow: `0 0 32px ${hueRgb(h, 'calc(0.35 * var(--a2-glow-text-k))')}`,
  })
  const cardStyle = {
    borderColor: hueRgb(h, 0.16),
    boxShadow: `var(--a2-shadow-card),0 0 120px -20px ${hueRgb(h, 'calc(0.12 * var(--a2-glow-k))')}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  }
  const title = (cls: string, style?: React.CSSProperties) => (
    <h3 className={cls} style={style}>
      <Anchor href={p.href} style={{color: 'inherit'}}>
        {p.title}
      </Anchor>
    </h3>
  )

  if (variant === 'home' || variant === 'card') {
    const inner = (
      <article style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <p
          className="a2-mono"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 24,
            fontSize: 12,
          }}
        >
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
            {p.status === 'now-building' && (
              <Badge label="now building" hue={h} dot pulse />
            )}
          </span>
          <span>{p.year}</span>
        </p>
        {title('a2-h3')}
        <p className="a2-body" style={{flexGrow: 1}}>
          {p.summary}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 8,
          }}
        >
          <Tags tags={tags} />
          <ProjectLink p={p} />
        </div>
      </article>
    )
    return variant === 'card' ? (
      <div className="a2-card" style={cardStyle}>
        {inner}
      </div>
    ) : (
      inner
    )
  }

  if (variant === 'grid')
    return (
      <div className="a2-card" style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <span className="a2-num" style={numStyle(vp === 'm' ? 48 : 56)}>
            {num}
          </span>
          <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <StatusBadge p={p} hue={h} />
            {p.year && <span className="a2-mono">{p.year}</span>}
          </span>
        </div>
        {title('a2-h3', {marginTop: 24})}
        <p className="a2-small" style={{marginTop: 8, flexGrow: 1}}>
          {p.summary}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 24,
          }}
        >
          <BadgeList tags={tags} />
          <ProjectLink p={p} />
        </div>
      </div>
    )

  // list
  const small = vp === 'm' || vp === 't'
  const glyph = (
    <span
      className="p2-glyph a2-island"
      aria-hidden="true"
      style={{
        width: small ? 96 : 160,
        height: small ? 64 : 112,
        fontSize: small ? 16 : 24,
        borderColor: hueRgb(h, 0.28),
        textShadow: `0 0 20px ${hueRgb(h, 'calc(0.8 * var(--a2-glow-text-k))')}`,
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right,var(--a2-cover-grid) 1px,transparent 1px),linear-gradient(var(--a2-cover-grid) 1px,transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(90% 120% at 80% 20%,${hueRgb(h, 0.35)},transparent 60%)`,
        }}
      />
      <span style={{position: 'relative'}}>{projectGlyph(p)}</span>
    </span>
  )
  const number = (
    <span className="a2-num" aria-hidden="true" style={numStyle(48)}>
      {num}
    </span>
  )
  const head = (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        {title('a2-h3')}
        {p.year && <span className="a2-mono">{p.year}</span>}
        <StatusBadge p={p} hue={h} both />
      </div>
      <p className="a2-small" style={{marginTop: 8, maxWidth: 560}}>
        {p.summary}
      </p>
      <BadgeList tags={tags} style={{marginTop: 16}} />
    </div>
  )
  const updated = relativeTime(p.updatedAt)
  const kv = (
    <dl
      className="a2-kv"
      style={{gridTemplateColumns: '96px 1fr', columnGap: 24, rowGap: 16}}
    >
      {p.version && (
        <>
          <dt>Version</dt>
          <dd>
            <span className="a2-mono a2-hi">{p.version}</span>
          </dd>
        </>
      )}
      {p.language && (
        <>
          <dt>Language</dt>
          <dd>{p.language}</dd>
        </>
      )}
      <dt>Updated</dt>
      <dd>{updated}</dd>
    </dl>
  )
  const buttons = (block: boolean) => (
    <>
      {p.url && (
        <Button
          kind="secondary"
          block={block}
          iconLeft="external"
          label="Visit live site"
          href={p.url}
        />
      )}
      {p.repoUrl && !p.privateRepo && (
        <Button
          kind="secondary"
          block={block}
          iconLeft="github"
          label="View source"
          href={p.repoUrl}
        />
      )}
      {!p.url && (!p.repoUrl || p.privateRepo) && (
        <Button
          kind="secondary"
          block={block}
          iconRight="arrow-right"
          label="View project"
          href={p.href}
        />
      )}
    </>
  )
  if (vp === 'm')
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '20px 0',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          {number}
          {glyph}
        </div>
        {head}
        {kv}
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          {buttons(true)}
        </div>
      </div>
    )
  if (vp === 't')
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '96px minmax(0,1fr)',
          columnGap: 24,
          padding: '24px 0',
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {number}
          {glyph}
        </div>
        <div style={{minWidth: 0}}>
          {head}
          <p className="a2-mono" style={{marginTop: 16}}>
            {[
              p.version && (
                <span key="v" className="a2-hi">
                  {p.version}
                </span>
              ),
              p.language,
              `updated ${updated}`,
            ]
              .filter(Boolean)
              .flatMap((x, i) => (i ? [' · ', x] : [x]))}
          </p>
          <div
            style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24}}
          >
            {buttons(false)}
          </div>
        </div>
      </div>
    )
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '72px 160px minmax(0,1fr) 240px',
        columnGap: 32,
        padding: '32px 0',
      }}
    >
      {number}
      {glyph}
      <div style={{minWidth: 0}}>{head}</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {kv}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 16,
          }}
        >
          {buttons(true)}
        </div>
      </div>
    </div>
  )
}
