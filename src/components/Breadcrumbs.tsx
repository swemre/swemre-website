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
import {Icon} from './Icon'

export function Breadcrumbs({
  items,
}: {
  items: Array<{label: string; to?: string}>
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, i) => (
          <li key={item.label} className="flex min-w-0 items-center gap-1">
            {i > 0 && (
              <Icon name="chevron-right" size={14} className="text-fg-subtle" />
            )}
            {item.to ? (
              <Link
                to={item.to}
                className="truncate text-fg-muted hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="truncate font-medium text-fg-strong"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
