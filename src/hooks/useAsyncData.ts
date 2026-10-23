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

import {useEffect, useState} from 'react'
import type {AsyncResult, AsyncSettled} from '../types/type'

/**
 * Runs `loader` and reports its result or its error. `loader` must be referentially stable
 * (wrap it in useCallback); a new loader or `retry()` starts a new load.
 */
export function useAsyncData<T>(loader: () => Promise<T>): AsyncResult<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<AsyncSettled<T> | null>(null)

  useEffect(() => {
    let live = true
    loader().then(
      data => {
        if (live) setSettled({loader, attempt, data})
      },
      (error: unknown) => {
        console.warn('swemre-website-api request failed', error)
        if (live) setSettled({loader, attempt, error: error ?? 'failed'})
      },
    )
    return () => {
      live = false
    }
  }, [loader, attempt])

  const ready =
    settled !== null && settled.loader === loader && settled.attempt === attempt
  return {
    data: ready ? settled.data : undefined,
    loading: !ready,
    error: ready ? settled.error : undefined,
    retry: () => setAttempt(value => value + 1),
  }
}
