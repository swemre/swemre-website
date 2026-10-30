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

// Public API of the design system. Owner: agent A. These are day-0 stubs with the final
// signatures; agent A replaces the bodies. Everyone else imports from here only.
import {createContext, useContext, useEffect, useState, type ReactNode} from 'react'
import type {Hue} from '../contract/view.ts'

export type Viewport = 'm' | 't' | 'd' | '4k'
export type Theme = 'dark' | 'light'

const ThemeContext = createContext<{theme: Theme; toggle(): void}>({
  theme: 'dark',
  toggle() {},
})

function viewportOf(width: number): Viewport {
  if (width < 768) return 'm'
  if (width < 1200) return 't'
  if (width < 2560) return 'd'
  return '4k'
}
const ViewportContext = createContext<Viewport>('d')

export function AppProviders({children}: {children: ReactNode}) {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  )
  const [viewport, setViewport] = useState<Viewport>(() => viewportOf(window.innerWidth))
  useEffect(() => {
    const onResize = () => setViewport(viewportOf(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle('a2-light', theme === 'light')
    localStorage.setItem('swemre:theme', theme)
  }, [theme])
  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  return (
    <ThemeContext.Provider value={{theme, toggle}}>
      <ViewportContext.Provider value={viewport}>{children}</ViewportContext.Provider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
export function useViewport(): Viewport {
  return useContext(ViewportContext)
}
/** Picks a per-viewport value: t falls back to m, k (4K) to d. */
export function useVp<T>(v: {m: T; t?: T; d: T; k?: T}): T {
  const vp = useViewport()
  if (vp === 'm') return v.m
  if (vp === 't') return v.t ?? v.m
  if (vp === '4k') return v.k ?? v.d
  return v.d
}

/** The root of every page: sets a2-root and the viewport class (a2-m a2-cmp, a2-t a2-cmp, a2-d, a2-4k). */
export function Root({
  children,
  className,
}: {
  hue?: Hue
  children: ReactNode
  className?: string
}) {
  const vp = useViewport()
  const cls = {m: 'a2-m a2-cmp', t: 'a2-t a2-cmp', d: 'a2-d', '4k': 'a2-4k'}[vp]
  return <div className={`a2-root ${cls} ${className ?? ''}`}>{children}</div>
}
