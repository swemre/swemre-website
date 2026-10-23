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

import {buttonClass} from '../utils/buttonClass'
import {cn} from '../utils/cn'
import {Icon} from './Icon'

// Shown when the API is down or too slow, so it never looks like an empty workspace
export function LoadError({
  onRetry,
  className,
}: {
  onRetry: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-8',
        className,
      )}
    >
      <p className="flex items-center gap-2 font-semibold text-fg-strong">
        <Icon name="warning" size={16} className="text-attention" />
        Content could not be loaded
      </p>
      <p className="max-w-measure text-sm text-fg-muted">
        The server did not answer. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={buttonClass('secondary', 'sm')}
      >
        Retry
      </button>
    </div>
  )
}
