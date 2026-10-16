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

import {useEffect, useState, type ReactNode} from 'react'
import type {ThemeMode} from '../types/type'
import {ThemeContext} from './ThemeContext'

const KEY = 'swemre:theme'

function initialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Storage unavailable: fall through to the system preference.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({children}: {children: ReactNode}) {
  const [mode, setMode] = useState<ThemeMode>(initialMode)

  useEffect(() => {
    document.documentElement.dataset.theme = mode
    try {
      localStorage.setItem(KEY, mode)
    } catch {
      // Ignore: the theme still applies for this session.
    }
  }, [mode])

  const toggle = () => setMode(m => (m === 'dark' ? 'light' : 'dark'))

  return <ThemeContext value={{mode, toggle}}>{children}</ThemeContext>
}
