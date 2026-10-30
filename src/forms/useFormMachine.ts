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
// The form state machine of the playables: default -> errors | submitting; submitting ->
// success | failure; failure -> (Try again) -> submitting. A retry validates again. While
// submitting a second submit is ignored. Errors and success scroll their target into view
// (112 px under the top, 88 on mobile) and move focus there. Owner: agent C.
import {useCallback, useMemo, useRef, useState} from 'react'
import {
  ApiError,
  type ApiSubmittedForm,
  type FormValue,
} from '../contract/api.ts'
import type {
  FailureKind,
  FormMachine,
  FormState,
  FormValues,
} from '../contract/forms.ts'
import {UNREACHABLE} from '../data/client.ts'
import {api} from '../data/client.ts'
import type {FormDef} from './specs.ts'
import {initialValues, validate, wireFields} from './validate.ts'

/** What the newsletter panels show: the last request and its answer. */
export interface Exchange {
  fields: Record<string, FormValue>
  status?: number
  statusText?: string
  body?: unknown
}

export interface Machine extends FormMachine {
  def: FormDef
  failureStatus?: number
  exchange?: Exchange
  /** Field ids by key, so errors can focus them. */
  fieldId(key: string): string
  /** The honeypot: a filled one fakes success and sends nothing. */
  honeypot: string
  setHoneypot(v: string): void
}

const OFFSET = {m: 88, other: 112}

function failureOf(e: unknown): FailureKind {
  if (!(e instanceof ApiError)) return 'failed'
  if (e.status === UNREACHABLE) return 'unreachable'
  if (e.status === 403) return 'closed'
  if (e.status === 429) return 'limited'
  if (e.status === 400) return 'invalid'
  return 'failed'
}

export const STATUS_TEXT: Record<number, string> = {
  201: 'Created',
  400: 'Bad Request',
  403: 'Forbidden',
  404: 'Not Found',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
}

function scrollToEl(el: Element | null, compact: boolean) {
  if (!el) return
  const top =
    el.getBoundingClientRect().top +
    window.scrollY -
    (compact ? OFFSET.m : OFFSET.other)
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto'})
  if (el instanceof HTMLElement) el.focus({preventScroll: true})
}

export function useFormMachine(
  def: FormDef,
  opts: {compact: boolean; idPrefix: string; initial?: FormValues},
): Machine {
  const [state, setState] = useState<FormState>('default')
  const [values, setValues] = useState<FormValues>(() => ({
    ...initialValues(def),
    ...opts.initial,
  }))
  const [failure, setFailure] = useState<FailureKind>()
  const [failureStatus, setFailureStatus] = useState<number>()
  const [receipt, setReceipt] = useState<ApiSubmittedForm>()
  const [exchange, setExchange] = useState<Exchange>()
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const [honeypot, setHoneypot] = useState('')
  const busy = useRef(false)
  const fieldId = useCallback(
    (key: string) => `${opts.idPrefix}-${key}`,
    [opts.idPrefix],
  )

  // In the errors state the messages follow the values live, so a fixed field clears at once.
  const errors = useMemo(
    () =>
      state === 'errors' ? {...serverErrors, ...validate(def, values)} : {},
    [state, def, values, serverErrors],
  )

  const set = useCallback((key: string, value: string | boolean | string[]) => {
    setValues(v => ({...v, [key]: value}))
    setServerErrors(e => {
      if (!(key in e)) return e
      const next = {...e}
      delete next[key]
      return next
    })
  }, [])

  const focusFirstError = useCallback(
    (bad: Record<string, string>) => {
      const first = def.fields.find(f => f.key in bad)
      if (!first) return
      requestAnimationFrame(() =>
        scrollToEl(document.getElementById(fieldId(first.key)), opts.compact),
      )
    },
    [def, fieldId, opts.compact],
  )

  const submit = useCallback(async () => {
    if (busy.current) return
    const bad = validate(def, values)
    if (Object.keys(bad).length) {
      setServerErrors({})
      setState('errors')
      focusFirstError(bad)
      return
    }
    const fields = wireFields(def, values)
    busy.current = true
    setState('submitting')
    setExchange({fields})
    try {
      const res = honeypot
        ? {id: 'honeypot', receivedAt: new Date().toISOString()}
        : await api.submit(def.key, fields)
      setReceipt(res)
      setExchange({
        fields,
        status: 201,
        statusText: STATUS_TEXT[201],
        body: res,
      })
      setState('success')
      requestAnimationFrame(() =>
        scrollToEl(
          document.getElementById(`${opts.idPrefix}-receipt`),
          opts.compact,
        ),
      )
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0
      setExchange({
        fields,
        status,
        statusText: STATUS_TEXT[status] ?? (status ? '' : 'No answer'),
        body: e instanceof ApiError ? e.body : undefined,
      })
      const kind = failureOf(e)
      const fieldErrors = e instanceof ApiError ? (e.body?.errors ?? []) : []
      if (kind === 'invalid' && fieldErrors.length) {
        const mapped = Object.fromEntries(
          fieldErrors.map(x => [x.field, x.message]),
        )
        setServerErrors(mapped)
        setState('errors')
        focusFirstError(mapped)
      } else {
        setFailure(kind)
        setFailureStatus(status)
        setState('failure')
      }
    } finally {
      busy.current = false
    }
  }, [def, values, honeypot, focusFirstError, opts.compact, opts.idPrefix])

  const reset = useCallback(() => {
    setState('default')
    setValues(initialValues(def))
    setFailure(undefined)
    setReceipt(undefined)
    setExchange(undefined)
    setServerErrors({})
  }, [def])

  return {
    def,
    state,
    values,
    errors,
    failure,
    failureStatus,
    receipt,
    exchange,
    set,
    submit,
    reset,
    fieldId,
    honeypot,
    setHoneypot,
  }
}
