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

export function TagLabel({children}: {children: ReactNode}) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary-muted px-2.5 py-0.5 text-xs font-medium text-primary">
      {children}
    </span>
  )
}
