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
  CallbackFormErrors,
  CallbackFormInput,
  FormStatus,
} from '../types/type'
import {buttonClass} from '../utils/buttonClass'
import {
  failureStatus,
  filledHoneypot,
  serverFieldErrors,
} from '../utils/formSubmission'
import {FormField, inputClass} from './FormField'
import {Honeypot, PrivacyNote, SubmitError} from './FormExtras'
import {validateCallbackRequest} from './validateCallbackRequest'

const EMPTY: CallbackFormInput = {
  fullName: '',
  phone: '',
  topic: '',
  preferredTime: '',
  note: '',
}
const FIELDS = Object.keys(EMPTY) as (keyof CallbackFormInput)[]

export function CallbackRequestForm({onDone}: {onDone: () => void}) {
  const contactForms = useService('contactForm')
  const sound = useSound()
  const [values, setValues] = useState<CallbackFormInput>(EMPTY)
  const [errors, setErrors] = useState<CallbackFormErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')

  const onChange =
    (field: keyof CallbackFormInput) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value = event.target.value
      setValues(current => ({...current, [field]: value}))
      setErrors(current =>
        current[field] ? {...current, [field]: undefined} : current,
      )
    }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const found = validateCallbackRequest(values)
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
      await contactForms.submitCallbackRequest(values)
      sound.play('success')
      setStatus('done')
    } catch (error) {
      sound.play('error')
      // A value the form's table rejects is shown at its field, as a local error would be
      const rejected = serverFieldErrors(error, FIELDS)
      const firstRejected = FIELDS.find(field => rejected[field])
      if (firstRejected) {
        setErrors(rejected)
        setStatus('idle')
        const element = form.elements.namedItem(firstRejected)
        if (element instanceof HTMLElement) element.focus()
        return
      }
      setStatus(failureStatus(error))
    }
  }

  if (status === 'done') {
    return (
      <div className="p-6 text-center">
        <span className="mx-auto mb-4 inline-grid size-12 place-items-center rounded-sm bg-primary-muted text-primary">
          <Icon name="check" size={22} />
        </span>
        <h2 className="text-xl font-semibold text-fg-strong">
          Call back requested
        </h2>
        <p className="mt-2 mb-6 text-sm text-fg-muted">
          Thanks, {values.fullName.trim().split(' ')[0]}. I will call you on{' '}
          <span className="font-semibold text-fg-strong">
            {values.phone.trim()}
          </span>
          {values.preferredTime ? ` in the ${values.preferredTime}` : ''}.
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
          Request a call back
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Leave your number and what you would like to talk about. I will call
          you back.
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
        <FormField label="Phone number" error={errors.phone}>
          <input
            type="tel"
            name="phone"
            value={values.phone}
            onChange={onChange('phone')}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+31 6 1234 5678"
            aria-invalid={Boolean(errors.phone)}
            className={inputClass}
          />
        </FormField>
        <FormField label="What is the call about?" error={errors.topic}>
          <textarea
            rows={3}
            name="topic"
            value={values.topic}
            onChange={onChange('topic')}
            aria-invalid={Boolean(errors.topic)}
            className={`${inputClass} resize-y`}
          />
        </FormField>
        <FormField label="Best time to call (optional)">
          <select
            name="preferredTime"
            value={values.preferredTime}
            onChange={onChange('preferredTime')}
            className={inputClass}
          >
            <option value="">Any time</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </FormField>
        <FormField label="Note (optional)" error={errors.note}>
          <textarea
            rows={2}
            name="note"
            value={values.note}
            onChange={onChange('note')}
            aria-invalid={Boolean(errors.note)}
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
          disabled={status === 'submitting' || status === 'closed'}
          className={buttonClass('primary')}
        >
          {status === 'submitting' ? 'Sending…' : 'Request call back'}
        </button>
      </div>
    </form>
  )
}
