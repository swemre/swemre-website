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

// The Projects filter controls (spec 2.6): the search box ("/" focuses it), the result meter,
// active filter chips, Year, Stack (match any), the Live and Source switches and Sort by.
// Desktop and 4K show them in the aside; mobile and tablet behind the "Filters · N" button.
import {useEffect, useRef, type ReactNode, type RefObject} from 'react'
import {Badge, Checkbox, Field, Icon, TextLink} from '../../design/index.tsx'
import {
  activeLabel,
  PROJ_SORTS,
  type Active,
  type ProjFilters,
  type ProjSort,
} from './model.ts'
import {t} from '../../i18n/index.ts'

export interface FilterActions {
  setQ(q: string): void
  setYear(year?: number): void
  toggleStack(slug: string): void
  setLive(on: boolean): void
  setSource(on: boolean): void
  setSort(s: ProjSort): void
  remove(a: Active): void
  clear(): void
}

/** The search box; "/" anywhere outside a field focuses it. */
export function SearchBox({
  value,
  onChange,
  kbd,
  inputRef,
}: {
  value: string
  onChange(q: string): void
  kbd?: boolean
  inputRef: RefObject<HTMLInputElement | null>
}) {
  // The box is uncontrolled while typing; a change that did not come from it (a removed chip,
  // Clear filters, back) is written into it.
  useEffect(() => {
    const el = inputRef.current
    if (el && document.activeElement !== el && el.value.trim() !== value)
      el.value = value
  }, [value, inputRef])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (
        t &&
        (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      )
        return
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inputRef])
  return (
    <label className="a2-field">
      <span className="a2-label">
        <span className="a2-sr">{t('projects.search')}</span>
      </span>
      <span className="a2-ctl">
        <Icon name="search" style={{color: 'var(--a2-text-lo)'}} />
        <input
          ref={inputRef}
          type="search"
          className="pf-in"
          name="q"
          autoComplete="off"
          spellCheck={false}
          defaultValue={value}
          placeholder={t('projects.search.placeholder')}
          aria-keyshortcuts="/"
          onChange={e => onChange(e.target.value.trim())}
        />
        {kbd && (
          <span
            className="a2-kbd"
            style={{marginLeft: 'auto'}}
            aria-hidden="true"
          >
            /
          </span>
        )}
      </span>
    </label>
  )
}

/** Removable chips for the active filters. */
export function ActiveChips({
  f,
  onRemove,
}: {
  f: ProjFilters
  onRemove(a: Active): void
}) {
  return (
    <>
      {f.active.map(a => (
        <button
          key={`${a.kind}-${'value' in a ? a.value : ''}`}
          type="button"
          className="a2-chip is-active"
          aria-label={t('projects.chip.remove', {label: activeLabel(a)})}
          onClick={() => onRemove(a)}
        >
          {activeLabel(a)}
          <Icon name="x" size={14} />
        </button>
      ))}
    </>
  )
}

const Hr = () => <div className="a2-hr" style={{margin: '32px 0'}} />

function Group({
  label,
  extra,
  children,
}: {
  label: string
  extra?: ReactNode
  children: ReactNode
}) {
  return (
    <>
      {extra ? (
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span className="a2-micro">{label}</span>
          {extra}
        </div>
      ) : (
        <span className="a2-micro">{label}</span>
      )}
      <div style={{marginTop: 16}}>{children}</div>
    </>
  )
}

function Switch({
  label,
  count,
  hint,
  on,
  onChange,
}: {
  label: string
  count: number
  hint: string
  on: boolean
  onChange(on: boolean): void
}) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <div style={{flex: 1}}>
        <div className="a2-small" style={{color: 'var(--a2-text)'}}>
          {label} <span className="a2-mono">{count}</span>
        </div>
        <div className="a2-cap">{hint}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={on ? 'p2-switch is-on' : 'p2-switch'}
        onClick={() => onChange(!on)}
      />
    </div>
  )
}

