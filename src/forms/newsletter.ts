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
// The newsletter confirm and unsubscribe calls behind /newsletter/confirmed and
// /newsletter/unsubscribed. Both are form submissions of public API v2 (newsletter-confirm,
// newsletter-unsubscribe); the confirm answer carries the subscriber in `result`. Owner: agent C.
import {ApiError, type FormValue} from '../contract/api.ts'
import {api} from '../data/client.ts'

export interface Subscriber {
  name?: string
  email: string
  /** Topic slugs (java, react, ai, architecture). */
  topics: string[]
}

export type NewsletterOutcome<T> =
  | {ok: true; value: T}
  /** expired: the token is unknown or used up (400 on the token); failed: anything else. */
  | {
      ok: false
      reason: 'expired' | 'failed'
      status: number
      requestId?: string
    }

function failure(e: unknown): {
  ok: false
  reason: 'expired' | 'failed'
  status: number
  requestId?: string
} {
  if (e instanceof ApiError) {
    const onToken = e.body?.errors?.some(x => x.field === 'token')
    return {
      ok: false,
      reason: e.status === 400 && onToken ? 'expired' : 'failed',
      status: e.status,
      requestId: e.body?.requestId,
    }
  }
  return {ok: false, reason: 'failed', status: 0}
}

const text = (v: FormValue | undefined) => (typeof v === 'string' ? v : '')

/** Confirms a sign-up from the link in the confirmation email. */
export async function confirmSubscription(
  token: string,
): Promise<NewsletterOutcome<Subscriber>> {
  try {
    const res = await api.submit('newsletter-confirm', {token})
    const r = res.result ?? {}
    return {
      ok: true,
      value: {
        name: text(r.name) || undefined,
        email: text(r.email),
        topics: Array.isArray(r.topics) ? r.topics : [],
      },
    }
  } catch (e) {
    return failure(e)
  }
}

/** Unsubscribes by the token of an email link, or by address. */
export async function unsubscribe(
  by: {token: string} | {email: string},
): Promise<NewsletterOutcome<{receivedAt: string}>> {
  try {
    const fields: Record<string, FormValue> =
      'token' in by ? {token: by.token} : {email: by.email}
    const res = await api.submit('newsletter-unsubscribe', fields)
    return {ok: true, value: {receivedAt: res.receivedAt}}
  } catch (e) {
    return failure(e)
  }
}
