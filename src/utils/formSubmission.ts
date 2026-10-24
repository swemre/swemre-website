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

import {ApiError} from '../services/publicApi'
import type {FormStatus} from '../types/type'

// The hidden field's name; bots that fill every field reveal themselves (forms/FormExtras)
export const HONEYPOT = 'website'

export const filledHoneypot = (form: HTMLFormElement): boolean => {
  const field = form.elements.namedItem(HONEYPOT)
  return field instanceof HTMLInputElement && field.value.trim() !== ''
}

export const failureStatus = (error: unknown): FormStatus =>
  !(error instanceof ApiError)
    ? 'unreachable'
    : error.status === 429
      ? 'limited'
      : error.status === 403 && error.key === 'FORM_CLOSED'
        ? 'closed'
        : 'failed'

// The server's messages for the form's own fields (400 VALIDATION_FAILED); empty otherwise.
// It names a field as `values.<key>` and words the problem as "is required" or "must be …"
export const serverFieldErrors = <K extends string>(
  error: unknown,
  fields: readonly K[],
): Partial<Record<K, string>> => {
  const found: Partial<Record<K, string>> = {}
  if (!(error instanceof ApiError) || error.status !== 400) return found
  for (const [path, message] of Object.entries(error.fieldErrors)) {
    const field = fields.find(key => path === key || path.endsWith(`.${key}`))
    if (field && !found[field]) {
      found[field] = `This field ${message.replace(/\.$/, '')}.`
    }
  }
  return found
}
