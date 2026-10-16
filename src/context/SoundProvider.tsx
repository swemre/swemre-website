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

import {useEffect, useState, type ReactNode} from 'react'
import {soundEngine} from '../services/soundEngine'
import type {SoundName} from '../types/type'
import {SoundContext} from './SoundContext'

const KEY = 'swemre:sound-muted'

const INTERACTIVE =
  'button, a[href], summary, select, [role="button"], [role="option"], [role="tab"], input[type="checkbox"], input[type="radio"]'

const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'])

const NAV_KEYS = new Set([
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
])

function initialMuted(): boolean {
  try {
    return localStorage.getItem(KEY) === 'true'
  } catch {
    return false
  }
}

const isTextField = (target: EventTarget | null): target is HTMLElement =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === 'TEXTAREA' ||
    (target instanceof HTMLInputElement &&
      !['checkbox', 'radio', 'button', 'submit', 'reset'].includes(
        target.type,
      )))

// `data-sound="none"` silences an element (it plays its own sound instead);
// any other value names the sound to play.
function soundFor(element: Element): SoundName | null {
  const override = element.closest('[data-sound]')?.getAttribute('data-sound')
  if (override) return override === 'none' ? null : (override as SoundName)
  const pressed = element.getAttribute('aria-pressed')
  if (pressed === 'true') return 'toggle-off'
  if (pressed === 'false') return 'toggle-on'
  return 'tap'
}

function isDisabled(element: Element) {
  return (
    element.matches(':disabled') ||
    element.getAttribute('aria-disabled') === 'true'
  )
}

function soundForKey(event: KeyboardEvent): SoundName | null {
  const {key, target} = event
  if (MODIFIER_KEYS.has(key) || event.ctrlKey || event.metaKey || event.altKey)
    return null

  if (isTextField(target)) {
    if (key === 'Enter') {
      const override = target
        .closest('[data-sound-enter]')
        ?.getAttribute('data-sound-enter')
      if (override === 'none') return null
      return target.tagName === 'TEXTAREA' && event.shiftKey ? 'key' : 'enter'
    }
    if (key === 'Backspace' || key === 'Delete') return 'back'
    if (key === 'Escape') return 'cancel'
    if (NAV_KEYS.has(key)) return 'nav'
    return key.length === 1 ? 'key' : null
  }

  if (event.repeat) return null
  if (key === 'Enter' || key === ' ') {
    const element =
      target instanceof Element ? target.closest(INTERACTIVE) : null
    if (element && !isDisabled(element)) return soundFor(element)
    return key === ' ' ? 'key' : null
  }
  if (key === 'Escape') return 'cancel'
  if (NAV_KEYS.has(key)) return 'nav'
  return key.length === 1 ? 'key' : null
}

export function SoundProvider({children}: {children: ReactNode}) {
  const [muted, setMuted] = useState(initialMuted)

  useEffect(() => {
    soundEngine.setMuted(muted)
    try {
      localStorage.setItem(KEY, String(muted))
    } catch {
      // Storage unavailable: the choice lasts for this session only.
    }
  }, [muted])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return
      const element = event.target.closest(INTERACTIVE)
      if (!element || isDisabled(element)) return
      const name = soundFor(element)
      if (name) soundEngine.play(name)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const name = soundForKey(event)
      if (name) soundEngine.play(name)
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [])

  const toggleMuted = () => {
    const next = !muted
    soundEngine.setMuted(next)
    if (!next) soundEngine.play('toggle-on')
    setMuted(next)
  }

  return (
    <SoundContext value={{muted, toggleMuted, play: soundEngine.play}}>
      {children}
    </SoundContext>
  )
}
