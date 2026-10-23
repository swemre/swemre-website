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

import {contactFormDatabase} from '../database/contactFormDatabase'
import type {
  CallbackFormInput,
  CallbackRequest,
  ContactForm,
  ContactFormInput,
} from '../types/type'
import {ArrayService} from './ArrayService'
import {ApiError, publicRequest, workspacePath} from './apiClient'

interface SubmittedFormDto {
  submittedAt: string
}

// The form's key in swemre-website-api; its fields are defined in the CMS (Form settings)
const CV_REQUEST_FORM = 'cv-request'
const CALLBACK_REQUEST_FORM = 'callback-request'

// publicRequest answers a 404 with undefined; for a submission that means the form does not
// exist, so no confirmation is a failure.
async function submitForm(
  form: string,
  fields: Record<string, string>,
): Promise<SubmittedFormDto> {
  const submitted = await publicRequest<SubmittedFormDto>(
    `${workspacePath}/forms/${form}/submissions`,
    {method: 'POST', body: {fields}},
  )
  if (!submitted) {
    throw new ApiError(404, `Form ${form} did not confirm the submission`)
  }
  return submitted
}

export class ContactFormService extends ArrayService<ContactForm> {
  constructor() {
    super(contactFormDatabase)
  }

  // The API keeps the submission; the site only needs confirmation that it was stored.
  // A failure is thrown so the form shows an error instead of a false success.
  async submitResumeRequest(input: ContactFormInput): Promise<ContactForm> {
    const submitted = await submitForm(CV_REQUEST_FORM, {
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      reason: input.reason.trim(),
    })

    return {
      id: crypto.randomUUID(),
      kind: 'resume-request',
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      reason: input.reason.trim(),
      createdAt: submitted.submittedAt ?? new Date().toISOString(),
    }
  }

  // A form of its own in the CMS (key callback-request: fullName, phone, topic)
  async submitCallbackRequest(
    input: CallbackFormInput,
  ): Promise<CallbackRequest> {
    const submitted = await submitForm(CALLBACK_REQUEST_FORM, {
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      topic: input.topic.trim(),
    })

    return {
      id: crypto.randomUUID(),
      kind: 'callback-request',
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      topic: input.topic.trim(),
      createdAt: submitted.submittedAt ?? new Date().toISOString(),
    }
  }
}
