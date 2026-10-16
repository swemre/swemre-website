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
import type {ContactForm, ContactFormInput} from '../types/type'
import {ArrayService} from './ArrayService'
import {publicRequest, workspacePath} from './apiClient'

interface SubmittedContactRequestDto {
  submittedAt: string
}

export class ContactFormService extends ArrayService<ContactForm> {
  constructor() {
    super(contactFormDatabase)
  }

  // The API keeps the submission; the site only needs confirmation that it was stored.
  // A failure is thrown so the form shows an error instead of a false success.
  async submitResumeRequest(input: ContactFormInput): Promise<ContactForm> {
    const submitted = await publicRequest<SubmittedContactRequestDto>(
      `${workspacePath}/contact-requests`,
      {
        method: 'POST',
        body: {
          kind: 'RESUME_REQUEST',
          fullName: input.fullName.trim(),
          email: input.email.trim(),
          reason: input.reason.trim(),
        },
      },
    )

    return {
      id: crypto.randomUUID(),
      kind: 'resume-request',
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      reason: input.reason.trim(),
      createdAt: submitted?.submittedAt ?? new Date().toISOString(),
    }
  }
}
