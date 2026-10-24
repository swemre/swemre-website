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

import type {MessageFormErrors, MessageFormInput} from '../types/type'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateMessage(values: MessageFormInput): MessageFormErrors {
  const errors: MessageFormErrors = {}
  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.'
  }
  if (!EMAIL.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }
  if (values.message.trim().length < 10) {
    errors.message = 'Please write a message of at least 10 characters.'
  }
  return errors
}
