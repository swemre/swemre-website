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
import {useEffect, useRef, useState} from 'react'
import {useLocation, useNavigationType} from 'react-router-dom'

const positions = new Map<string, number>()
const waitMs = 3000

export function focusMain() {
  const main = document.querySelector<HTMLElement>('main')
  if (!main) return
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')
  main.focus()
}

function whenReady(attempt: (last: boolean) => boolean) {
  const observer = new MutationObserver(() => {
    if (attempt(false)) stop()
  })
  const timer = window.setTimeout(() => {
    attempt(true)
    stop()
  }, waitMs)
  function stop() {
    observer.disconnect()
    window.clearTimeout(timer)
  }
  if (attempt(false)) stop()
  else observer.observe(document.body, {childList: true, subtree: true})
  return stop
}

function restoreScroll(top: number) {
  const events = ['wheel', 'touchstart', 'keydown']
  const stop = whenReady(() => {
    window.scrollTo(0, top)
    return Math.abs(window.scrollY - top) <= 1
  })
  const cancel = () => {
    stop()
    events.forEach(type => window.removeEventListener(type, cancel))
  }
  events.forEach(type => window.addEventListener(type, cancel, {passive: true}))
  return cancel
}

function focusHeading(onFocus: (title: string) => void) {
  const start = document.activeElement
  return whenReady(last => {
    const active = document.activeElement
    if (active !== start && active !== document.body) return true
    const target =
      document.querySelector<HTMLElement>('main h1') ??
      (last ? document.querySelector<HTMLElement>('main') : null)
    if (!target) return false
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({preventScroll: true})
    window.setTimeout(() => onFocus(document.title))
    return true
  })
}

export function useRouteFocus() {
  const {key, pathname} = useLocation()
  const navigationType = useNavigationType()
  const previous = useRef(pathname)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const save = () => positions.set(key, window.scrollY)
    window.addEventListener('scroll', save, {passive: true})
    return () => window.removeEventListener('scroll', save)
  }, [key])

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    const changed = previous.current !== pathname
    previous.current = pathname
    const saved = positions.get(key)
    let stopScroll = () => {}
    if (navigationType === 'POP' && saved !== undefined) {
      stopScroll = restoreScroll(saved)
    } else if (changed) {
      window.scrollTo(0, 0)
    }
    const stopFocus = changed ? focusHeading(setAnnouncement) : () => {}
    return () => {
      stopScroll()
      stopFocus()
    }
  }, [key, pathname, navigationType])

  return announcement
}
