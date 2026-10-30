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

// The token outcome of a newsletter link, kept per token for the page's life: the confirm and
// unsubscribe calls spend the token, so a second render (StrictMode, back/forward) must reuse the
// first answer instead of asking again.
import {useEffect, useState} from 'react'
import {
  confirmSubscription,
  unsubscribe,
  type NewsletterOutcome,
  type Subscriber,
} from '../../forms/index.tsx'

export type Kind = 'confirmed' | 'unsubscribed'
export type Outcome =
  NewsletterOutcome<Subscriber> | NewsletterOutcome<{receivedAt: string}>

const cache = new Map<string, Promise<Outcome>>()

function call(kind: Kind, token: string, attempt: number): Promise<Outcome> {
  const key = `${kind}:${token}:${attempt}`
  let p = cache.get(key)
  if (!p) {
    p = kind === 'confirmed' ? confirmSubscription(token) : unsubscribe({token})
    cache.set(key, p)
  }
  return p
}

/** undefined while the call runs; an outcome after. No token counts as an expired link. */
export function useTokenOutcome(kind: Kind, token: string | undefined) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{key: string; outcome: Outcome}>()
  const key = `${kind}:${token ?? ''}:${attempt}`
  useEffect(() => {
    if (!token) return
    let live = true
    void call(kind, token, attempt).then(outcome => {
      if (live) setState({key, outcome})
    })
    return () => {
      live = false
    }
  }, [kind, token, attempt, key])
  const outcome: Outcome | undefined = !token
    ? {ok: false, reason: 'expired', status: 400}
    : state?.key === key
      ? state.outcome
      : undefined
  return {outcome, retry: () => setAttempt(n => n + 1)}
}
