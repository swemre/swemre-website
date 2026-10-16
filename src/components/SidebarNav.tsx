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
import type {SidebarNavSection} from '../types/type'
import {cn} from '../utils/cn'
import {Icon} from './Icon'

export function SidebarNav({sections}: {sections: SidebarNavSection[]}) {
  return (
    <nav aria-label="Site sections" className="space-y-6 text-sm">
      {sections.map(section => (
        <div key={section.title}>
          <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold text-fg-strong">
            <Icon name={section.icon} size={14} className="text-fg-subtle" />
            {section.title}
            {section.moreTo && (
              <Link
                to={section.moreTo}
                className="ml-auto font-medium text-primary"
              >
                All
              </Link>
            )}
          </p>
          <ul className="space-y-0.5">
            {section.items.map(item => (
              <li key={item.key}>
                <Link
                  to={item.to}
                  aria-current={item.active ? 'page' : undefined}
                  className={cn(
                    'block rounded-sm px-3 py-1.5 leading-snug transition-colors hover:no-underline',
                    item.active
                      ? 'bg-primary-muted font-medium text-primary'
                      : 'text-fg-muted hover:bg-surface-muted hover:text-fg-strong',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
