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

import {useState, type ChangeEvent, type FormEvent} from 'react'
import {Icon} from '../components/Icon'
import {useService} from '../hooks/useService'
import {useSound} from '../hooks/useSound'
import type {
  ContactFormErrors,
  ContactFormInput,
  FormStatus,
} from '../types/type'
import {buttonClass} from '../utils/buttonClass'
import {failureStatus, filledHoneypot} from '../utils/formSubmission'
import {FormField, inputClass} from './FormField'
import {Honeypot, PrivacyNote, SubmitError} from './FormExtras'
import {validateResumeRequest} from './validateResumeRequest'

const EMPTY: ContactFormInput = {fullName: '', email: '', reason: ''}
const FIELDS = Object.keys(EMPTY) as (keyof ContactFormInput)[]

export function ResumeRequestForm({onDone}: {onDone: () => void}) {
  const contactForms = useService('contactForm')
  const sound = useSound()
  const [values, setValues] = useState<ContactFormInput>(EMPTY)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')

  const onChange =
    (field: keyof ContactFormInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setValues(current => ({...current, [field]: value}))
      setErrors(current =>
        current[field] ? {...current, [field]: undefined} : current,
      )
    }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const found = validateResumeRequest(values)
    setErrors(found)
    const firstInvalid = FIELDS.find(field => found[field])
    if (firstInvalid) {
      sound.play('error')
      const element = form.elements.namedItem(firstInvalid)
      if (element instanceof HTMLElement) element.focus()
      return
    }
    // A bot filled the hidden field: it sees the usual confirmation, nothing is sent
    if (filledHoneypot(form)) {
      setStatus('done')
      return
    }
    setStatus('submitting')
    try {
      await contactForms.submitResumeRequest(values)
      sound.play('success')
      setStatus('done')
    } catch (error) {
      sound.play('error')
      setStatus(failureStatus(error))
    }
  }

  if (status === 'done') {
    return (
      <div className="p-6 text-center">
        <span className="mx-auto mb-4 inline-grid size-12 place-items-center rounded-full bg-success-muted text-success">
          <Icon name="check" size={22} />
        </span>
        <h2 className="text-xl font-semibold text-fg-strong">
          Request received
        </h2>
        <p className="mt-2 mb-6 text-sm text-fg-muted">
          Thanks, {values.fullName.trim().split(' ')[0]}. I will review your
          request and reply to {values.email.trim()}.
        </p>
        <button
          type="button"
          onClick={onDone}
          className={buttonClass('primary')}
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="border-b border-border-muted pt-6 pr-14 pb-4 pl-6">
        <h2 className="text-xl font-semibold text-fg-strong">
          Request my resume
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Tell me who you are and why you would like it. I will get back to you.
        </p>
      </div>

      <div className="px-6 pt-5 pb-1">
        <FormField label="Full name" error={errors.fullName}>
          <input
            name="fullName"
            value={values.fullName}
            onChange={onChange('fullName')}
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Email address" error={errors.email}>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={onChange('email')}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Why would you like my resume?" error={errors.reason}>
          <textarea
            rows={4}
            name="reason"
            value={values.reason}
            onChange={onChange('reason')}
            aria-invalid={Boolean(errors.reason)}
            className={`${inputClass} resize-y`}
          />
        </FormField>
        <SubmitError status={status} />
        <Honeypot />
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border-muted bg-surface-muted px-6 py-3">
        <PrivacyNote />
        <button
          type="button"
          onClick={onDone}
          data-sound="cancel"
          className={buttonClass()}
        >
          Cancel
        </button>
        <button
          type="submit"
          data-sound="none"
          disabled={status === 'submitting'}
          className={buttonClass('primary')}
        >
          {status === 'submitting' ? 'Sending…' : 'Send request'}
        </button>
      </div>
    </form>
  )
}
