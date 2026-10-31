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

// The mock's form tables: accepted field keys and server-side validation per form key, as the
// CMS Data tables would enforce them. Owner: agent C.

type Rule = 'required' | 'email' | 'contact' | 'true' | 'optional'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const FORMS: Record<string, Record<string, Rule>> = {
  newsletter: {
    name: 'optional',
    email: 'email',
    role: 'optional',
    source: 'optional',
    topics: 'optional',
    consent: 'true',
  },
  contact: {
    fullname: 'optional',
    email: 'email',
    phone: 'optional',
    describesyou: 'optional',
    foundvia: 'optional',
    favouritelanguage: 'optional',
    message: 'required',
    consent: 'true',
    newsletteroptin: 'optional',
  },
  'callback-request': {
    fullname: 'optional',
    contact: 'contact',
    preferredtime: 'required',
    timezone: 'optional',
    topic: 'required',
    note: 'optional',
    consent: 'true',
  },
  'newsletter-confirm': {token: 'required'},
  'newsletter-unsubscribe': {token: 'optional', email: 'optional'},
}

const MESSAGES: Record<Rule, string> = {
  required: 'This field is required.',
  email: 'Enter a full email address.',
  contact: 'Enter a full phone number or an email.',
  true: 'This must be ticked.',
  optional: '',
}

export type Outcome =
  | {kind: 'unknown'}
  | {
      kind: 'ok'
      errors: {field: string; message: string}[]
      ignored: string[]
    }

export function validateSubmission(
  key: string,
  fields: Record<string, unknown>,
): Outcome {
  const table = FORMS[key]
  if (!table) return {kind: 'unknown'}
  const errors: {field: string; message: string}[] = []
  for (const [field, rule] of Object.entries(table)) {
    const v = fields[field]
    const s =
      typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.join(', ') : ''
    const bad =
      (rule === 'required' && !s) ||
      (rule === 'email' && !EMAIL_RE.test(s)) ||
      (rule === 'contact' &&
        !(EMAIL_RE.test(s) || s.replace(/\D/g, '').length >= 9)) ||
      (rule === 'true' && v !== true) ||
      (rule === 'optional' &&
        field === 'email' &&
        s !== '' &&
        !EMAIL_RE.test(s))
    if (bad)
      errors.push({
        field,
        message: MESSAGES[rule === 'optional' ? 'email' : rule],
      })
  }
  if (key === 'newsletter-unsubscribe' && !fields.token && !fields.email) {
    errors.push({field: 'token', message: 'A token or an email is required.'})
  }
  if (
    key === 'newsletter-confirm' &&
    /^(invalid|expired)$/.test(String(fields.token))
  ) {
    errors.push({
      field: 'token',
      message: 'This link has expired. Subscribe again to get a new one.',
    })
  }
  const ignored = Object.keys(fields).filter(f => !(f in table))
  return {kind: 'ok', errors, ignored}
}
