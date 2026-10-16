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

import type {ButtonSize, ButtonVariant} from '../types/type'
import {cn} from './cn'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm border font-medium transition-colors hover:no-underline disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-primary-solid bg-primary-solid text-fg-on-emphasis shadow-xs hover:border-primary-solid-hover hover:bg-primary-solid-hover',
  secondary:
    'border-border bg-surface text-fg-strong shadow-xs hover:border-border-strong hover:bg-surface-muted',
  ghost:
    'border-transparent bg-transparent text-fg-muted hover:bg-surface-muted hover:text-fg-strong',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export const buttonClass = (
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  extra?: string,
) => cn(base, variants[variant], sizes[size], extra)
