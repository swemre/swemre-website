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

import type {CallbackFormErrors, CallbackFormInput} from '../types/type'

// International or national: an optional +, then digits with spaces, dots, dashes or brackets
const PHONE = /^\+?[\d\s().-]+$/
const NOTE_LIMIT = 500

const digitCount = (phone: string) => phone.replace(/\D/g, '').length

export function validateCallbackRequest(
  values: CallbackFormInput,
): CallbackFormErrors {
  const errors: CallbackFormErrors = {}
  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.'
  }
  const phone = values.phone.trim()
  if (!PHONE.test(phone) || digitCount(phone) < 7 || digitCount(phone) > 15) {
    errors.phone =
      'Please enter a phone number with digits only, for example +31 6 1234 5678.'
  }
  if (values.topic.trim().length < 5) {
    errors.topic = 'Tell me briefly what the call is about.'
  }
  if (values.note.trim().length > NOTE_LIMIT) {
    errors.note = `Please keep the note under ${NOTE_LIMIT} characters.`
  }
  return errors
}
