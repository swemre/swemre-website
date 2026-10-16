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

import {siteConfig} from '../../config/site'
import type {ChatPresence} from '../../types/type'
import {cn} from '../../utils/cn'

export function OwnerAvatar({
  presence,
  size = 'md',
  shape = 'full',
}: {
  presence?: ChatPresence
  size?: 'sm' | 'md' | 'lg'
  shape?: 'full' | 'md'
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <img
        src={siteConfig.avatar}
        srcSet={`${siteConfig.avatar} 1x, ${siteConfig.avatarLarge} 4x`}
        alt={siteConfig.name}
        className={cn(
          'bg-surface-muted object-cover ring-1 ring-border',
          shape === 'full' ? 'rounded-full' : 'rounded-md',
          size === 'sm' && 'size-7',
          size === 'md' && 'size-9',
          size === 'lg' && 'size-12',
        )}
      />
      {presence && (
        <span
          role="status"
          aria-label={presence === 'online' ? 'Online' : 'Offline'}
          title={presence === 'online' ? 'Online' : 'Offline'}
          className={cn(
            'absolute -top-1 -right-1 rounded-full ring-2 ring-overlay',
            size === 'lg' ? 'size-3.5' : 'size-2.5',
            presence === 'online' ? 'bg-success' : 'bg-fg-subtle',
          )}
        />
      )}
    </span>
  )
}
