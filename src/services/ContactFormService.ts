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

import type {
  CallbackFormInput,
  ContactFormInput,
  MessageFormInput,
  SubmittedForm,
} from '../types/type'
import {publicApi} from './publicApi'

// Each form is a table in the CMS Data section; its key is the table's formKey and the keys
// listed here are the table's acceptedFieldKeys, so nothing else is posted
const FORMS = {
  resume: {
    key: 'cv-request',
    accepted: ['fullName', 'email', 'company', 'reason'],
  },
  callback: {
    key: 'callback-request',
    accepted: ['fullName', 'phone', 'topic', 'preferredTime', 'note'],
  },
  message: {key: 'contact', accepted: ['fullName', 'email', 'message']},
} as const

type FormName = keyof typeof FORMS

// Only accepted keys are sent, trimmed; empty optional fields are left out
const fieldsFor = (name: FormName, input: object): Record<string, string> => {
  const values = input as Record<string, string | undefined>
  const fields: Record<string, string> = {}
  for (const key of FORMS[name].accepted) {
    const value = values[key]?.trim()
    if (value) fields[key] = value
  }
  return fields
}

// A failure is thrown so the form shows an error instead of a false success
async function submit(name: FormName, input: object): Promise<SubmittedForm> {
  const {key} = FORMS[name]
  const submitted = await publicApi.submitForm(key, fieldsFor(name, input))
  if (submitted.ignoredFields?.length) {
    console.warn(
      `Form ${key} ignored ${submitted.ignoredFields.join(', ')}; its accepted fields changed in the CMS`,
    )
  }
  return submitted
}

export class ContactFormService {
  submitResumeRequest(input: ContactFormInput): Promise<SubmittedForm> {
    return submit('resume', input)
  }

  submitCallbackRequest(input: CallbackFormInput): Promise<SubmittedForm> {
    return submit('callback', input)
  }

  submitMessage(input: MessageFormInput): Promise<SubmittedForm> {
    return submit('message', input)
  }
}
