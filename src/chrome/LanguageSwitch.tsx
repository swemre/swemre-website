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

// The language menu: a button with the current language (globe, code, chevron) that opens the
// design system's dropdown listing every language in its own name. Each entry is a plain link to
// the same page under that language's prefix, so the page reloads in it (texts are per load).
// Esc or a click outside closes it; arrow keys move between the entries.
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEventHandler,
  type ReactNode,
} from 'react'
import {Icon, cx} from '../design/index.tsx'
import {LANGUAGE_NAMES, LOCALES, locale, t} from '../i18n/index.ts'
import {useLocaleHref} from './language.ts'

export function LanguageSwitch({
  className,
  style,
  align = 'right',
  up,
  block,
  onMouseEnter,
  children,
}: {
  className?: string
  style?: CSSProperties
  /** Which edge of the button the list lines up with. */
  align?: 'left' | 'right'
  /** Open the list above the button (the mobile menu's bottom row). */
  up?: boolean
  /** Fill the parent's width (a grid cell). */
  block?: boolean
  onMouseEnter?: MouseEventHandler
  /** The button's content; the nav's globe, code and chevron by default. */
  children?: ReactNode
}) {
  const id = useId()
  const root = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const href = useLocaleHref()

  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Only this list closes; the mobile menu around it stays open.
      e.stopPropagation()
      setOpen(false)
      root.current?.querySelector('button')?.focus()
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc, true)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc, true)
    }
  }, [open])

  const links = () =>
    Array.from(root.current?.querySelectorAll<HTMLElement>('a') ?? [])
  const focusAt = (i: number) => {
    const all = links()
    all.at(((i % all.length) + all.length) % all.length)?.focus()
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    if (!open) {
      setOpen(true)
      requestAnimationFrame(() => focusAt(LOCALES.indexOf(locale)))
      return
    }
    const at = links().indexOf(document.activeElement as HTMLElement)
    focusAt(e.key === 'ArrowDown' ? at + 1 : at - 1)
  }

  return (
    <span
      ref={root}
      className={cx('a2-langmenu', open && 'is-open', block && 'is-block')}
      onKeyDown={onKey}
    >
      <button
        type="button"
        className={className}
        style={style}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        aria-label={t('language.menu.label', {current: LANGUAGE_NAMES[locale]})}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={onMouseEnter}
      >
        {children ?? (
          <>
            <Icon name="globe" />
            {locale.toUpperCase()}
            <span className="a2-chev" aria-hidden="true">
              <Icon name="chevron-down" size={14} />
            </span>
          </>
        )}
      </button>
      {open && (
        <ul
          className={cx('a2-select-pop', `is-${align}`, up && 'is-up')}
          id={id}
        >
          {LOCALES.map(l => (
            <li key={l}>
              <a
                className={cx('a2-select-opt', l === locale && 'is-current')}
                href={href(l)}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? 'true' : undefined}
                onClick={e => {
                  if (l !== locale) return
                  e.preventDefault()
                  setOpen(false)
                }}
              >
                <span>{LANGUAGE_NAMES[l]}</span>
                <span className="a2-langcode">{l.toUpperCase()}</span>
                {l === locale && <Icon name="check" size={16} />}
              </a>
            </li>
          ))}
        </ul>
      )}
    </span>
  )
}
