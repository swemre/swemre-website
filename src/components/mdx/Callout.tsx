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
import type {CalloutType, IconName} from '../../types/type'
import {cn} from '../../utils/cn'
import {Icon} from '../Icon'

const styles: Record<
  CalloutType,
  {label: string; icon: IconName; className: string}
> = {
  note: {label: 'Note', icon: 'info', className: 'border-primary text-primary'},
  tip: {label: 'Tip', icon: 'check', className: 'border-success text-success'},
  warning: {
    label: 'Warning',
    icon: 'warning',
    className: 'border-attention text-attention',
  },
  danger: {
    label: 'Caution',
    icon: 'warning',
    className: 'border-danger text-danger',
  },
}

export function Callout({
  type = 'note',
  children,
}: {
  type?: CalloutType
  children: ReactNode
}) {
  const style = styles[type]
  return (
    <div className={cn('my-5 border-l-4 py-1 pl-4', style.className)}>
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Icon name={style.icon} size={15} />
        {style.label}
      </p>
      <div className="text-fg [&>p]:my-1">{children}</div>
    </div>
  )
}
