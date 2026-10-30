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

// Theme and viewport contexts and hooks (AppProviders in providers.tsx fills them).
import {createContext, useContext, useSyncExternalStore} from 'react'

export type Viewport = 'm' | 't' | 'd' | '4k'
export type Theme = 'dark' | 'light'

export const THEME_KEY = 'swemre:theme'

export function viewportOf(width: number): Viewport {
  if (width < 768) return 'm'
  if (width < 1200) return 't'
  if (width < 2560) return 'd'
  return '4k'
}

export const ThemeContext = createContext<{
  theme: Theme
  toggle(): void
  setTheme(t: Theme): void
}>({
  theme: 'dark',
  toggle() {},
  setTheme() {},
})
export const ViewportContext = createContext<Viewport>('d')

export function applyTheme(theme: Theme) {
  const html = document.documentElement
  html.dataset.theme = theme
  html.classList.toggle('a2-light', theme === 'light')
}

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function subscribeWidth(cb: () => void) {
  window.addEventListener('resize', cb)
  return () => window.removeEventListener('resize', cb)
}
export const widthSnapshot = () => window.innerWidth

export function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
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
/** True on mobile and tablet (the compact layouts, class a2-cmp). */
export function useCompact(): boolean {
  const vp = useViewport()
  return vp === 'm' || vp === 't'
}

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
/** prefers-reduced-motion: reduce (SVG <animate> and timers check this; CSS stops by itself). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )
}

export const ROOT_CLASS: Record<Viewport, string> = {
  m: 'a2-m a2-cmp',
  t: 'a2-t a2-cmp',
  d: 'a2-d',
  '4k': 'a2-4k',
}
