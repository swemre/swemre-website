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

const PHONE = /^\+?[\d\s().-]{7,20}$/

export function validateCallbackRequest(
  values: CallbackFormInput,
): CallbackFormErrors {
  const errors: CallbackFormErrors = {}
  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.'
  }
  if (!PHONE.test(values.phone.trim())) {
    errors.phone = 'Please enter a phone number I can call.'
  }
  if (values.topic.trim().length < 5) {
    errors.topic = 'Tell me briefly what the call is about.'
  }
  return errors
}
