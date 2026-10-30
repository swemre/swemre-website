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

// AppProviders: the theme lives on <html> (data-theme + a2-light) and in localStorage
// swemre:theme; the viewport follows the window width (m < 768 <= t < 1200 <= d < 2560 <= 4k).
// On 4K the 1920 layout is zoomed to the window width through --a2-zoom.
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  THEME_KEY,
  ThemeContext,
  ViewportContext,
  applyTheme,
  readStoredTheme,
  readTheme,
  subscribeWidth,
  viewportOf,
  widthSnapshot,
  type Theme,
} from './context.ts'

export function AppProviders({children}: {children: ReactNode}) {
  const [theme, setThemeState] = useState<Theme>(readTheme)
  const width = useSyncExternalStore(subscribeWidth, widthSnapshot, () => 1440)
  const viewport = viewportOf(width)

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // storage blocked: the theme still applies for this visit
    }
  }, [theme])

  // 4K: zoom the 1920 layout to the window width (exactly 2 at 3840).
  useEffect(() => {
    const style = document.documentElement.style
    if (viewport === '4k') style.setProperty('--a2-zoom', String(width / 1920))
    else style.removeProperty('--a2-zoom')
  }, [viewport, width])

  // Print is always light; the visitor's theme comes back afterwards.
  useEffect(() => {
    const before = () => applyTheme('light')
    const after = () => applyTheme(readStoredTheme())
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const toggle = useCallback(
    () => setThemeState(t => (t === 'dark' ? 'light' : 'dark')),
    [],
  )
  const value = useMemo(
    () => ({theme, toggle, setTheme}),
    [theme, toggle, setTheme],
  )
  return (
    <ThemeContext.Provider value={value}>
      <ViewportContext.Provider value={viewport}>
        {children}
      </ViewportContext.Provider>
    </ThemeContext.Provider>
  )
}
