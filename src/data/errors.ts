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

import {ApiError} from '../contract/api.ts'
import type {FailureKind} from '../contract/forms.ts'
import {UNREACHABLE} from './client.ts'

const BY_KEY: Record<string, FailureKind> = {
  FORM_CLOSED: 'closed',
  RATE_LIMITED: 'limited',
  VALIDATION_FAILED: 'invalid',
  NOT_FOUND: 'failed',
  UNAVAILABLE: 'unreachable',
  TIMEOUT: 'unreachable',
  UNREACHABLE: 'unreachable',
}

/** Key problems are the site's configuration, never the visitor's. */
export const KEY_PROBLEMS = new Set([
  'API_KEY_MISSING',
  'API_KEY_INVALID',
  'API_KEY_PERMISSION_MISSING',
  'CHANNEL_READ_DENIED',
])

const logged = new Set<string>()

// FR-API-009 The failure a visitor sees comes from the answer's key; an unknown key (4-D03
// renames) falls back to the status.
export function errorKind(e: unknown): FailureKind {
  if (!(e instanceof ApiError)) return 'failed'
  const key = e.body?.key
  if (key && KEY_PROBLEMS.has(key)) {
    if (!logged.has(key)) {
      logged.add(key)
      console.error(`SWEPress refused the website key: ${key}`)
    }
    return 'failed'
  }
  if (key && key in BY_KEY) return BY_KEY[key]
  if (e.status === UNREACHABLE) return 'unreachable'
  if (e.status === 400) return 'invalid'
  if (e.status === 429) return 'limited'
  return 'failed'
}
