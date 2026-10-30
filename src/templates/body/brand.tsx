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

// The swemre brand components (SWEPress Settings → Components, `swemre/<type>`), in the markup of
// the SwePress project board: the architecture diagram, the project pages, the repositories, the
// test coverage, the alpha steps, the call to action and the prefilled form summary.
import {Fragment, type CSSProperties, type ReactNode} from 'react'
import type {ArchitectureItem, Block, Hue} from '../../contract/blocks.ts'
import {Icon, useViewport, type IconName} from '../../design/index.tsx'
import {t} from '../../i18n/index.ts'
import {hueVar, rgb} from '../parts/vp.ts'
import {SmartLink} from './blocks.tsx'

type Of<T extends Block['type']> = Extract<Block, {type: T}>['props']

const HUES: Hue[] = ['sky', 'lilac', 'aqua', 'blue', 'peri', 'mist']

const box = (hue: Hue | undefined, radius = 10): CSSProperties =>
  hue
    ? {
        padding: 16,
        borderRadius: radius,
        border: `1px solid ${rgb(hue, 0.3)}`,
        background: rgb(hue, 0.06),
      }
    : {
        padding: 16,
        borderRadius: radius,
        border: '1px solid var(--a2-line-2)',
        background: 'var(--a2-card-flat)',
      }

const mono12: CSSProperties = {fontSize: 12}
const h4Small: CSSProperties = {fontSize: 16, lineHeight: '24px'}

function Badge({children, hue}: {children: ReactNode; hue?: Hue}) {
  return (
    <span
      className="a2-badge"
      style={
        hue ? {borderColor: rgb(hue, 0.45), color: hueVar(hue)} : undefined
      }
    >
      {children}
    </span>
  )
}

function Chips({chips}: {chips?: string[]}) {
  if (!chips?.length) return null
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16}}>
      {chips.map(c => (
        <span key={c} className="a2-badge">
          {c}
        </span>
      ))}
    </div>
  )
}

function ArrowLink({label, href}: {label: string; href: string}) {
  return (
    <SmartLink className="a2-link" href={href}>
      {label}
      <Icon name="arrow-right" size={14} />
    </SmartLink>
  )
}

/** The architecture link, drawn beside the section header. */
export function ArchitectureLink({p}: {p: Of<'architecture'>}) {
  return p.link ? <ArrowLink label={p.link.label} href={p.link.href} /> : null
}

export function Architecture({p, hue}: {p: Of<'architecture'>; hue: Hue}) {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const last = p.flow.length - 1
  const columns = p.flow
    .map((_, i) => (i > 0 && i < last ? 'minmax(0,1.25fr)' : 'minmax(0,1fr)'))
    .join(' 40px ')
  return (
    <>
      <div className="a2-card" style={{padding: vp === 'm' ? 24 : 32}}>
        <div
          style={
            big
              ? {
                  display: 'grid',
                  gridTemplateColumns: columns,
                  alignItems: 'stretch',
                }
              : {display: 'flex', flexDirection: 'column', gap: 16}
          }
        >
          {p.flow.map((col, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <div
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: big ? 36 : 0,
                    color: 'var(--a2-soft)',
                  }}
                >
                  <Icon name={big ? 'arrow-right' : 'arrow-down'} size={20} />
                </div>
              )}
              <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                <span className="a2-micro">{col.label}</span>
                {i === 0 ? (
                  <Source items={col.items} />
                ) : i === last ? (
                  <Readers items={col.items} hue={hue} />
                ) : (
                  <Chain items={col.items} hue={hue} />
                )}
              </div>
            </Fragment>
          ))}
        </div>
        {p.footnote && (
          <p
            className="a2-mono"
            style={{...mono12, marginTop: 24, color: 'var(--a2-text-lo)'}}
          >
            {p.footnote}
          </p>
        )}
      </div>
      {p.layers.length > 0 && <Layers p={p} />}
    </>
  )
}

function Source({items}: {items: ArchitectureItem[]}) {
  return (
    <>
      {items.map((it, i) => {
        const h = it.hue ?? 'peri'
        return (
          <div
            key={i}
            style={{
              flex: 1,
              padding: 24,
              borderRadius: 12,
              border: `1.5px solid ${rgb(h, 0.6)}`,
              background: rgb(h, 0.08),
              boxShadow: `0 0 80px -24px ${rgb(h, 'calc(0.35 * var(--a2-glow-k))')}`,
            }}
          >
            {it.tag && <Badge hue={h}>{it.tag}</Badge>}
            <p className="a2-h3" style={{marginTop: it.tag ? 16 : 0}}>
              {it.title}
            </p>
            {it.copy && (
              <p className="a2-small" style={{marginTop: 8}}>
                {it.copy}
              </p>
            )}
            <Chips chips={it.chips} />
          </div>
        )
      })}
    </>
  )
}

