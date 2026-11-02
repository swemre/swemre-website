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
// The newsletter sign-up, used by the home page's subscribe block. API 1.9 has no confirm or
// unsubscribe step: saving the entry is the whole sign-up. Owner: agent C.
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

/** Signs up for the newsletter. A 400 comes back with the server's message per field. */
export async function subscribe(values: Record<string, FormValue>): Promise<
  | {ok: true; value: {receivedAt: string}}
  | {
      ok: false
      status: number
      fields: Record<string, string>
      requestId?: string
    }
> {
  try {
    const res = await api.submit('newsletter', values)
    return {ok: true, value: {receivedAt: res.receivedAt}}
  } catch (e) {
    const err = e instanceof ApiError ? e : undefined
    return {
      ok: false,
      status: err?.status ?? 0,
      fields: Object.fromEntries(
        (err?.body?.errors ?? []).map(x => [x.field, x.message]),
      ),
      requestId: err?.body?.requestId,
    }
  }
}
