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

// Clipboard helpers behind the Copy controls: the copy itself, the 2 s "Copied" flag and the
// width lock that keeps a control from moving while its label reads "Copied".
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

export async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

/** [copied, copy]: `copied` stays true for 2 s after a successful copy. */
export function useCopied(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = useCallback((text: string) => {
    void writeClipboard(text).then(ok => {
      if (!ok) return
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    })
  }, [])
  return [copied, copy]
}

/**
 * Keeps a control at the width it had before its label changed: call `lock(event)` in the click
 * handler, then spread `lockStyle(active, width)` into the control's style.
 */
export function useWidthLock(): [
  number | undefined,
  (e: {currentTarget: Element}) => void,
] {
  const [width, setWidth] = useState<number | undefined>(undefined)
  const lock = useCallback((e: {currentTarget: Element}) => {
    setWidth(e.currentTarget.getBoundingClientRect().width)
  }, [])
  return [width, lock]
}

export function lockStyle(
  active: boolean,
  width: number | undefined,
): CSSProperties {
  return active && width
    ? // Padding stays as it is (changing it would fight a padding shorthand in the caller's
      // style); the longer label overflows into the padding, centred.
      {
        width,
        boxSizing: 'border-box',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
      }
    : {}
}
