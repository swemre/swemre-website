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

// Pieces shared by the list pages (articles, topic, projects, search): the list section with its
// end rail, the state layout (number left, panel right), the covers/text toggle and the footer bar.
import type {ReactNode} from 'react'
import {Rail} from '../../../design/index.tsx'
import type {Hue} from '../../../contract/view.ts'
import {SectionBg} from './SectionBg.tsx'
import {Button, Icon, TextLink, type IconName} from './ui.ts'
import {useCompact, useV} from './vp.ts'

/**
 * The section under a page header that holds the list. ready: glow at 84% 20% with dots; states
 * (loading, empty, error): glow at 80% 30%. The rail ends in the current node near the bottom.
 */
export function ListSection({
  label,
  hue = 'blue',
  ready,
  texture = 'dots',
  at = [84, 20],
  children,
}: {
  /** The rail's commit label ("9f3e2a1", or the state name). */
  label: string
  hue?: Hue
  ready?: boolean
  /** Ready ground: texture and glow centre (dots at 84% 20% on Articles). */
  texture?: 'dots' | 'scan'
  at?: [number, number]
  children: ReactNode
}) {
  const v = useV()
  return (
    <section className="a2-sec" data-cut style={{paddingTop: 0}}>
      {ready ? (
        <SectionBg hue={hue} at={at} texture={texture} alpha={0.12} />
      ) : (
        <SectionBg hue={hue} at={[80, 30]} alpha={0.12} />
      )}
      <Rail
        from={hue}
        bottom={v(48, 64, 96, 128)}
        nodes={[{bottom: v(43, 59, 90, 122), current: true}]}
        label={{text: label, bottom: v(0, 0, 0, 32)}}
      />
      <div className="a2-c">{children}</div>
    </section>
  )
}

/** Desktop and 4K: the state number in columns 1-3 and the panel in 4-12; stacked otherwise. */
export function StateLayout({
  number,
  children,
}: {
  number: ReactNode
  children: ReactNode
}) {
  if (useCompact())
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
        {number}
        <div>{children}</div>
      </div>
    )
  return (
    <div className="a2-g12" style={{alignItems: 'start'}}>
      <div style={{gridColumn: '1 / span 3', minWidth: 0}}>{number}</div>
      <div style={{gridColumn: '4 / span 9', minWidth: 0}}>
        <div>{children}</div>
      </div>
    </div>
  )
}

/** "Related topics" / "Other topics": a micro label and chips under a state panel. */
export function ChipRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  const v = useV()
  const m = v(true, false, false)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: m ? 'column' : undefined,
        alignItems: m ? 'flex-start' : 'center',
        gap: 16,
        marginTop: v(48, 48, 64),
      }}
    >
      <span className="a2-micro">{label}</span>
      <div className="a2-chips" style={{gap: 8}}>
        {children}
      </div>
    </div>
  )
}

/** The covers / text segmented toggle (role=group); counts show "–" while loading. */
export function ViewToggle<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string
  value: T
  options: {value: T; label: string; icon: IconName; count?: number}[]
  onChange(v: T): void
  disabled?: boolean
}) {
  return (
    <div className="p2-seg" role="group" aria-label={label}>
      {options.map(o =>
        disabled ? (
          <span
            key={o.value}
            className={o.value === value ? 'a2-chip is-active' : 'a2-chip'}
          >
            <Icon name={o.icon} size={14} />
            {o.label}
            <span className="a2-count">–</span>
          </span>
        ) : (
          <button
            key={o.value}
            type="button"
            className={o.value === value ? 'a2-chip is-active' : 'a2-chip'}
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
          >
            <Icon name={o.icon} size={14} />
            {o.label}
            {o.count !== undefined && (
              <span className="a2-count">{o.count}</span>
            )}
          </button>
        ),
      )}
    </div>
  )
}

/** "Newest first" style sort button: cycles through the options. */
export function SortButton<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: {value: T; label: string}[]
  onChange(v: T): void
}) {
  const i = Math.max(
    0,
    options.findIndex(o => o.value === value),
  )
  const next = options[(i + 1) % options.length]
  return (
    <button
      type="button"
      className="a2-mono"
      aria-label={`Sort: ${options[i].label}. Change to ${next.label}`}
      onClick={() => onChange(next.value)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 32,
        whiteSpace: 'nowrap',
        color: 'var(--a2-text)',
      }}
    >
      {options[i].label}
      <Icon
        name="chevron-down"
        size={14}
        style={{color: 'var(--a2-text-lo)'}}
      />
    </button>
  )
}

/** The bar under a paged list: "Showing 9 of 12 articles / newest first", Load more, RSS. */
export function MoreBar({
  status,
  more,
  onMore,
  rss,
}: {
  status: ReactNode
  /** How many the next page adds; 0 hides the button. */
  more: number
  onMore(): void
  rss?: string
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
                gap: 16,
                paddingTop: 24,
              }
            : {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 32,
              }
        }
      >
        <span className="a2-mono" role="status">
          {status}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: m ? 'stretch' : 'center',
            flexDirection: m ? 'column' : undefined,
            gap: 16,
          }}
        >
          {more > 0 && (
            <Button
              label={`Load ${more} more`}
              kind="secondary"
              iconLeft="refresh"
              block={m}
              onClick={onMore}
            />
          )}
          {rss && <TextLink label="RSS feed" href={rss} arrow="rss" />}
        </div>
      </div>
    </>
  )
}

/** A dim slash between mono parts. */
export function Slash() {
  return <span style={{color: 'var(--a2-text-dim)'}}>/</span>
}
