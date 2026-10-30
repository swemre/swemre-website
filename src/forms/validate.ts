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
// Client-side validation (the playable's rules), the generated error summary and the wire
// fields. Owner: agent C.
import type {FormValue} from '../contract/api.ts'
import {EMAIL_RE, type FieldSpec, type FormValues} from '../contract/forms.ts'
import type {FormDef} from './specs.ts'

export function initialValues(def: FormDef): FormValues {
  return Object.fromEntries(
    def.fields.map(f => [
      f.key,
      f.initial ?? (f.kind === 'check' ? false : f.kind === 'chips' ? [] : ''),
    ]),
  )
}

/** True when the value breaks the field's rule. Optional fields are never invalid. */
export function isInvalid(
  f: FieldSpec,
  v: FormValues[string] | undefined,
): boolean {
  if (!f.required) return false
  const s = typeof v === 'string' ? v.trim() : ''
  switch (f.kind) {
    case 'check':
      return v !== true
    case 'chips':
      return !Array.isArray(v) || v.length === 0
    case 'email':
      return !EMAIL_RE.test(s)
    case 'contact':
      return !(EMAIL_RE.test(s) || s.replace(/\D/g, '').length >= 9)
    default:
      return s.length === 0
  }
}

/** field key -> message, in form order. */
export function validate(
  def: FormDef,
  values: FormValues,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const f of def.fields) {
    if (isInvalid(f, values[f.key])) errors[f.key] = f.error ?? 'Fill this in.'
  }
  return errors
}

/** "3 fields need a fix: Email, Message and Consent." / "1 field needs a fix: Email." */
export function errorSummary(
  def: FormDef,
  errors: Record<string, string>,
): string {
  const names = def.fields
    .filter(f => f.key in errors)
    .map(f => f.summaryLabel ?? f.label)
  if (names.length === 0) return ''
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  return names.length === 1
    ? `1 field needs a fix: ${list}.`
    : `${names.length} fields need a fix: ${list}.`
}

/** The submission body's fields: trimmed strings, empty optional values as null. */
export function wireFields(
  def: FormDef,
  values: FormValues,
): Record<string, FormValue> {
  const out: Record<string, FormValue> = {}
  for (const f of def.fields) {
    const v = values[f.key]
    out[f.key] = typeof v === 'string' ? v.trim() || null : (v ?? null)
  }
  return out
}
