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

import {useSyncExternalStore} from 'react'

const subscribe = (callback: () => void) => {
  window.addEventListener('scroll', callback, {passive: true})
  return () => window.removeEventListener('scroll', callback)
}

export const useScrolled = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => window.scrollY > 8,
    () => false,
  )
