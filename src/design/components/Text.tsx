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

// TextLink (V4-Comp-TextLink), Chip (V4-Comp-Chip), Badge (V4-Comp-Badge), Kbd and the tag line.
import {
  Fragment,
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
} from 'react'
import {Anchor} from './Link.tsx'
import {Icon, type IconName} from './Icon.tsx'
import {badgeStyle, cx, hueRgb, type Hue} from './util.ts'

export interface TextLinkProps {
  label: ReactNode
  href?: string
  /** Icon right of the label (default arrow-right); null for none. */
  arrow?: IconName | null
  /** Icon left of the label (external links use it on the boards). */
  icon?: IconName
  onClick?: MouseEventHandler
  className?: string
  style?: CSSProperties
  external?: boolean
}

export function TextLink({
  label,
  href,
  arrow = 'arrow-right',
  icon,
  onClick,
  className,
  style,
  external,
}: TextLinkProps) {
  const inner = (
    <>
      {icon && <Icon name={icon} size={14} />}
      {label}
      {arrow && !icon && <Icon name={arrow} size={14} />}
    </>
  )
  if (!href) {
    return (
      <button
        type="button"
        className={cx('a2-link', className)}
        style={style}
        onClick={onClick}
      >
        {inner}
      </button>
    )
  }
  return (
    <Anchor
      href={href}
      external={external}
      className={cx('a2-link', className)}
      style={style}
      onClick={onClick}
    >
      {inner}
    </Anchor>
  )
}

export interface ChipProps {
  label: ReactNode
  count?: number | string
  active?: boolean
  /** Shows the check icon when active (multi-select chips). */
  check?: boolean
  icon?: IconName
  href?: string
  onClick?: MouseEventHandler
  /** aria-pressed for toggles (default true when onClick is set). */
  pressed?: boolean
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

export function Chip({
  label,
  count,
  active,
  check,
  icon,
  href,
  onClick,
  pressed,
  disabled,
  className,
  style,
}: ChipProps) {
  const cls = cx('a2-chip', active && 'is-active', className)
  const inner = (
    <>
      {check && active ? (
        <Icon name="check" size={14} />
      ) : (
        icon && <Icon name={icon} size={14} />
      )}
      {label}
      {count !== undefined && <span className="a2-count">{count}</span>}
    </>
  )
  if (href)
    return (
      <Anchor
        href={href}
        className={cls}
        style={style}
        aria-current={active ? 'true' : undefined}
        onClick={onClick}
      >
        {inner}
      </Anchor>
    )
  if (onClick)
    return (
      <button
        type="button"
        className={cls}
        style={style}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={pressed ?? !!active}
      >
        {inner}
      </button>
    )
  return (
    <span className={cls} style={style}>
      {inner}
    </span>
  )
}

export interface BadgeProps {
  label: ReactNode
  hue?: Hue
  tone?: 'ok' | 'err'
  dot?: boolean
  pulse?: boolean
  icon?: IconName
  className?: string
  style?: CSSProperties
}

export function Badge({
  label,
  hue,
  tone,
  dot,
  pulse,
  icon,
  className,
  style,
}: BadgeProps) {
  return (
    <span
      className={cx('a2-badge', className)}
      style={{...badgeStyle(hue, tone), ...style}}
    >
      {dot && (
        <span
          className={cx('a2-dot', pulse && 'a2-blink')}
          style={{boxShadow: `0 0 0 3px ${hueRgb(hue ?? 'blue', 0.18)}`}}
        />
      )}
      {icon && <Icon name={icon} size={12} />}
      {label}
    </span>
  )
}

/** Keyboard key (Ctrl, K, Esc, ↑↓, ↵). */
export function Kbd({
  children,
  style,
}: {
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <kbd className="a2-kbd" style={style}>
      {children}
    </kbd>
  )
}

/** The "Java · Spring Boot · Backend" tag line (a2-tags). */
export function Tags({tags, className}: {tags: string[]; className?: string}) {
  return (
    <span className={cx('a2-tags', className)}>
      {tags.map((t, i) => (
        <Fragment key={t}>
          {i > 0 && <i>·</i>}
          {t}
        </Fragment>
      ))}
    </span>
  )
}

/** A row of plain badges (a2-chips of a2-badge): the tags under cards and rows. */
export function BadgeList({
  tags,
  style,
}: {
  tags: string[]
  style?: CSSProperties
}) {
  return (
    <span className="a2-chips" style={style}>
      {tags.map(t => (
        <span key={t} className="a2-badge">
          {t}
        </span>
      ))}
    </span>
  )
}
