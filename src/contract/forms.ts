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

// Forms: specs, state machine and validation rules from the V4 playables. Owner: agent C.
// Field components (Field, Checkbox, Chip, StatusLine, SubmitRow, Receipt) come from agent A.
import type {ApiSubmittedForm, FormKey} from './api.ts'

export type FieldKind =
  'text' | 'email' | 'tel' | 'contact' | 'select' | 'area' | 'check' | 'chips'

export interface FieldSpec {
  /** API field key. */
  key: string
  kind: FieldKind
  label: string
  hint?: string
  placeholder?: string
  required?: boolean
  optional?: boolean
  /** Shown under the field when it is invalid. */
  error?: string
  /** The name in the error summary ("Consent" for the consent box); default label. */
  summaryLabel?: string
  options?: {value: string; label: string}[]
  initial?: string | boolean | string[]
}

export interface FormSpec {
  key: FormKey
  route: string
  fields: FieldSpec[]
  submitLabel: string
}

export type FormState =
  'default' | 'errors' | 'submitting' | 'success' | 'failure'
export type FailureKind =
  'closed' | 'limited' | 'invalid' | 'unreachable' | 'failed'
export type FormValues = Record<string, string | boolean | string[]>

export interface FormMachine {
  state: FormState
  values: FormValues
  errors: Record<string, string>
  failure?: FailureKind
  receipt?: ApiSubmittedForm
  set(key: string, value: string | boolean | string[]): void
  /** Validates; on errors focuses and scrolls to the first bad field. */
  submit(): Promise<void>
  reset(): void
}

/** From the playable: email /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; contact = email or >= 9 digits. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
