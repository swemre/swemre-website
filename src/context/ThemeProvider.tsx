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

import {useEffect, useState, useSyncExternalStore, type ReactNode} from 'react'
import type {ThemeMode} from '../types/type'
import {ThemeContext} from './ThemeContext'

const KEY = 'swemre:theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function storedMode(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Storage unavailable: follow the system preference.
  }
  return null
}

const subscribeSystem = (onChange: () => void) => {
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const systemMode = (): ThemeMode =>
  window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'

// Only an explicit toggle is stored; without one the theme follows the system and its changes
export function ThemeProvider({children}: {children: ReactNode}) {
  const [chosen, setChosen] = useState<ThemeMode | null>(storedMode)
  const system = useSyncExternalStore(subscribeSystem, systemMode)
  const mode = chosen ?? system

  useEffect(() => {
    document.documentElement.dataset.theme = mode
  }, [mode])

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setChosen(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Ignore: the theme still applies for this session.
    }
  }

  return <ThemeContext value={{mode, toggle}}>{children}</ThemeContext>
}
