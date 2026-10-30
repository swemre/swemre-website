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

// Layout pieces shared by B's templates: the two-column section split and the shell prompt.
import type {CSSProperties, ReactNode} from 'react'
import {useCompact, useV} from './vp.ts'

/**
 * Desktop and 4K: a 12-column grid with the two children in the given column spans. Mobile and
 * tablet: one column, gap 48 / 64. `reverse` puts the second child first on mobile and tablet.
 */
export function Split({
  left,
  right,
  spans,
  align = 'start',
  reverse,
}: {
  left: ReactNode
  right: ReactNode
  /** [left start, left span, right start, right span] */
  spans: [number, number, number, number]
  align?: 'start' | 'center'
  reverse?: boolean
}) {
  const v = useV()
  const cmp = useCompact()
  if (cmp)
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: v(48, 64, 64)}}
      >
        <div style={{minWidth: 0, order: reverse ? 1 : undefined}}>{left}</div>
        <div style={{minWidth: 0}}>{right}</div>
      </div>
    )
  return (
    <div className="a2-g12" style={{alignItems: align}}>
      <div style={{gridColumn: `${spans[0]} / span ${spans[1]}`, minWidth: 0}}>
        {left}
      </div>
      <div style={{gridColumn: `${spans[2]} / span ${spans[3]}`, minWidth: 0}}>
        {right}
      </div>
    </div>
  )
}

/** emre@swemre:~$ <command> */
export function Prompt({
  command,
  caret,
  style,
}: {
  command: string
  caret?: boolean
  style?: CSSProperties
}) {
  return (
    <p className="a2-mono" style={{whiteSpace: 'nowrap', ...style}}>
      <span className="a2-mint">emre@swemre</span>
      <span>:</span>
      <span className="a2-soft">~</span>
      <span>$ </span>
      <span className="a2-txt">{command}</span>
      {caret && <span className="a2-caret" aria-hidden="true" />}
    </p>
  )
}
