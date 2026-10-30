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

// Button (V4-Comp-Button): 48 high, radius 6; primary, secondary, ghost, danger; busy and
// disabled. Arrows go right of the label, other icons left. Busy shows the spinner and "Sending…".
import type {ButtonHTMLAttributes, ReactNode} from 'react'
import {Anchor, type AnchorProps} from './Link.tsx'
import {Icon, type IconName} from './Icon.tsx'
import {cx} from './util.ts'

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> {
  label: ReactNode
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger'
  state?: 'busy' | 'disabled'
  iconLeft?: IconName
  iconRight?: IconName
  href?: string
  block?: boolean
  /** Icon-only button: label becomes the accessible name. */
  iconOnly?: boolean
  type?: 'button' | 'submit' | 'reset'
  /** Label while busy (default "Sending…"). */
  busyLabel?: string
}

export function Button({
  label,
  kind = 'primary',
  state,
  iconLeft,
  iconRight,
  href,
  block,
  iconOnly,
  type = 'button',
  busyLabel = 'Sending…',
  className,
  ...rest
}: ButtonProps) {
  const busy = state === 'busy'
  const cls = cx(
    'a2-btn',
    `is-${kind}`,
    state && `is-${state}`,
    block && 'is-block',
    iconOnly && 'is-icononly',
    className,
  )
  const inner = (
    <>
      {busy ? (
        <Icon name="spinner" className="a2-spin" />
      ) : (
        iconLeft && <Icon name={iconLeft} />
      )}
      {iconOnly ? (
        <span className="a2-sr">{label}</span>
      ) : (
        <span>{busy ? busyLabel : label}</span>
      )}
      {iconRight && !busy && <Icon name={iconRight} />}
    </>
  )
  if (href && state !== 'disabled') {
    return (
      <Anchor
        href={href}
        className={cls}
        aria-busy={busy || undefined}
        style={rest.style}
        onClick={rest.onClick as AnchorProps['onClick']}
      >
        {inner}
      </Anchor>
    )
  }
  return (
    <button
      type={type}
      className={cls}
      disabled={state === 'disabled' || rest.disabled}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      {...rest}
      onClick={busy ? e => e.preventDefault() : rest.onClick}
    >
      {inner}
    </button>
  )
}
