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

// /projects (boards Projects = ?stack=react,typescript, Projects-list, Projects-empty =
// ?stack=java&live=1). All state is in the URL: q, year, stack, live, source, sort, view. A
// changed filter key moves to the end of the query, so the last one added is the "last
// restrictive filter" the empty state names.
import {useCallback, useRef, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import type {TemplateProps} from '../../contract/templates.ts'
import {useActivity, useProjects} from '../../data/hooks.ts'
import {Button, Icon, Skeleton} from '../../design/index.tsx'
import {ListSection, StateLayout} from '../home/kit/list.tsx'
import {ListHeader} from '../home/kit/ListHeader.tsx'
import {StateNumber, StatePanel} from '../home/kit/StatePanel.tsx'
import {useCompact, useV} from '../home/kit/vp.ts'
import {
  ActiveChips,
  Facets,
  FilterAside,
  SearchBox,
  type FilterActions,
} from './Filters.tsx'
import {
  applyFilters,
  parseFilters,
  sortProjects,
  stackFacets,
  yearFacets,
  type ProjSort,
  type ProjView,
} from './model.ts'
import {
  ActivityStrip,
  HiddenBar,
  NoMatches,
  ProjectGrid,
  SummaryBar,
} from './Results.tsx'
import {t} from '../../i18n/index.ts'

const FILTER_KEYS = ['q', 'year', 'stack', 'live', 'source']

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- same props as every template
export function ProjectsTemplate(_props: TemplateProps) {
  const state = useProjects()
  const activity = useActivity()
  const [params, setParams] = useSearchParams()
  const all = state.status === 'ready' ? state.data : []
  const stacks = stackFacets(all)
  const f = parseFilters(params, new Map(stacks.map(s => [s.slug, s.name])))
  const sort: ProjSort =
    params.get('sort') === 'newest' || params.get('sort') === 'name'
      ? (params.get('sort') as ProjSort)
      : 'updated'
  const view: ProjView = params.get('view') === 'list' ? 'list' : 'grid'

  /** Sets keys; a filter key that changes moves to the end. undefined removes. */
  const patch = useCallback(
    (p: Record<string, string | undefined>, replace?: boolean) =>
      setParams(
        prev => {
          const next = new URLSearchParams(prev)
          for (const [k, val] of Object.entries(p)) {
            next.delete(k)
            if (val) next.set(k, val)
          }
          return next
        },
        {replace, preventScrollReset: true},
      ),
    [setParams],
  )
  const act: FilterActions = {
    setQ: q => patch({q: q || undefined}, true),
    setYear: y => patch({year: y ? String(y) : undefined}),
    toggleStack: slug => {
      const next = f.stack.includes(slug)
        ? f.stack.filter(s => s !== slug)
        : [...f.stack, slug]
      patch({stack: next.join(',') || undefined})
    },
    setLive: on => patch({live: on ? '1' : undefined}),
    setSource: on => patch({source: on ? '1' : undefined}),
    setSort: s => patch({sort: s === 'updated' ? undefined : s}),
    remove: a => {
      if (a.kind === 'stack') act.toggleStack(a.value)
      else patch({[a.kind]: undefined})
    },
    clear: () =>
      patch(Object.fromEntries(FILTER_KEYS.map(k => [k, undefined]))),
  }

  const header = (
    <ListHeader
      eyebrow={t('mega.projects.eyebrow')}
      title={t('nav.projects')}
      lead={t('projects.lead')}
      hue="peri"
      commit="5ca1ab1"
    />
  )
  if (
    state.status === 'loading' ||
    state.status === 'error' ||
    state.status === 'empty'
  )
    return (
      <>
        {header}
        <ListSection label={state.status} hue="peri">
          {state.status === 'loading' ? (
            <>
              <span className="a2-sr" role="status">
                {t('projects.loading')}
              </span>
              <LoadingGrid />
            </>
          ) : state.status === 'error' ? (
            <StateLayout
              number={
                <StateNumber
                  prefix="E"
                  digits="503"
                  error
                  line={t('state.loadError')}
                />
              }
            >
              <StatePanel
                icon="cloud-off"
                title={t('projects.error.title')}
                copy={t('projects.error.copy')}
                command="GET /api/public/v2/channels/swemre/projects"
                result="503 Service Unavailable"
                actions={
                  <>
                    <Button
                      label={t('form.retry')}
                      iconLeft="refresh"
                      onClick={state.retry}
                    />
                    <Button
                      label={t('state.browseArticles')}
                      kind="secondary"
                      iconLeft="file-text"
                      href="/articles"
                    />
                  </>
                }
              />
            </StateLayout>
          ) : (
            <StateLayout
              number={
                <StateNumber
                  prefix="0"
                  digits="0"
                  hue="peri"
                  line={t('projects.count', {count: 0})}
                />
              }
            >
              <StatePanel
                hue="peri"
                icon="folder"
                title={t('projects.empty.title')}
                copy={t('projects.empty.copy')}
                command="ls ~/projects --public"
                result={t('qs.results', {count: 0})}
              />
            </StateLayout>
          )}
        </ListSection>
      </>
    )

  const shownList = sortProjects(applyFilters(all, f), sort)
  const hidden = all.filter(p => !shownList.includes(p))
  const last = f.active[f.active.length - 1]
  const without = last ? sortProjects(applyFilters(all, f, last), sort) : []
  const facetProps = {
    f,
    years: yearFacets(all),
    stacks,
    total: all.length,
    liveCount: all.filter(p => p.live).length,
    sourceCount: all.filter(p => p.sourceAvailable).length,
    sort,
    act,
  }
  const results = (
    <>
      <SummaryBar
        shown={shownList.length}
        total={all.length}
        f={f}
        sort={sort}
        view={view}
        onSort={act.setSort}
        onView={nv => patch({view: nv === 'list' ? 'list' : undefined})}
      />
      {shownList.length > 0 &&
        activity.status === 'ready' &&
        activity.data.weeks.length > 0 && (
          <ActivityStrip data={activity.data} />
        )}
      <div style={{marginTop: 32}}>
        {shownList.length > 0 ? (
          <ProjectGrid items={shownList} view={view} />
        ) : (
          <NoMatches
            f={f}
            without={without}
            onClear={act.clear}
            onRemove={act.remove}
          />
        )}
      </div>
      {shownList.length > 0 && hidden.length > 0 && f.active.length > 0 && (
        <HiddenBar hidden={hidden} onClear={act.clear} />
      )}
    </>
  )
  return (
    <>
      {header}
      <ListSection
        label="b1ade00"
        hue="peri"
        ready
        texture="scan"
        at={[80, 20]}
      >
        <Layout
          aside={<FilterAside {...facetProps} shown={shownList.length} />}
          compactControls={<CompactControls facetProps={facetProps} />}
          results={results}
        />
      </ListSection>
    </>
  )
}

function Layout({
  aside,
  compactControls,
  results,
}: {
  aside: React.ReactNode
  compactControls: React.ReactNode
  results: React.ReactNode
}) {
  const v = useV()
  if (useCompact())
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: v(48, 64, 64)}}
      >
        {compactControls}
        <div>{results}</div>
      </div>
    )
  return (
    <div className="a2-g12">
      <div style={{gridColumn: '1 / span 3'}}>{aside}</div>
      <div style={{gridColumn: '4 / span 9', paddingLeft: 32, minWidth: 0}}>
        {results}
      </div>
    </div>
  )
}

/** Mobile and tablet: search, "Filters · N" (opens the facets) and the active chips. */
function CompactControls({
  facetProps,
}: {
  facetProps: Parameters<typeof Facets>[0]
}) {
  const [open, setOpen] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const {f, act} = facetProps
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <SearchBox value={f.q} onChange={act.setQ} inputRef={input} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className="a2-btn is-secondary"
          aria-expanded={open}
          aria-controls="project-facets"
          onClick={() => setOpen(o => !o)}
        >
          <Icon name="filter" />
          <span>
            {t('projects.filters')}
            {f.active.length > 0 && ` · ${f.active.length}`}
          </span>
        </button>
        <ActiveChips f={f} onRemove={act.remove} />
      </div>
      {open && (
        <div id="project-facets" className="a2-card">
          <Facets {...facetProps} />
        </div>
      )}
    </div>
  )
}

function LoadingGrid() {
  const v = useV()
  return (
    <div
      className="a2-cols"
      aria-hidden="true"
      style={{
        gridTemplateColumns: `repeat(${v(1, 2, 3)},minmax(0,1fr))`,
        columnGap: v(16, 24, 32),
        rowGap: v(16, 24, 32),
      }}
    >
      <Skeleton pattern="project" count={6} />
    </div>
  )
}
