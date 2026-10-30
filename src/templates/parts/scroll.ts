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

// Scroll state for the "On this page" lists and the reading bar.
import {useEffect, useState, type RefObject} from 'react'

/** The nav covers the top of the window; headings count as reached below it. */
const REACHED = 120

function smooth(): ScrollBehavior {
  return matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
}

/** Scrolls to a heading (or the top for ''), and records it in the URL hash. */
export function scrollToId(id: string) {
  const url = `${window.location.pathname}${window.location.search}${id ? `#${id}` : ''}`
  window.history.replaceState(window.history.state, '', url)
  if (!id) {
    window.scrollTo({top: 0, behavior: smooth()})
    return
  }
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({behavior: smooth(), block: 'start'})
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({preventScroll: true})
}

function onScroll(cb: () => void) {
  let frame = 0
  const run = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(cb)
  }
  cb()
  window.addEventListener('scroll', run, {passive: true})
  window.addEventListener('resize', run)
  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', run)
    window.removeEventListener('resize', run)
  }
}

/** Index of the last heading that has reached the top of the window (0 before the first). */
export function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(0)
  const key = ids.join('|')
  useEffect(() => {
    const list = key ? key.split('|') : []
    return onScroll(() => {
      let idx = 0
      list.forEach((id, i) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= REACHED) idx = i
      })
      setActive(idx)
    })
  }, [key])
  return active
}

/** Share of `ref` read so far, 0..1: 0 when its top reaches the nav, 1 at its end. */
export function useReadProgress(ref: RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0)
  useEffect(
    () =>
      onScroll(() => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const span = r.height - window.innerHeight + REACHED
        const read = REACHED - r.top
        setP(span <= 0 ? 1 : Math.min(1, Math.max(0, read / span)))
      }),
    [ref],
  )
  return p
}
