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

// Overlay helpers: focus trap with focus return, scroll lock without layout shift.
import {useEffect, type RefObject} from 'react'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Keeps Tab inside the container while active; Esc calls onEscape; focus goes back to the
 * element that had it when the overlay opened. */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void,
) {
  useEffect(() => {
    if (!active) return
    const opener = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape?.()
        return
      }
      if (e.key !== 'Tab' || !ref.current) return
      const items = [
        ...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter(el => el.offsetParent !== null || el === document.activeElement)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          !ref.current.contains(document.activeElement))
      ) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (opener && document.contains(opener))
        opener.focus({preventScroll: true})
    }
  }, [ref, active, onEscape])
}

/** Locks page scroll while active; pads the body by the scrollbar width so nothing moves. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const html = document.documentElement
    const gap = window.innerWidth - html.clientWidth
    html.classList.add('a2-locked')
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
    return () => {
      html.classList.remove('a2-locked')
      document.body.style.paddingRight = ''
    }
  }, [active])
}
