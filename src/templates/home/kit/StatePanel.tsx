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

// The data-block states drawn on the boards: the dashed state panel (empty and error) and the
// shimmer skeleton bars. Local to B until agent A's StatePanel and Skeleton land.
import type {CSSProperties, ReactNode} from 'react'
import type {Hue} from '../../../contract/view.ts'
import {Icon, type IconName} from './ui.ts'
import {useV} from './vp.ts'

export function Skel({
  w,
  h,
  r = 6,
  style,
}: {
  w: number | string
  h: number
  r?: number
  style?: CSSProperties
}) {
  return (
    <div
      className="a2-skel"
      style={{width: w, height: h, borderRadius: r, ...style}}
    />
  )
}

export interface StatePanelProps {
  /** A hue for empty states; omitted for errors. */
  hue?: Hue
  /** An icon name, or a drawn icon for glyphs the set does not have. */
  icon: IconName | ReactNode
  title: ReactNode
  copy: ReactNode
  /** The shell line: command and its result ("0 results", "503 Service Unavailable"). */
  command: string
  result: string
  actions?: ReactNode
  style?: CSSProperties
  /** Heading level of the title (h4 on the boards). */
  heading?: 'h3' | 'h4'
}

export function StatePanel({
  hue,
  icon,
  title,
  copy,
  command,
  result,
  actions,
  style,
  heading = 'h4',
}: StatePanelProps) {
  const v = useV()
  const error = !hue
  const H = heading
  return (
    <div
      className="a2-state"
      role={error ? 'alert' : 'status'}
      style={{
        borderColor: error
          ? 'rgb(var(--a2-err-rgb) / .3)'
          : `rgb(var(--a2-hue-${hue}-rgb) / 0.24)`,
        ...style,
      }}
    >
      <span
        className="a2-itile is-40"
        style={
          error
            ? {
                background: 'rgb(var(--a2-err-rgb) / .1)',
                color: 'var(--a2-err)',
              }
            : {
                background: `rgb(var(--a2-hue-${hue}-rgb) / 0.16)`,
                color: `var(--a2-hue-${hue})`,
              }
        }
      >
        {typeof icon === 'string' ? (
          <Icon name={icon as IconName} size={20} />
        ) : (
          icon
        )}
      </span>
      <H className="a2-h4" style={{marginTop: 16}}>
        {title}
      </H>
      <p className="a2-small" style={{marginTop: 8, maxWidth: 520}}>
        {copy}
      </p>
      <p
        className="a2-mono"
        style={{marginTop: 24, whiteSpace: 'normal', overflowWrap: 'anywhere'}}
      >
        <span className="a2-mint">$</span> {command}
        <span
          className={error ? undefined : 'a2-lo'}
          style={{
            marginLeft: 16,
            color: error ? 'var(--a2-err-text)' : undefined,
          }}
        >
          {result}
        </span>
      </p>
      {actions && (
        <div
          style={{marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 16}}
        >
          <div
            style={{
              display: 'flex',
              gap: 16,
              ...(v(true, false, false)
                ? {flexDirection: 'column'}
                : {alignItems: 'center', flexWrap: 'wrap'}),
            }}
          >
            {actions}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * The big state number left of a list state panel ("00", "E503") with its mono or micro line.
 * error colours it with the error text colour.
 */
export function StateNumber({
  prefix,
  digits,
  hue = 'blue',
  error,
  line,
}: {
  prefix: string
  digits: string
  hue?: Hue
  error?: boolean
  line: string
}) {
  return (
    <div>
      <span className="a2-num" aria-hidden="true">
        <span className="is-dim">{prefix}</span>
        <span
          style={
            error
              ? {
                  color: 'var(--a2-err-text)',
                  textShadow:
                    '0 0 40px rgb(var(--a2-err-rgb) / calc(.2 * var(--a2-glow-text-k)))',
                }
              : {
                  color: `var(--a2-hue-${hue})`,
                  textShadow: `0 0 40px rgb(var(--a2-hue-${hue}-rgb) / calc(0.22 * var(--a2-glow-text-k)))`,
                }
          }
        >
          {digits}
        </span>
      </span>
      {error ? (
        <span
          className="a2-micro"
          style={{color: 'var(--a2-err-text)', display: 'block', marginTop: 16}}
        >
          {line}
        </span>
      ) : (
        <span className="a2-mono" style={{display: 'block', marginTop: 16}}>
          {line}
        </span>
      )}
    </div>
  )
}

/** The "#" glyph of the topic empty state (not in the icon set). */
export function HashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{flexShrink: 0}}
    >
      <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
    </svg>
  )
}
