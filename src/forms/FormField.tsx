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

export const inputClass =
  'w-full rounded-sm border border-border bg-inset px-3 py-2 text-sm text-fg-strong shadow-xs transition-colors placeholder:text-fg-subtle focus:border-primary focus:bg-surface focus:outline-2 focus:outline-primary-muted aria-invalid:border-danger'

export function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="mb-4 grid gap-1.5">
      <span className="text-sm font-semibold text-fg-strong">{label}</span>
      {children}
      {error && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </label>
  )
}
