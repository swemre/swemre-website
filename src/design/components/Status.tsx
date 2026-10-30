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

// StatusLine (V4-Comp-StatusLine: the fixed status slot, 24 / mobile 48), SubmitRow
// (V4-Comp-SubmitRow) and Banner (V4-Comp-Banner: error summary, failure, info, ok).
import type {CSSProperties, ReactNode} from 'react'
import {Anchor} from './Link.tsx'
import {Button} from './Button.tsx'
import {Icon} from './Icon.tsx'
import {useViewport} from '../context.ts'
import {cx} from './util.ts'
import {t} from '../../i18n/index.ts'

export interface StatusLineProps {
  kind?: 'idle' | 'errors' | 'busy' | 'failure'
  message?: ReactNode
}

export function StatusLine({kind = 'idle', message}: StatusLineProps) {
  if (kind === 'errors' || kind === 'failure')
    return (
      <div className="a2-status is-err" role="alert">
        <Icon name={kind === 'errors' ? 'alert' : 'warning'} size={14} />
        <span>{message}</span>
      </div>
    )
  return (
    <div className="a2-status" role="status" aria-live="polite">
      {kind === 'busy' && <Icon name="spinner" className="a2-spin" />}
      <span>{message}</span>
    </div>
  )
}

export interface SubmitRowProps {
  /** The buttons (primary last). */
  children: ReactNode
  /** "I reply within two working days." */
  note?: ReactNode
  /** split: note left, buttons right (the component sheet); inline: buttons, then the note, as
   * the playable forms draw it. Mobile always stacks the button over the note. */
  layout?: 'split' | 'inline'
}

export function SubmitRow({children, note, layout = 'split'}: SubmitRowProps) {
  if (useViewport() === 'm')
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {children}
        {note && <p className="a2-cap">{note}</p>}
      </div>
    )
  if (layout === 'inline')
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {children}
        {note && <span className="a2-cap">{note}</span>}
      </div>
    )
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}
    >
      {note && <p className="a2-cap">{note}</p>}
      <div style={{display: 'flex', gap: 16}}>{children}</div>
    </div>
  )
}

export interface BannerProps {
  kind: 'errors' | 'failure' | 'info' | 'ok'
  title: ReactNode
  copy?: ReactNode
  /** errors: one line per bad field; the link jumps to the field. */
  items?: {label: string; href: string; message: string; onClick?(): void}[]
  action?: {label: string; onClick(): void; busy?: boolean}
  id?: string
  style?: CSSProperties
  tabIndex?: number
}

const errLink: CSSProperties = {
  color: 'var(--a2-err-text)',
  textDecorationColor: 'rgb(var(--a2-err-text-rgb) / .4)',
}

export function Banner({
  kind,
  title,
  copy,
  items,
  action,
  id,
  style,
  tabIndex,
}: BannerProps) {
  const err = kind === 'errors' || kind === 'failure'
  const icon =
    kind === 'errors'
      ? 'alert'
      : kind === 'failure'
        ? 'warning'
        : kind === 'ok'
          ? 'check-circle'
          : 'info'
  const tone = err
    ? 'var(--a2-err)'
    : kind === 'ok'
      ? 'var(--a2-mint)'
      : 'var(--a2-soft)'
  return (
    <div
      className={cx(
        'a2-banner',
        kind === 'info' && 'is-info',
        kind === 'ok' && 'is-ok',
      )}
      role={err ? 'alert' : 'status'}
      id={id}
      style={style}
      tabIndex={tabIndex}
    >
      <span style={{color: tone, marginTop: 3}}>
        <Icon name={icon} />
      </span>
      <div>
        <h4 className="a2-h4" style={{fontSize: 16, lineHeight: '24px'}}>
          {title}
        </h4>
        {items && items.length > 0 && (
          <ul
            className="a2-small"
            style={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {items.map(it => (
              <li
                key={it.href}
                style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}
              >
                <Anchor
                  className="a2-ilink"
                  style={errLink}
                  href={it.href}
                  onClick={
                    it.onClick
                      ? e => {
                          e.preventDefault()
                          it.onClick?.()
                        }
                      : undefined
                  }
                >
                  {it.label}
                </Anchor>
                <span className="a2-mid">{it.message}</span>
              </li>
            ))}
          </ul>
        )}
        {copy && (
          <p className="a2-small" style={{marginTop: 4}}>
            {copy}
          </p>
        )}
        {action && (
          <div style={{marginTop: 16}}>
            <Button
              kind="secondary"
              iconLeft="refresh"
              label={action.label}
              state={action.busy ? 'busy' : undefined}
              busyLabel={t('state.retrying')}
              onClick={action.onClick}
            />
          </div>
        )}
      </div>
    </div>
  )
}
