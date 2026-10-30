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

// Chrome state shared by the nav, mega menus, palette and quick search, so any page can open
// search (Ctrl+K anywhere) and navigation closes every overlay.
import {createContext, useContext} from 'react'

export type MegaKey = 'articles' | 'projects'

export interface ChromeApi {
  mega: MegaKey | null
  menu: boolean
  search: boolean
  /** Text the quick search opens with. */
  searchSeed: string
  openMega(k: MegaKey): void
  toggleMega(k: MegaKey): void
  closeMega(): void
  openMenu(): void
  closeMenu(): void
  openSearch(seed?: string): void
  closeSearch(): void
}

export const ChromeContext = createContext<ChromeApi | null>(null)

/** Open the quick search, the menu or a mega menu from anywhere inside SiteShell. */
export function useChrome(): ChromeApi {
  const c = useContext(ChromeContext)
  if (!c) throw new Error('useChrome outside SiteShell')
  return c
}

export type Section = 'home' | 'articles' | 'projects' | 'none'

/** Which nav item is active for a path (Articles on articles, topic and article pages...). */
export function sectionOf(pathname: string): Section {
  if (pathname === '/') return 'home'
  if (pathname === '/articles' || pathname.startsWith('/articles/'))
    return 'articles'
  if (pathname === '/projects' || pathname.startsWith('/projects/'))
    return 'projects'
  return 'none'
}
