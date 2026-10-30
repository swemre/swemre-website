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

// SiteShell: the single .a2-root with the grain, skip link, nav (+ mega menus, mobile palette,
// quick search), main and footer. It owns the chrome state, Ctrl/Cmd+K, closing overlays on
// navigation, focus to the page h1 on route change and scroll restoration (back/forward).
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {useLocation, useNavigationType} from 'react-router-dom'
import {Grain, Root, useCompact} from '../design/index.tsx'
import {useNav, useSettings} from '../data/hooks.ts'
import {ChromeContext, type ChromeApi, type MegaKey} from './context.ts'
import {SOCIAL} from './fallback.ts'
import {Nav} from './Nav.tsx'
import {MegaMenu} from './MegaMenu.tsx'
import {MobileMenu} from './MobileMenu.tsx'
import {SearchDialog} from './SearchDialog.tsx'
import {Footer} from './Footer.tsx'
import './chrome.css'

/** A click on a mega trigger within this long after hover opened it keeps the menu open. */
const HOVER_GUARD_MS = 600

function useChromeState(): ChromeApi {
  const [mega, setMega] = useState<MegaKey | null>(null)
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const [searchSeed, setSeed] = useState('')
  const hoverAt = useRef(0)
  const megaRef = useRef(mega)
  useEffect(() => {
    megaRef.current = mega
  }, [mega])

  const openMega = useCallback((k: MegaKey) => {
    if (megaRef.current === k) return
    hoverAt.current = Date.now()
    megaRef.current = k
    setMega(k)
  }, [])
  const toggleMega = useCallback((k: MegaKey) => {
    if (megaRef.current === k) {
      if (Date.now() - hoverAt.current < HOVER_GUARD_MS) return
      megaRef.current = null
      setMega(null)
    } else {
      hoverAt.current = 0
      megaRef.current = k
      setMega(k)
    }
  }, [])
  const closeMega = useCallback(() => setMega(null), [])
  const openMenu = useCallback(() => {
    setMega(null)
    setSearch(false)
    setMenu(true)
  }, [])
  const closeMenu = useCallback(() => setMenu(false), [])
  const openSearch = useCallback((seed?: string) => {
    setMega(null)
    setMenu(false)
    setSeed(seed ?? '')
    setSearch(true)
  }, [])
  const closeSearch = useCallback(() => setSearch(false), [])

  return useMemo(
    () => ({
      mega,
      menu,
      search,
      searchSeed,
      openMega,
      toggleMega,
      closeMega,
      openMenu,
      closeMenu,
      openSearch,
      closeSearch,
    }),
    [
      mega,
      menu,
      search,
      searchSeed,
      openMega,
      toggleMega,
      closeMega,
      openMenu,
      closeMenu,
      openSearch,
      closeSearch,
    ],
  )
}

/** Focus the page h1 after a route change (the page may still be loading: wait for it). */
function useRouteFocus(pathname: string) {
  const last = useRef(pathname)
  useEffect(() => {
    if (last.current === pathname) return
    last.current = pathname
    // The previous page stays on screen while the new one resolves: wait for a new h1.
    const old = document.querySelector('main h1')
    let raf = 0
    const until = Date.now() + 3000
    const tick = () => {
      const h1 = document.querySelector<HTMLElement>('main h1')
      if (h1 && (h1 !== old || Date.now() >= until)) {
        if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1')
        h1.focus({preventScroll: true})
        return
      }
      if (Date.now() < until) raf = requestAnimationFrame(tick)
      else document.getElementById('main')?.focus({preventScroll: true})
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pathname])
}

/** Back/forward restore the saved position (waiting until the page is tall enough); a new page
 * starts at the top or at its #hash; same-path replaces (filters, tabs) keep the position. */
function useScrollRestore() {
  const location = useLocation()
  const type = useNavigationType()
  const saved = useRef(new Map<string, number>())
  const keyRef = useRef(location.key)
  const pathRef = useRef(location.pathname)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const onScroll = () => saved.current.set(keyRef.current, window.scrollY)
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const samePath = pathRef.current === location.pathname
    keyRef.current = location.key
    pathRef.current = location.pathname
    let raf = 0
    let stop = false
    const cancel = () => {
      stop = true
    }
    const opts = {passive: true, once: true} as const
    window.addEventListener('wheel', cancel, opts)
    window.addEventListener('touchstart', cancel, opts)
    window.addEventListener('keydown', cancel, opts)
    const until = Date.now() + 1500

    if (type === 'POP') {
      const y = saved.current.get(location.key) ?? 0
      let stable = 0
      const tick = () => {
        if (stop) return
        if (Math.abs(window.scrollY - y) > 1) {
          stable = 0
          window.scrollTo(0, y)
        } else stable += 1
        if (Date.now() < until && stable < 30) raf = requestAnimationFrame(tick)
      }
      tick()
    } else if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1))
      const tick = () => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView()
        else if (!stop && Date.now() < until) raf = requestAnimationFrame(tick)
      }
      tick()
    } else if (!samePath) {
      window.scrollTo(0, 0)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('keydown', cancel)
    }
  }, [location.key, location.pathname, location.hash, type])
}

export function SiteShell({
  chrome,
  children,
}: {
  /** bar 'logo' = the 503 bar (logo + notice badge, no links, search or menus). */
  chrome: {
    nav: boolean
    footer: boolean
    bar?: 'full' | 'logo'
    notice?: string
  }
  children: ReactNode
}) {
  const logoOnly = chrome.bar === 'logo'
  const api = useChromeState()
  const compact = useCompact()
  const location = useLocation()
  const nav = useNav()
  const settings = useSettings()
  const {closeMega, closeMenu, closeSearch, openSearch} = api

  useRouteFocus(location.pathname)
  useScrollRestore()

  // Navigation closes every overlay.
  useEffect(() => {
    closeMega()
    closeMenu()
    closeSearch()
  }, [location.pathname, location.search, closeMega, closeMenu, closeSearch])

  // The palette is mobile/tablet only, mega menus desktop only.
  useEffect(() => {
    if (compact) closeMega()
    else closeMenu()
  }, [compact, closeMega, closeMenu])

  // Ctrl/Cmd+K opens quick search anywhere; Esc closes an open mega menu.
  const searchOpen = api.search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault()
        if (searchOpen) closeSearch()
        else openSearch()
      } else if (e.key === 'Escape') closeMega()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen, openSearch, closeSearch, closeMega])

  const s = settings.status === 'ready' ? settings.data : undefined
  return (
    <ChromeContext.Provider value={api}>
      <Root>
        <Grain />
        <a className="a2-skip" href="#main">
          Skip to content
        </a>
        {chrome.nav && (
          <div className="a2-chrome" onMouseLeave={closeMega}>
            {!logoOnly && !compact && api.mega && (
              <MegaMenu
                kind={api.mega}
                data={nav.mega[api.mega]}
                onClose={closeMega}
              />
            )}
            <Nav
              items={nav.items}
              logoOnly={logoOnly}
              notice={
                logoOnly
                  ? (chrome.notice ?? 'Maintenance in progress')
                  : undefined
              }
            />
            {!logoOnly && compact && api.menu && <MobileMenu />}
          </div>
        )}
        {api.search && !logoOnly && (
          <div className="a2-chrome">
            <SearchDialog />
          </div>
        )}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        {chrome.footer && (
          <Footer
            footer={nav.footer}
            social={s?.social ?? SOCIAL}
            statusUrl={s?.statusUrl}
          />
        )}
      </Root>
    </ChromeContext.Provider>
  )
}
