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

// StatePanel (V4-Comp-StatePanel): the dashed panel for loading, empty, error and not-found, with
// the hue tile, title, copy, the terminal prompt line ("$ ls ~/articles --topic rust  0
// results") and the actions. Error panels carry role=alert and a Try again button.
import type {ReactNode} from 'react'
import {Button} from './Button.tsx'
import {Icon, type IconName} from './Icon.tsx'
import {hueRgb, type Hue} from './util.ts'

export interface StatePanelProps {
  kind: 'loading' | 'empty' | 'error' | 'not-found' | 'info'
  title: ReactNode
  copy?: ReactNode
  /** The prompt line: the command after "$ " ... */
  command?: string
  /** ... and its answer ("0 results", "503 Service Unavailable"). */
  result?: string
  hue?: Hue
  icon?: IconName
  /** Buttons and links under the prompt. */
  actions?: ReactNode
  /** Error panels: adds the primary "Try again" button before the actions. */
  onRetry?(): void
  retrying?: boolean
  /** A micro caption instead of a prompt ("0 saved"). */
  micro?: string
}

const ICONS: Record<StatePanelProps['kind'], IconName> = {
  loading: 'spinner',
  empty: 'inbox',
  error: 'cloud-off',
  'not-found': 'search-x',
  info: 'info',
}

export function StatePanel({
  kind,
  title,
  copy,
  command,
  result,
  hue = 'blue',
  icon,
  actions,
  onRetry,
  retrying,
  micro,
}: StatePanelProps) {
  const err = kind === 'error'
  return (
    <div
      className="a2-state"
      role={err ? 'alert' : 'status'}
      aria-busy={kind === 'loading' || undefined}
      style={{
        borderColor: err ? 'rgb(var(--a2-err-rgb) / .3)' : hueRgb(hue, 0.24),
      }}
    >
      <span
        className="a2-itile is-40"
        style={
          err
            ? {
                background: 'rgb(var(--a2-err-rgb) / .1)',
                color: 'var(--a2-err)',
              }
            : {background: hueRgb(hue, 0.16), color: `var(--a2-hue-${hue})`}
        }
      >
        <Icon
          name={icon ?? ICONS[kind]}
          size={20}
          className={kind === 'loading' && !icon ? 'a2-spin' : undefined}
        />
      </span>
      <h4 className="a2-h4" style={{marginTop: 16}}>
        {title}
      </h4>
      {copy && (
        <p className="a2-small" style={{marginTop: 8, maxWidth: 520}}>
          {copy}
        </p>
      )}
      {command && (
        <p
          className="a2-mono"
          style={{
            marginTop: 24,
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
          }}
        >
          <span className="a2-mint">$</span> {command}
          {result && (
            <span
              className={err ? undefined : 'a2-lo'}
              style={{
                marginLeft: 16,
                ...(err ? {color: 'var(--a2-err-text)'} : {}),
              }}
            >
              {result}
            </span>
          )}
          {kind === 'loading' && (
            <span className="a2-caret" aria-hidden="true" />
          )}
        </p>
      )}
      {micro && (
        <span className="a2-micro" style={{marginTop: 16}}>
          {micro}
        </span>
      )}
      {(actions || onRetry) && (
        <div
          style={{marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 16}}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            {onRetry && (
              <Button
                kind={actions ? 'primary' : 'secondary'}
                iconLeft="refresh"
                label="Try again"
                busyLabel="Trying again…"
                state={retrying ? 'busy' : undefined}
                onClick={onRetry}
              />
            )}
            {actions}
          </div>
        </div>
      )}
    </div>
  )
}
