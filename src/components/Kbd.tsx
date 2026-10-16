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
import {cn} from '../utils/cn'
import {coverKbd} from '../utils/navTone'

export function Kbd({children}: {children: ReactNode}) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-border bg-surface px-1 font-mono text-2xs text-fg-muted shadow-xs',
        coverKbd,
      )}
    >
      {children}
    </kbd>
  )
}