function Chain({items, hue}: {items: ArchitectureItem[]; hue: Hue}) {
  return (
    <div
      style={{
        flex: 1,
        padding: 24,
        borderRadius: 12,
        border: `1px dashed ${rgb(hue, 0.4)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {items.map((it, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <div
              aria-hidden="true"
              style={{
                display: 'flex',
                justifyContent: 'center',
                color: 'var(--a2-text-lo)',
              }}
            >
              <Icon name="arrow-down" size={16} />
            </div>
          )}
          <div style={box(it.hue)}>
            <p className="a2-h4" style={h4Small}>
              {it.title}
            </p>
            {it.copy && (
              <p className="a2-small" style={{marginTop: 4}}>
                {it.copy}
              </p>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function Readers({items, hue}: {items: ArchitectureItem[]; hue: Hue}) {
  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>
      {items.map((it, i) => {
        const h = it.hue ?? hue
        return (
          <div
            key={i}
            style={{
              flex: 1,
              padding: 24,
              borderRadius: 12,
              border: `1px solid ${rgb(h, 0.35)}`,
              background: rgb(h, 0.06),
            }}
          >
            {it.tag && (
              <span className="a2-badge" style={{color: hueVar(h)}}>
                {it.tag}
              </span>
            )}
            <p className="a2-h4" style={{marginTop: it.tag ? 12 : 0}}>
              {it.title}
            </p>
            {it.copy && (
              <p className="a2-small" style={{marginTop: 4}}>
                {it.copy}
              </p>
            )}
            {it.code && (
              <p className="a2-mono" style={{...mono12, marginTop: 12}}>
                {it.code}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Layers({p}: {p: Of<'architecture'>}) {
  const vp = useViewport()
  const m = vp === 'm'
  return (
    <div
      className="a2-card"
      style={{
        padding: m ? 24 : 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        marginTop: 32,
      }}
    >
      {p.layersTitle && (
        <span className="a2-micro" style={{marginBottom: 8}}>
          {p.layersTitle}
        </span>
      )}
      {p.layers.map((layer, i) => (
        <div
          key={i}
          style={
            m
              ? {display: 'flex', flexDirection: 'column', gap: 8}
              : {
                  display: 'grid',
                  gridTemplateColumns: '128px minmax(0,1fr)',
                  columnGap: 24,
                  alignItems: 'center',
                }
          }
        >
          <span className="a2-micro">{layer.label}</span>
          {layer.items.length === 1 ? (
            <Layer it={layer.items[0]} wide={!m} />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: m
                  ? 'minmax(0,1fr)'
                  : `repeat(${layer.items.length},minmax(0,1fr))`,
                gap: 16,
              }}
            >
              {layer.items.map((it, j) => (
                <Layer key={j} it={it} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/** One box of the stack: on one line when it is alone in its row, the code under the title in a grid. */
function Layer({it, wide}: {it: ArchitectureItem; wide?: boolean}) {
  const inline = wide && !it.copy
  const head = (
    <div
      style={
        wide
          ? {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }
          : undefined
      }
    >
      <p className="a2-h4" style={h4Small}>
        {it.title}
      </p>
      {it.code && (
        <p className="a2-mono" style={{...mono12, marginTop: wide ? 0 : 4}}>
          {it.code}
        </p>
      )}
    </div>
  )
  const style: CSSProperties = it.hue
    ? {
        ...box(it.hue),
        border: `1px solid ${rgb(it.hue, 0.35)}`,
        background: rgb(it.hue, 0.05),
        boxShadow: `0 0 80px -24px ${rgb(it.hue, 'calc(0.25 * var(--a2-glow-k))')}`,
      }
    : box(undefined)
  if (inline && !it.chips?.length) return <div style={style}>{head}</div>
  return (
    <div style={style}>
      {head}
      {it.chips?.length ? (
        <div
          style={{
            display: wide ? 'grid' : 'flex',
            flexWrap: 'wrap',
            gridTemplateColumns: `repeat(${it.chips.length},minmax(0,1fr))`,
            gap: 8,
            marginTop: 16,
          }}
        >
          {it.chips.map(c => (
            <span
              key={c}
              className="a2-badge"
              style={{justifyContent: 'center'}}
            >
              {c}
            </span>
          ))}
        </div>
      ) : null}
      {it.copy && (
        <p
          className="a2-mono"
          style={{...mono12, marginTop: 16, color: 'var(--a2-text-lo)'}}
        >
          {it.copy}
        </p>
      )}
    </div>
  )
}

export function Subpages({p}: {p: Of<'subpages'>}) {
  const vp = useViewport()
  const cols = {m: 1, t: 2, d: 3, '4k': 3}[vp]
  return (
    <div
      className="a2-cols"
      style={{
        gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`,
        columnGap: vp === 'm' ? 16 : 32,
        rowGap: vp === 'm' ? 16 : 32,
      }}
    >
      {p.items.map((it, i) => {
        const hue = HUES[i % HUES.length]
        const open = !!it.href && !it.soon
        const style: CSSProperties = {
          display: 'flex',
          flexDirection: 'column',
          borderColor: rgb(hue, 0.2),
          boxShadow: `var(--a2-shadow-card),0 0 120px -20px ${rgb(hue, 'calc(0.12 * var(--a2-glow-k))')}`,
        }
        const body = (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                className="a2-itile is-40"
                style={{background: rgb(hue, 0.16), color: hueVar(hue)}}
              >
                <Icon name={(it.icon ?? 'file-text') as IconName} size={20} />
              </span>
              <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                {it.soon && <span className="a2-badge">{t('brand.soon')}</span>}
                <span className="a2-mono">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </span>
            </div>
            <h3 className="a2-h3" style={{marginTop: 24}}>
              {it.title}
            </h3>
            <p className="a2-small" style={{marginTop: 8, flexGrow: 1}}>
              {it.copy}
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
              <span className="a2-mono" style={mono12}>
                {it.path}
              </span>
              {open && (
                <span className="a2-link">
                  {t('brand.open')}
                  <Icon name="arrow-right" size={14} />
                </span>
              )}
            </div>
          </>
        )
        return open ? (
          <SmartLink key={i} className="a2-card" href={it.href!} style={style}>
            {body}
          </SmartLink>
        ) : (
          <div key={i} className="a2-card" style={style}>
            {body}
          </div>
        )
      })}
    </div>
  )
}

