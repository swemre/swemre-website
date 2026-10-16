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

import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import type {IconName} from '../types/type'
import {cn} from '../utils/cn'
import {Icon} from './Icon'

export function ListBox({
  title,
  icon,
  moreTo,
  divided = true,
  className,
  children,
}: {
  title: string
  icon: IconName
  moreTo?: string
  divided?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-md border border-border bg-surface shadow-xs',
        className,
      )}
    >
      <header className="flex items-center gap-2 border-b border-border bg-surface-muted px-4 py-2.5">
        <Icon name={icon} className="text-fg-muted" />
        <h2 className="text-sm font-semibold text-fg-strong">{title}</h2>
        {moreTo && (
          <Link
            to={moreTo}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary"
          >
            View all <Icon name="arrow-right" size={12} />
          </Link>
        )}
      </header>
      <ul
        className={cn(
          'min-h-0 flex-1 overflow-y-auto',
          divided ? 'divide-y divide-border-muted' : 'p-2',
        )}
      >
        {children}
      </ul>
    </section>
  )
}

export function ListRow({
  icon,
  title,
  meta,
  trailing,
  active = false,
}: {
  icon: ReactNode
  title: ReactNode
  meta?: ReactNode
  trailing?: ReactNode
  active?: boolean
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 transition-colors',
        active ? 'bg-primary-muted' : 'hover:bg-surface-muted',
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-fg-strong">
          {title}
        </div>
        {meta && <div className="truncate text-xs text-fg-muted">{meta}</div>}
      </div>
      {trailing}
    </li>
  )
}
