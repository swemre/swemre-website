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

// The Projects results column: the summary bar (sentence, sort, Grid / List), the activity
// strip, the cards or rows, the "N more hidden by filters" bar and the no-matches state.
import type {ReactNode} from 'react'
import type {ProjectSummary} from '../../contract/view.ts'
import {Anchor, Button, ProjectCard, StatusBadge} from '../../design/index.tsx'
import {SortButton, ViewToggle} from '../home/kit/list.tsx'
import {useV} from '../home/kit/vp.ts'
import {
  command,
  explain,
  PROJ_SORTS,
  qualifier,
  type Active,
  type ProjFilters,
  type ProjSort,
  type ProjView,
} from './model.ts'

export interface Activity {
  weeks: number[]
  latest?: {at: string; project: string; message: string}
}

export function SummaryBar({
  shown,
  total,
  f,
  sort,
  view,
  onSort,
  onView,
}: {
  shown: number
  total: number
  f: ProjFilters
  sort: ProjSort
  view: ProjView
  onSort(s: ProjSort): void
  onView(v: ProjView): void
}) {
  const v = useV()
  const m = v(true, false, false)
  const q = qualifier(f)
  const sentence = (
    <span className="a2-small" style={{color: 'var(--a2-text)'}} role="status">
      Showing{' '}
      <span className="a2-hi" style={{fontWeight: 600}}>
        {shown}
      </span>{' '}
      of {total} projects{q && ` ${q}`}
    </span>
  )
  const toggle = (
    <ViewToggle
      label="View"
      value={view}
      onChange={onView}
      options={[
        {value: 'grid', label: 'Grid', icon: 'grid'},
        {value: 'list', label: 'List', icon: 'list'},
      ]}
    />
  )
  const sorter = (
    <SortButton value={sort} options={PROJ_SORTS} onChange={onSort} />
  )
  const line = {borderBottom: '1px solid var(--a2-line)'}
  if (m)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingBottom: 16,
          ...line,
        }}
      >
        {sentence}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {sorter}
          {toggle}
        </div>
      </div>
    )
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        paddingBottom: 24,
        ...line,
      }}
    >
      {sentence}
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        {sorter}
        <span style={{color: 'var(--a2-text-dim)'}}>/</span>
        {toggle}
      </div>
    </div>
  )
}

const ago = (iso: string) => {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return d === 1 ? 'yesterday' : `${d} days ago`
}

/** "Activity · last 26 weeks": weekly bars (the busiest glow) and the latest event. */
export function ActivityStrip({data}: {data: Activity}) {
  const v = useV()
  const weeks = data.weeks.slice(-v(14, 26, 26))
  const max = Math.max(...weeks, 1)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px 24px',
        padding: '24px 0',
        borderBottom: '1px solid var(--a2-line)',
      }}
    >
      <span className="a2-micro">Activity · last 26 weeks</span>
      <span
        aria-hidden="true"
        style={{display: 'flex', alignItems: 'flex-end', gap: 4, height: 32}}
      >
        {weeks.map((w, i) => {
          const h = Math.max(4, Math.round((w / max) * 28))
          const alpha = Math.min(0.89, 0.1433 + h / 37.5).toFixed(2)
          return (
            <span
              key={i}
              style={{
                width: 8,
                height: h,
                borderRadius: 2,
                background: `rgb(var(--a2-hue-blue-rgb) / ${alpha})`,
                boxShadow:
                  w === max
                    ? '0 0 10px rgb(var(--a2-hue-blue-rgb) / calc(0.5 * var(--a2-glow-k)))'
                    : undefined,
              }}
            />
          )
        })}
      </span>
      {data.latest && (
        <span style={{marginLeft: 'auto', textAlign: 'right'}}>
          <span className="a2-mono" style={{display: 'block'}}>
            {ago(data.latest.at)}
          </span>
          <span className="a2-mono" style={{color: 'var(--a2-text)'}}>
            {data.latest.project}: {data.latest.message}
          </span>
        </span>
      )}
    </div>
  )
}

export function ProjectGrid({
  items,
  view,
}: {
  items: ProjectSummary[]
  view: ProjView
}) {
  const v = useV()
  if (view === 'list')
    return (
      <div className="a2-rows">
        {items.map((p, i) => (
          <ProjectCard key={p.slug} project={p} variant="list" index={i} />
        ))}
      </div>
    )
  return (
    <div
      className="a2-cols"
      style={{
        gridTemplateColumns: `repeat(${v(1, 2, 2)},minmax(0,1fr))`,
        columnGap: v(16, 24, 32),
        rowGap: v(16, 24, 32),
      }}
    >
      {items.map((p, i) => (
        <ProjectCard key={p.slug} project={p} variant="grid" index={i} />
      ))}
    </div>
  )
}