export function Repos({p}: {p: Of<'repos'>}) {
  return (
    <div className="a2-rows">
      {p.items.map((it, i) => {
        const body = (
          <>
            <span
              className="a2-adate"
              style={{display: 'flex', flexDirection: 'column', gap: 4}}
            >
              <span className="a2-mono">{it.role}</span>
              <span className="a2-badge" style={{alignSelf: 'flex-start'}}>
                {it.version}
              </span>
            </span>
            <span style={{minWidth: 0}}>
              <h3 className="a2-h4">{it.name}</h3>
              <p className="a2-small" style={{marginTop: 8, maxWidth: 720}}>
                {it.copy}
              </p>
            </span>
            <span style={{color: 'var(--a2-text-lo)', paddingTop: 2}}>
              {it.href && <Icon name="arrow-right" size={18} />}
            </span>
          </>
        )
        const style: CSSProperties = {alignItems: 'start'}
        return it.href ? (
          <SmartLink
            key={i}
            className="a2-arow p2-row"
            href={it.href}
            style={style}
          >
            {body}
          </SmartLink>
        ) : (
          <div key={i} className="a2-arow p2-row" style={style}>
            {body}
          </div>
        )
      })}
    </div>
  )
}

export function Coverage({p, hue}: {p: Of<'coverage'>; hue: Hue}) {
  const vp = useViewport()
  const m = vp === 'm'
  const columns = m
    ? 'minmax(0,1fr) 56px'
    : 'minmax(0,1.6fr) repeat(3,64px) minmax(0,1.4fr)'
  const row = (last?: boolean): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: columns,
    columnGap: m ? 16 : 24,
    alignItems: 'center',
    padding: last ? '0 0 16px' : '16px 0',
    borderBottom: '1px solid var(--a2-line)',
  })
  const count = (n?: number) => (
    <span
      className="a2-mono"
      style={{
        textAlign: 'right',
        color: n === undefined ? 'var(--a2-text-lo)' : 'var(--a2-text-hi)',
      }}
    >
      {n ?? '–'}
    </span>
  )
  const pct = (n: number) => (
    <span
      className="a2-mono"
      style={{color: 'var(--a2-text-hi)', width: 40, textAlign: 'right'}}
    >
      {n}%
    </span>
  )
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <span className="a2-micro">{p.label}</span>
        {p.badge && <span className="a2-badge">{p.badge}</span>}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${m ? 1 : p.totals.length},minmax(0,1fr))`,
          gap: 16,
          marginTop: 16,
        }}
      >
        {p.totals.map((s, i) => (
          <div
            key={i}
            style={{
              padding: 24,
              borderRadius: 12,
              border: `1px solid ${rgb(hue, 0.2)}`,
              background: rgb(hue, 0.04),
            }}
          >
            <span className="a2-micro">{s.label}</span>
            <p
              className="a2-num"
              style={{
                display: 'block',
                fontSize: 40,
                lineHeight: '44px',
                marginTop: 8,
                color: 'var(--a2-text-hi)',
              }}
            >
              {s.value}
            </p>
            <p className="a2-small" style={{marginTop: 8}}>
              {s.copy}
            </p>
          </div>
        ))}
      </div>
      <div style={{marginTop: 48}}>
        <div style={row(true)}>
          <span className="a2-micro">{t('brand.coverage.project')}</span>
          {!m && (
            <>
              <span className="a2-micro" style={{textAlign: 'right'}}>
                {t('brand.coverage.unit')}
              </span>
              <span className="a2-micro" style={{textAlign: 'right'}}>
                {t('brand.coverage.component')}
              </span>
              <span className="a2-micro" style={{textAlign: 'right'}}>
                {t('brand.coverage.e2e')}
              </span>
            </>
          )}
          <span className="a2-micro" style={m ? {textAlign: 'right'} : {}}>
            {t('brand.coverage.lines')}
          </span>
        </div>
        {p.rows.map((r, i) => (
          <div key={i} style={row()}>
            <span style={{minWidth: 0}}>
              <span className="a2-h4" style={{display: 'block', ...h4Small}}>
                {r.name}
              </span>
              <span className="a2-mono" style={mono12}>
                {r.tools}
              </span>
            </span>
            {m ? (
              pct(r.coverage)
            ) : (
              <>
                {count(r.unit)}
                {count(r.component)}
                {count(r.e2e)}
                <span style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <span
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 9,
                      background: 'var(--a2-line)',
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        width: `${r.coverage}%`,
                        height: '100%',
                        borderRadius: 9,
                        background: hueVar(hue),
                      }}
                    />
                  </span>
                  {pct(r.coverage)}
                </span>
              </>
            )}
          </div>
        ))}
        {(p.footnote || p.link) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              marginTop: 24,
            }}
          >
            <span className="a2-small" style={{color: 'var(--a2-text-lo)'}}>
              {p.footnote}
            </span>
            {p.link && <ArrowLink label={p.link.label} href={p.link.href} />}
          </div>
        )}
      </div>
    </div>
  )
}

export function Steps({p, hue}: {p: Of<'steps'>; hue: Hue}) {
  const last = p.items.length - 1
  return (
    <ol
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {p.items.map((s, i) => (
        <li
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '48px minmax(0,1fr)',
            columnGap: 16,
            padding: i === last ? 0 : '0 0 32px',
          }}
        >
          <span className="a2-mono" style={{color: hueVar(hue)}}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <span>
            <span className="a2-h4" style={{display: 'block'}}>
              {s.title}
            </span>
            <span className="a2-small" style={{display: 'block', marginTop: 8}}>
              {s.copy}
            </span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export function Cta({p}: {p: Of<'cta'>}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
      }}
    >
      <SmartLink className="a2-btn is-primary" href={p.href}>
        <Icon name="lock" size={16} style={{flexShrink: 0}} />
        <span>{p.label}</span>
      </SmartLink>
      {p.note && (
        <span className="a2-small" style={{color: 'var(--a2-text-lo)'}}>
          {p.note}
        </span>
      )}
    </div>
  )
}

export function Prefill({p, hue}: {p: Of<'prefill'>; hue: Hue}) {
  return (
    <>
      <div
        style={{
          padding: 24,
          borderRadius: 12,
          border: `1px solid ${rgb(hue, 0.24)}`,
          background: rgb(hue, 0.05),
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <span className="a2-micro">{p.title}</span>
          <span className="a2-mono" style={mono12}>
            {p.path}
          </span>
        </div>
        <dl className="a2-kv" style={{marginTop: 16}}>
          {p.facts.map((f, i) => (
            <Fragment key={i}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </Fragment>
          ))}
        </dl>
      </div>
      {p.note && (
        <p
          className="a2-small"
          style={{marginTop: 16, color: 'var(--a2-text-lo)'}}
        >
          {p.note}
        </p>
      )}
    </>
  )
}
