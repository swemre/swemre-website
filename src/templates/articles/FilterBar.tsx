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

// The Articles filter row: topic chips (first 8, 6 on tablet, 4 on mobile, + "More topics N"),
// the count line and the sort button. Loading shows chip skeletons; error shows "All –" and the
// last successful load.
import type {TermRef} from '../../contract/view.ts'
import {Chip, Icon, Skel} from '../../design/index.tsx'
import {Slash, SortButton} from '../home/kit/list.tsx'
import {formatStamp} from '../home/kit/url.ts'
import {useCompact, useV} from '../home/kit/vp.ts'
import {SORTS, type FilterState, type Sort} from './model.ts'
import {t} from '../../i18n/index.ts'
import {tRich} from '../../i18n/rich.tsx'

const SKELETON = [56, 80, 116, 92, 104, 128, 96, 72]

export function FilterBar({
  status,
  topics,
  total,
  count,
  filter,
  sort,
  lastLoad,
  onTopic,
  onSaved,
  onMore,
  onSort,
}: {
  status: 'loading' | 'ready' | 'empty' | 'error'
  topics: TermRef[]
  total: number
  count: number
  filter: FilterState
  sort: Sort
  lastLoad?: Date
  onTopic(slug: string | undefined): void
  onSaved(on: boolean): void
  onMore(on: boolean): void
  onSort(s: Sort): void
}) {
  const v = useV()
  const cmp = useCompact()
  const row = (
    chips: React.ReactNode,
    side: React.ReactNode,
    center?: boolean,
  ) =>
    cmp ? (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {chips}
        {side}
      </div>
    ) : (
      <div
        style={{
          display: 'flex',
          alignItems: center ? 'center' : 'flex-start',
          justifyContent: 'space-between',
          gap: 32,
        }}
      >
        {chips}
        {side}
      </div>
    )
  const side = (children: React.ReactNode) => (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 32,
      }}
    >
      {children}
    </div>
  )

  if (status === 'loading')
    return row(
      <div className="a2-chips" aria-hidden="true">
        {SKELETON.map((w, i) => (
          <Skel key={i} w={w} h={32} />
        ))}
      </div>,
      side(
        <span
          className="a2-mono"
          style={{display: 'inline-flex', alignItems: 'center', gap: 8}}
        >
          <Icon name="spinner" size={14} className="a2-spin" />
          {t('articles.loading.dots')}
        </span>,
      ),
    )
  if (status === 'error')
    return row(
      <div className="a2-chips" style={{gap: 8}}>
        <span className="a2-chip is-active">
          {t('projects.year.all')}
          <span className="a2-count">–</span>
        </span>
      </div>,
      lastLoad && (
        <span className="a2-mono">
          {t('articles.lastLoad', {stamp: formatStamp(lastLoad)})}
        </span>
      ),
      true,
    )

  const limit = v(4, 6, 8)
  const shown = filter.more ? topics : topics.slice(0, limit)
  const hidden = topics.length - shown.length
  const activeShown = shown.some(t => t.slug === filter.topic)
  const activeTerm = topics.find(t => t.slug === filter.topic)
  const all = !filter.topic && !filter.saved

  const chips = (
    <div className="a2-chips" style={{gap: 8}}>
      <Chip
        label={t('projects.year.all')}
        count={total}
        active={all}
        onClick={() => onTopic(undefined)}
      />
      {shown.map(t => (
        <Chip
          key={t.slug}
          label={t.name}
          count={t.count}
          active={t.slug === filter.topic}
          onClick={() => onTopic(t.slug === filter.topic ? undefined : t.slug)}
        />
      ))}
      {(hidden > 0 || filter.more) && topics.length > limit && (
        <button
          type="button"
          className="a2-chip"
          aria-expanded={filter.more}
          onClick={() => onMore(!filter.more)}
        >
          {filter.more ? t('articles.fewerTopics') : t('articles.moreTopics')}
          {!filter.more && <span className="a2-count">{hidden}</span>}
          <Icon
            name={filter.more ? 'chevron-up' : 'chevron-down'}
            size={14}
            style={{color: 'var(--a2-text-lo)'}}
          />
        </button>
      )}
      {filter.topic && !activeShown && (
        <button
          type="button"
          className="a2-chip is-active"
          aria-label={t('projects.chip.remove', {label: filter.topicName})}
          onClick={() => onTopic(undefined)}
        >
          {filter.topicName}
          <span className="a2-count">{activeTerm?.count ?? count}</span>
          <Icon name="x" size={14} />
        </button>
      )}
      {filter.saved && (
        <button
          type="button"
          className="a2-chip is-active"
          aria-label={t('articles.saved.remove')}
          onClick={() => onSaved(false)}
        >
          <Icon name="bookmark" size={14} />
          {t('articles.saved')}
          <span className="a2-count">{count}</span>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  )

  return row(
    chips,
    side(
      <>
        <span className="a2-cap">
          {filter.topic ? (
            tRich(
              'articles.countIn',
              {name: filter.topicName},
              {
                count: (
                  <span className="a2-hi" style={{fontWeight: 600}}>
                    {t('articles.count', {count})}
                  </span>
                ),
              },
            )
          ) : (
            <span className="a2-hi" style={{fontWeight: 600}}>
              {filter.saved
                ? t('articles.count.saved', {count})
                : t('articles.count', {count})}
            </span>
          )}
        </span>
        {count > 0 && (
          <>
            <Slash />
            <SortButton value={sort} options={SORTS} onChange={onSort} />
          </>
        )}
      </>,
    ),
  )
}
