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

import type {ContactFormErrors, ContactFormInput} from '../types/type'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateResumeRequest(
  values: ContactFormInput,
): ContactFormErrors {
  const errors: ContactFormErrors = {}
  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.'
  }
  if (!EMAIL.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }
  if (values.reason.trim().length < 10) {
    errors.reason = 'Tell me a little more (at least 10 characters).'
  }
  return errors
}