/** "3 more hidden by filters: a, b, c" + Clear filters. */
export function HiddenBar({
  hidden,
  onClear,
}: {
  hidden: ProjectSummary[]
  onClear(): void
}) {
  const v = useV()
  const m = v(true, false, false)
  return (
    <>
      <div className="a2-fhr" style={{marginTop: v(48, 48, 64)}} />
      <div
        style={
          m
            ? {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 16,
                paddingTop: 24,
              }
            : {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                paddingTop: v(24, 24, 32),
              }
        }
      >
        <span className="a2-small" style={{color: 'var(--a2-text)'}}>
          <span className="a2-hi" style={{fontWeight: 600}}>
            {hidden.length} more
          </span>{' '}
          hidden by filters:{' '}
          <span className="a2-mono">{hidden.map(p => p.slug).join(', ')}</span>
        </span>
        <Button
          label="Clear filters"
          kind="secondary"
          iconLeft="x"
          block={m}
          onClick={onClear}
        />
      </div>
    </>
  )
}

function Corner({at}: {at: 'tl' | 'tr' | 'bl' | 'br'}) {
  const [y, x] = [
    at[0] === 't' ? 'top' : 'bottom',
    at[1] === 'l' ? 'left' : 'right',
  ]
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
  return (
    <span
      className="p2-corner"
      style={{
        [x]: 16,
        [y]: 16,
        [`border${cap(x)}Width`]: 1.5,
        [`border${cap(y)}Width`]: 1.5,
      }}
    />
  )
}

/** No matches: the "0" card with the generated explanation, then the list without the last filter. */
export function NoMatches({
  f,
  without,
  onClear,
  onRemove,
}: {
  f: ProjFilters
  without: ProjectSummary[]
  onClear(): void
  onRemove(a: Active): void
}) {
  const v = useV()
  const m = v(true, false, false)
  const {last, label, copy} = explain(f, without)
  const art: ReactNode = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        flex: 'none',
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 160 200"
        width={m ? 112 : 160}
        height={m ? 140 : 200}
      >
        <text
          x="80"
          y="170"
          textAnchor="middle"
          fontWeight="800"
          fontSize="210"
          fill="none"
          strokeWidth="1.5"
          opacity=".9"
          style={{stroke: 'var(--a2-soft)', fontFamily: 'Inter, sans-serif'}}
        >
          0
        </text>
        <rect
          x="68"
          y="88"
          width="24"
          height="24"
          fill="none"
          strokeWidth="1.5"
          style={{stroke: 'var(--a2-soft)'}}
        />
      </svg>
      <span className="a2-micro" style={{color: 'var(--a2-pale)'}}>
        No matches
      </span>
    </div>
  )
  return (
    <>
      <div
        className="a2-card"
        role="status"
        style={{
          boxShadow:
            'var(--a2-shadow-card),0 0 120px -20px rgb(var(--a2-hue-blue-rgb) / calc(0.12 * var(--a2-glow-k)))',
          background: 'var(--a2-note-grad)',
          borderColor: 'var(--a2-line-blue-3)',
        }}
      >
        <Corner at="tl" />
        <Corner at="tr" />
        <Corner at="bl" />
        <Corner at="br" />
        <div
          style={
            m
              ? {display: 'flex', flexDirection: 'column', gap: 32}
              : {display: 'flex', alignItems: 'center', gap: v(32, 48, 64)}
          }
        >
          {art}
          <div>
            <h3 className="a2-h3" style={{textWrap: 'balance'}}>
              No projects match these filters
            </h3>
            <p className="a2-body" style={{marginTop: 8, maxWidth: 520}}>
              {copy}
            </p>
            <p
              className="a2-mono"
              style={{
                marginTop: 24,
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
              }}
            >
              <span className="a2-mint">$</span> {command(f)}{' '}
              <span className="a2-lo" style={{marginLeft: 16}}>
                0 results
              </span>
            </p>
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginTop: v(24, 24, 32),
                ...(m
                  ? {flexDirection: 'column'}
                  : {alignItems: 'center', flexWrap: 'wrap'}),
              }}
            >
              <Button label="Clear filters" iconLeft="x" onClick={onClear} />
              <Button
                label={`Remove ${label}`}
                kind="secondary"
                onClick={() => onRemove(last)}
              />
            </div>
          </div>
        </div>
      </div>
      {without.length > 0 && (
        <div style={{marginTop: v(48, 48, 64)}}>
          <span className="a2-micro" style={{color: 'var(--a2-text)'}}>
            Without the {label} filter
          </span>
          <div
            style={{
              marginTop: 16,
              borderTop: '1px solid var(--a2-line-blue-4)',
            }}
          >
            {without.map(p => (
              <Anchor
                key={p.slug}
                href={p.href}
                style={{
                  display: 'grid',
                  gridTemplateColumns: v(
                    '1fr',
                    '200px minmax(0,1fr) auto',
                    '280px minmax(0,1fr) auto',
                  ),
                  gap: v(8, 32, 32),
                  padding: '24px 0',
                  borderBottom: '1px solid var(--a2-line)',
                }}
              >
                <span className="a2-mono a2-hi" style={{fontWeight: 600}}>
                  {p.slug}
                </span>
                <p className="a2-small">{p.summary}</p>
                <span>
                  <StatusBadge p={p} hue={p.hue} />
                </span>
              </Anchor>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