/** The facet groups: Year, Stack, Status and Sort by (shared by the aside and the drawer). */
export function Facets({
  f,
  years,
  stacks,
  total,
  liveCount,
  sourceCount,
  sort,
  act,
}: {
  f: ProjFilters
  years: {year: number; count: number}[]
  stacks: {slug: string; name: string; count: number}[]
  total: number
  liveCount: number
  sourceCount: number
  sort: ProjSort
  act: FilterActions
}) {
  return (
    <>
      <Group label={t('projects.year')}>
        <div
          className="p2-seg is-fit"
          role="group"
          aria-label={t('projects.year')}
        >
          <button
            type="button"
            className={f.year === undefined ? 'a2-chip is-active' : 'a2-chip'}
            aria-pressed={f.year === undefined}
            onClick={() => act.setYear(undefined)}
          >
            {t('projects.year.all')}
            <span className="a2-count">{total}</span>
          </button>
          {years.map(y => (
            <button
              key={y.year}
              type="button"
              className={f.year === y.year ? 'a2-chip is-active' : 'a2-chip'}
              aria-pressed={f.year === y.year}
              onClick={() =>
                act.setYear(f.year === y.year ? undefined : y.year)
              }
            >
              {y.year}
              <span className="a2-count">{y.count}</span>
            </button>
          ))}
        </div>
      </Group>
      <Hr />
      <Group
        label={t('projects.stack')}
        extra={<span className="a2-cap">{t('projects.stack.any')}</span>}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {stacks.map(s => {
            const on = f.stack.includes(s.slug)
            return (
              <div
                key={s.slug}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Checkbox
                  noSlot
                  name="stack"
                  checked={on}
                  onChange={() => act.toggleStack(s.slug)}
                  label={on ? <span className="a2-hi">{s.name}</span> : s.name}
                />
                <span className="a2-mono">{s.count}</span>
              </div>
            )
          })}
        </div>
      </Group>
      <Hr />
      <Group label={t('projects.status')}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <Switch
            label={t('projects.live')}
            count={liveCount}
            hint={t('projects.live.hint')}
            on={f.live}
            onChange={act.setLive}
          />
          <Switch
            label={t('projects.source')}
            count={sourceCount}
            hint={t('projects.source.hint')}
            on={f.source}
            onChange={act.setSource}
          />
        </div>
      </Group>
      <Hr />
      <Group label={t('projects.sortBy')}>
        {/* The board's sort field has gap 0 and no message slot; Field always draws
            both (8 + 8 + 20), so pull them back until Field takes noSlot. */}
        <div style={{marginTop: -8, marginBottom: -28}}>
          <Field
            label={<span className="a2-sr">{t('projects.sortBy')}</span>}
            name="sort"
            kind="select"
            value={sort}
            onChange={v => act.setSort(v as ProjSort)}
            options={PROJ_SORTS}
          />
        </div>
      </Group>
    </>
  )
}

/** Desktop and 4K: the whole filter aside. */
export function FilterAside(props: {
  f: ProjFilters
  shown: number
  total: number
  years: {year: number; count: number}[]
  stacks: {slug: string; name: string; count: number}[]
  liveCount: number
  sourceCount: number
  sort: ProjSort
  act: FilterActions
}) {
  const {f, shown, total, act} = props
  const input = useRef<HTMLInputElement>(null)
  const n = f.active.length
  return (
    <aside aria-label={t('projects.filters')}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2 className="a2-h4">{t('projects.filters')}</h2>
        {n > 0 && (
          <Badge label={t('projects.filters.active', {count: n})} hue="blue" />
        )}
      </div>
      <div style={{marginTop: 16}}>
        <SearchBox value={f.q} onChange={act.setQ} kbd inputRef={input} />
      </div>
      <div
        style={{display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 24}}
      >
        <span className="a2-h2">{shown}</span>
        <span className="a2-cap">{t('projects.ofTotal', {total})}</span>
        <span className="a2-mono" style={{marginLeft: 'auto'}}>
          {t('projects.filters.count', {count: n})}
        </span>
      </div>
      <div className="p2-bar" style={{marginTop: 8}} aria-hidden="true">
        <div
          style={{width: `${total ? Math.round((shown / total) * 100) : 0}%`}}
        />
      </div>
      {n > 0 && (
        <>
          <Hr />
          <span className="a2-micro">{t('projects.activeFilters')}</span>
          <div style={{marginTop: 16}}>
            <div className="a2-chips" style={{gap: 8}}>
              <ActiveChips f={f} onRemove={act.remove} />
            </div>
          </div>
          <div style={{marginTop: 16}}>
            <TextLink
              label={t('projects.clear')}
              icon="x"
              onClick={act.clear}
            />
          </div>
        </>
      )}
      <Hr />
      <Facets {...props} />
    </aside>
  )
}
