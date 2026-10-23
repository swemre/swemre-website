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
import {ApiError} from '../services/publicApi'
import type {CallbackFormErrors, CallbackFormInput} from '../types/type'
import {buttonClass} from '../utils/buttonClass'
import {FormField, inputClass} from './FormField'
import {validateCallbackRequest} from './validateCallbackRequest'

const EMPTY: CallbackFormInput = {fullName: '', phone: '', topic: ''}
const FIELDS = Object.keys(EMPTY) as (keyof CallbackFormInput)[]

export function CallbackRequestForm({onDone}: {onDone: () => void}) {
  const contactForms = useService('contactForm')
  const sound = useSound()
  const [values, setValues] = useState<CallbackFormInput>(EMPTY)
  const [errors, setErrors] = useState<CallbackFormErrors>({})
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'done' | 'failed' | 'unreachable'
  >('idle')

  const onChange =
    (field: keyof CallbackFormInput) =>
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
    const found = validateCallbackRequest(values)
    setErrors(found)
    const firstInvalid = FIELDS.find(field => found[field])
    if (firstInvalid) {
      sound.play('error')
      const element = form.elements.namedItem(firstInvalid)
      if (element instanceof HTMLElement) element.focus()
      return
    }
    setStatus('submitting')
    try {
      await contactForms.submitCallbackRequest(values)
      sound.play('success')
      setStatus('done')
    } catch (error) {
      sound.play('error')
      setStatus(error instanceof ApiError ? 'failed' : 'unreachable')
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
          {values.phone.trim()}.
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
        {status === 'failed' && (
          <p role="alert" className="mb-4 text-sm text-danger">
            The request could not be sent. Please try again later.
          </p>
        )}
        {status === 'unreachable' && (
          <p role="alert" className="mb-4 text-sm text-danger">
            The server cannot be reached. Check your connection and try again;
            what you entered is kept.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-border-muted bg-surface-muted px-6 py-3">
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
          {status === 'submitting' ? 'Sending…' : 'Request call back'}
        </button>
      </div>
    </form>
  )
}
