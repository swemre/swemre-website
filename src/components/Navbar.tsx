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

import {useState} from 'react'
import {Link, NavLink} from 'react-router-dom'
import {useResumeModal} from '../hooks/useResumeModal'
import {useScrolled} from '../hooks/useScrolled'
import {buttonClass} from '../utils/buttonClass'
import {cn} from '../utils/cn'
import {coverControl, coverCta} from '../utils/navTone'
import {Icon} from './Icon'
import {SearchButton} from './search/SearchButton'
import {ThemeSwitch} from './ThemeSwitch'

const links = [
  {to: '/', label: 'Home', end: true},
  {to: '/articles', label: 'Articles', end: false},
  {to: '/projects', label: 'Projects', end: false},
]

const linkClass = ({isActive}: {isActive: boolean}) =>
  cn(
    'rounded-sm px-3 py-1.5 text-sm font-medium transition-colors hover:no-underline',
    isActive
      ? 'bg-surface-muted text-fg-strong group-data-[tone=cover]/nav:bg-cover-fg/15 group-data-[tone=cover]/nav:text-cover-fg'
      : 'text-fg-muted group-data-[tone=cover]/nav:text-cover-fg/80 hover:bg-surface-muted hover:text-fg-strong group-data-[tone=cover]/nav:hover:bg-cover-fg/10 group-data-[tone=cover]/nav:hover:text-cover-fg',
  )

export function Navbar({overCover = false}: {overCover?: boolean}) {
  const scrolled = useScrolled()
  const resume = useResumeModal()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const solid = scrolled || menuOpen

  return (
    <header
      data-tone={overCover && !solid ? 'cover' : 'default'}
      className={cn(
        'group/nav fixed inset-x-0 top-0 z-30 border-b transition-[background-color,border-color,box-shadow] duration-200',
        solid
          ? 'border-border-muted bg-canvas/70 shadow-sm backdrop-blur-xl backdrop-saturate-150'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-nav w-full max-w-wide items-center gap-3 px-4 lg:gap-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="SWEMRE, home"
          className="flex items-center hover:no-underline"
        >
          <span className="inline-grid h-8 place-items-center rounded-sm bg-fg-strong px-2 font-mono text-sm font-bold tracking-wider text-canvas transition-transform duration-300 group-data-[tone=cover]/nav:bg-cover-fg group-data-[tone=cover]/nav:text-cover-ink hover:scale-105">
            SWEMRE
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={linkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
          <SearchButton />
          <button
            type="button"
            onClick={resume.open}
            data-sound="none"
            className={buttonClass(
              'primary',
              'sm',
              cn('max-sm:hidden', coverCta),
            )}
          >
            Request my resume
          </button>
          <ThemeSwitch />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
            className={cn(
              'inline-grid size-8 place-items-center rounded-sm border border-border bg-surface text-fg-muted md:hidden',
              coverControl,
            )}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile"
          className="flex animate-pop flex-col gap-1 border-t border-border-muted bg-canvas/95 px-4 py-3 backdrop-blur-xl md:hidden"
        >
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeMenu}
              className={linkClass}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => {
              closeMenu()
              resume.open()
            }}
            data-sound="none"
            className={buttonClass('primary', 'sm', 'mt-2 sm:hidden')}
          >
            Request my resume
          </button>
        </nav>
      )}
    </header>
  )
}
