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

// The status layout shared by 404, 500, 503, Single-Page-not-found and the newsletter status
// pages: the status backdrop, a rail that starts under the nav with a filled node, the mark (a
// code like 404 or an icon tile) beside the eyebrow, title, lead and actions.
import type {ReactNode} from 'react'
import type {Hue} from '../../contract/view.ts'
import {useViewport} from '../../design/index.tsx'
import {HeroCurve, Sec, StatusBackdrop} from './deco.tsx'
import {ArrowLink} from './heads.tsx'
import {statusMinHeight, usePick} from './vp.ts'

/** "404": the first digits faint, the last one lit. */
export function CodeMark({
  code,
  color,
  glow,
}: {
  code: string
  color: string
  /** The rgb triple of the glow, e.g. var(--a2-err-rgb). */
  glow?: string
}) {
  return (
    <span
      className="a2-num"
      aria-hidden="true"
      style={{fontVariantNumeric: 'tabular-nums'}}
    >
      <span style={{color: 'var(--a2-text-faint)'}}>{code.slice(0, -1)}</span>
      <span
        style={{
          color,
          textShadow: glow
            ? `0 0 40px rgb(${glow} / calc(0.3 * var(--a2-glow-text-k)))`
            : undefined,
        }}
      >
        {code.slice(-1)}
      </span>
    </span>
  )
}

/** "Articles ->" beside a button, at button height. */
export function StatusLink({to, children}: {to: string; children: ReactNode}) {
  return (
    <ArrowLink to={to} style={{height: 48}}>
      {children}
    </ArrowLink>
  )
}

export function StatusHero({
  hue,
  railLabel,
  mark,
  markLabel,
  markColor,
  eyebrow,
  detail,
  title,
  lead,
  actions,
  after,
  fill = true,
  railBottom,
}: {
  hue: Hue
  railLabel: string
  mark: ReactNode
  markLabel: string
  markColor?: string
  /** "error 404": drawn as "// error 404 · <detail>". */
  eyebrow: string
  detail?: string
  title: ReactNode
  lead: ReactNode
  actions: ReactNode
  /** Below the actions (the subscription card, the "by mistake?" line). */
  after?: ReactNode
  /** Fill the window (all but the confirmed page, which continues). */
  fill?: boolean
  railBottom?: number
}) {
  const vp = useViewport()
  const pick = usePick()
  const big = vp === 'd' || vp === '4k'
  const markBlock = (
    <div>
      {mark}
      <span
        className="a2-micro"
        style={{display: 'block', marginTop: 8, color: markColor}}
      >
        {markLabel}
      </span>
    </div>
  )
  const text = (
    <>
      <span className="a2-eyebrow" style={{marginBottom: 16}}>
        {`// ${eyebrow}`}
        {detail && (
          <>
            {' · '}
            <span style={{fontStyle: 'normal'}}>{detail}</span>
          </>
        )}
      </span>
      <h1 className="a2-d2" style={{textWrap: 'balance'}}>
        {title}
      </h1>
      <p className="a2-lead" style={{marginTop: big ? 24 : 16, maxWidth: 640}}>
        {lead}
      </p>
      <div
        style={
          vp === 'm'
            ? // Mobile: the button full width, the links stacked under it.
              {display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24}
            : {
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                marginTop: big ? 32 : 24,
              }
        }
      >
        {actions}
      </div>
      {after}
    </>
  )
  return (
    <Sec
      deco={{
        rail: {hue, top: pick({m: 0, d: 104}), bottom: railBottom},
        node: {top: {m: 181, t: 223, d: 226, k: 358}, end: true},
        label: railLabel,
        backdrop: <StatusBackdrop />,
      }}
      style={{
        ...(fill ? {minHeight: statusMinHeight(vp)} : {}),
        paddingTop: pick({m: 160, t: 192, d: 192, k: 320}),
        paddingBottom: pick({m: 96, t: 128, d: 128, k: 256}),
      }}
    >
      <HeroCurve hue={hue} top={0} />
      <div className="a2-c">
        {big ? (
          <div className="a2-g12" style={{alignItems: 'start'}}>
            <div style={{gridColumn: '1 / span 2', minWidth: 0}}>
              {markBlock}
            </div>
            <div style={{gridColumn: '3 / span 10', minWidth: 0}}>{text}</div>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
            {markBlock}
            <div>{text}</div>
          </div>
        )}
      </div>
    </Sec>
  )
}
