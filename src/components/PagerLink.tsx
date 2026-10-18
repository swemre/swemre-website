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

import {Link} from 'react-router-dom'
import {cn} from '../utils/cn'
import {Icon} from './Icon'

export function PagerLink({
  to,
  title,
  direction,
}: {
  to: string
  title: string
  direction: 'previous' | 'next'
}) {
  const next = direction === 'next'
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-col gap-1 rounded-lg border border-border bg-surface p-5 shadow-xs transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:no-underline hover:shadow-lg',
        next && 'text-right sm:col-start-2',
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs text-fg-muted',
          next && 'justify-end',
        )}
      >
        {!next && <Icon name="arrow-left" size={12} />}
        {next ? 'Next' : 'Previous'}
        {next && <Icon name="arrow-right" size={12} />}
      </span>
      <span className="font-medium text-primary">{title}</span>
    </Link>
  )
}
