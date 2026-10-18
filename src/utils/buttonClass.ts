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
  'relative isolate inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-sm border font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:no-underline active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100 [&>svg]:transition-transform [&>svg]:duration-300 hover:[&>svg]:translate-x-0.5'

// A light sweep slides across filled buttons
export const shineClass =
  'before:absolute before:inset-y-0 before:left-0 before:-z-10 before:w-1/2 before:-translate-x-full before:skew-x-[-20deg] before:bg-linear-to-r before:from-transparent before:via-cover-fg/25 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-[300%]'

// A tint grows in from the left on outlined buttons
export const fillClass =
  'after:absolute after:inset-0 after:-z-10 after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100'

const variants: Record<ButtonVariant, string> = {
  primary: cn(
    'border-primary-solid bg-primary-solid text-fg-on-emphasis shadow-cta hover:border-primary-solid-hover hover:bg-primary-solid-hover hover:shadow-cta-hover',
    shineClass,
  ),
  secondary: cn(
    'border-border bg-surface text-fg-strong shadow-xs after:bg-primary-muted hover:border-primary/40 hover:text-primary',
    fillClass,
  ),
  ghost: cn(
    'border-transparent bg-transparent text-fg-muted after:bg-surface-muted hover:text-fg-strong',
    fillClass,
  ),
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
