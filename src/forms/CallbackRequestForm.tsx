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
import type {CallbackFormErrors, CallbackFormInput} from '../types/type'
import {buttonClass} from '../utils/buttonClass'
import {FormField, inputClass} from './FormField'
import {validateCallbackRequest} from './validateCallbackRequest'

const EMPTY: CallbackFormInput = {fullName: '', phone: '', topic: ''}

export function CallbackRequestForm({onDone}: {onDone: () => void}) {
  const contactForms = useService('contactForm')
  const sound = useSound()
  const [values, setValues] = useState<CallbackFormInput>(EMPTY)
  const [errors, setErrors] = useState<CallbackFormErrors>({})
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'done' | 'failed'
  >('idle')

  const onChange =
    (field: keyof CallbackFormInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues(current => ({...current, [field]: event.target.value}))

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validateCallbackRequest(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      sound.play('error')
      return
    }
    setStatus('submitting')
    try {
      await contactForms.submitCallbackRequest(values)
      sound.play('success')
      setStatus('done')
    } catch {
      sound.play('error')
      setStatus('failed')
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
      <div className="border-b border-border-muted px-6 pt-6 pb-4">
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
