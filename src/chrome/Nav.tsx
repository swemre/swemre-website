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

// Nav (V4-Comp-Nav): the full bar on desktop and 4K (logo, Home / Articles / Projects with the
// mega menus, Search… Ctrl K, Subscribe, EN, theme) and the compact bar on mobile and tablet
// (logo, search, Subscribe, menu). is-scrolled once the page scrolls past 8 or the menu is open.
// The bar is not sticky: it slides away while scrolling down and comes back on any scroll up.
import {useEffect, useState, type MouseEvent} from 'react'
import {useLocation} from 'react-router-dom'
import {
  Anchor,
  Badge,
  Icon,
  Kbd,
  cx,
  useCompact,
  useTheme,
} from '../design/index.tsx'
import type {NavItem} from '../contract/view.ts'
import {LanguageSwitch} from './LanguageSwitch.tsx'
import {t} from '../i18n/index.ts'
import {sectionOf, useChrome, type MegaKey} from './context.ts'

/** Scrolled past 8px, and hidden while the last scroll went down past the bar's height. */
function useScrollState(): {scrolled: boolean; hidden: boolean} {
  const [state, setState] = useState(() => ({
    scrolled: window.scrollY > 8,
    hidden: false,
  }))
  useEffect(() => {
    let last = window.scrollY
    const on = () => {
      const y = window.scrollY
      const delta = y - last
      // Ignore sub-pixel jitter and elastic overscroll so the bar does not flicker.
      if (Math.abs(delta) < 4 && y > 0) return
      last = y
      setState(prev => {
        const hidden =
          y > 64 && (delta > 0 ? true : delta < 0 ? false : prev.hidden)
        const scrolled = y > 8
        return prev.hidden === hidden && prev.scrolled === scrolled
          ? prev
          : {scrolled, hidden}
      })
    }
    on()
    window.addEventListener('scroll', on, {passive: true})
    return () => window.removeEventListener('scroll', on)
  }, [])
  return state
}

/** Shows the theme a click switches to (boards: sun on dark, "Switch to light theme"). */
function ThemeIcon() {
  return <Icon name={useTheme().theme === 'light' ? 'moon' : 'sun'} />
}

export function Nav({
  items,
  logoOnly,
  notice,
}: {
  items: NavItem[]
  /** The 503 bar: logo only, no links or controls (V4-*-503). */
  logoOnly?: boolean
  /** Status badge on the right of the logo-only bar ("Maintenance in progress"). */
  notice?: string
}) {
  const compact = useCompact()
  const chrome = useChrome()
  const {theme, toggle} = useTheme()
  const {scrolled, hidden} = useScrollState()
  const [focused, setFocused] = useState(false)
  const open = chrome.menu || chrome.mega !== null
  const section = sectionOf(useLocation().pathname)
  const close = () => chrome.closeMega()
  const megaClick = (k: MegaKey) => (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    chrome.toggleMega(k)
  }
  return (
    <header
      className={cx(
        'a2-nav',
        (scrolled || open) && 'is-scrolled',
        hidden && !open && !focused && 'is-hidden',
      )}
      style={{zIndex: 47}}
      onFocus={() => setFocused(true)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false)
      }}
    >
      <div className="a2-c">
        <Anchor
          className="a2-logo"
          href="/"
          aria-label={t('nav.logo.label')}
          onMouseEnter={close}
        >
          SWEMRE
        </Anchor>
        {logoOnly ? (
          notice ? (
            <div className="a2-navright">
              <Badge label={notice} hue="lilac" dot pulse />
            </div>
          ) : null
        ) : compact ? (
          <div className="a2-navright">
            {chrome.menu ? (
              <button
                className="a2-nctl is-icon"
                type="button"
                aria-label={t('nav.menu.close')}
                aria-expanded="true"
                aria-controls="a2-menu"
                onClick={chrome.closeMenu}
              >
                <Icon name="x" size={18} />
              </button>
            ) : (
              <>
                <button
                  className="a2-nctl is-icon"
                  type="button"
                  aria-label={t('nav.search')}
                  onClick={() => chrome.openSearch()}
                >
                  <Icon name="search" size={18} />
                </button>
                <Anchor className="a2-nctl is-white" href="/newsletter">
                  <Icon name="mail" />
                  {t('nav.subscribe')}
                </Anchor>
                <button
                  className="a2-nctl is-icon"
                  type="button"
                  aria-label={t('nav.menu.open')}
                  aria-expanded="false"
                  aria-controls="a2-menu"
                  onClick={chrome.openMenu}
                >
                  <Icon name="menu" size={18} />
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <nav className="a2-navlinks" aria-label={t('nav.main')}>
              {items.map(it => {
                const open = it.mega !== undefined && chrome.mega === it.mega
                const cls = cx(
                  'a2-navlink',
                  section === it.key && 'is-active',
                  open && 'is-open',
                )
                if (!it.mega)
                  return (
                    <Anchor
                      key={it.key}
                      className={cls}
                      href={it.href}
                      onMouseEnter={close}
                      aria-current={section === it.key ? 'page' : undefined}
                    >
                      {it.label}
                    </Anchor>
                  )
                const k = it.mega
                return (
                  <Anchor
                    key={it.key}
                    className={cls}
                    href={it.href}
                    id={`a2-mega-trigger-${k}`}
                    aria-haspopup="true"
                    aria-expanded={open}
                    aria-controls={`a2-mega-${k}`}
                    onClick={megaClick(k)}
                    onKeyDown={e => {
                      if (e.key === ' ') {
                        e.preventDefault()
                        chrome.toggleMega(k)
                      }
                    }}
                    onMouseEnter={() => chrome.openMega(k)}
                  >
                    {it.label}
                    <Icon
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={12}
                    />
                  </Anchor>
                )
              })}
            </nav>
            <div className="a2-navright">
              <button
                className="a2-nctl is-search"
                type="button"
                aria-label={t('nav.search.shortcut')}
                onClick={() => chrome.openSearch()}
                onMouseEnter={close}
              >
                <Icon name="search" />
                <span>{t('nav.search.button')}</span>
                <span className="a2-kbds">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>K</Kbd>
                </span>
              </button>
              <Anchor
                className="a2-nctl is-white"
                href="/newsletter"
                onMouseEnter={close}
              >
                <Icon name="mail" size={14} />
                {t('nav.subscribe')}
              </Anchor>
              <LanguageSwitch className="a2-nctl" onMouseEnter={close} />
              <button
                className="a2-nctl is-icon"
                type="button"
                aria-label={
                  theme === 'light'
                    ? t('nav.theme.toDark')
                    : t('nav.theme.toLight')
                }
                aria-pressed={theme === 'light'}
                onClick={toggle}
                onMouseEnter={close}
              >
                <ThemeIcon />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
