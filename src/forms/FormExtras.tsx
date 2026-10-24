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

import {Link} from 'react-router-dom'
import {siteConfig} from '../config/site'
import type {FormStatus} from '../types/type'
import {HONEYPOT} from '../utils/formSubmission'

// Hidden from people and assistive technology; bots that fill every field reveal themselves
export function Honeypot() {
  return (
    <div aria-hidden="true" className="sr-only">
      <label>
        Website
        <input
          name={HONEYPOT}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  )
}

const failures: Partial<Record<FormStatus, string>> = {
  failed: 'The request could not be sent. Please try again later.',
  unreachable:
    'The server cannot be reached. Check your connection and try again; what you entered is kept.',
  limited: 'Too many requests. Please wait a few minutes and try again.',
  closed: 'This form is closed.',
}

export function SubmitError({status}: {status: FormStatus}) {
  const message = failures[status]
  return message ? (
    <p role="alert" className="mb-4 text-sm text-danger">
      {message}
    </p>
  ) : null
}

// Opens in a new tab so the dialog and what was typed stay as they are
export function PrivacyNote() {
  return (
    <p className="mr-auto self-center text-xs text-fg-muted">
      See the{' '}
      <Link
        to={siteConfig.privacyPath}
        target="_blank"
        rel="noreferrer noopener"
        className="text-primary underline underline-offset-2"
      >
        privacy policy
        <span className="sr-only"> (opens in a new tab)</span>
      </Link>{' '}
      ↗ for what happens to your details.
    </p>
  )
}
