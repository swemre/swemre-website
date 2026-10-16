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

import {useEffect, useState, type RefObject} from 'react'
import type {TocHeading} from '../types/type'
import {slugify} from '../utils/slugify'

export function useHeadings(
  container: RefObject<HTMLElement | null>,
  selector: 'h2' | 'h2, h3' = 'h2, h3',
): TocHeading[] {
  const [headings, setHeadings] = useState<TocHeading[]>([])

  useEffect(() => {
    const root = container.current
    if (!root) return undefined

    const scan = () => {
      const found = Array.from(
        root.querySelectorAll<HTMLHeadingElement>(selector),
      ).map(heading => {
        const text = heading.dataset.tocText ?? heading.textContent ?? ''
        if (!heading.id) heading.id = slugify(text)
        return {
          id: heading.id,
          text,
          level: heading.tagName === 'H2' ? 2 : 3,
        } as TocHeading
      })
      setHeadings(previous =>
        JSON.stringify(previous) === JSON.stringify(found) ? previous : found,
      )
    }

    const observer = new MutationObserver(scan)
    observer.observe(root, {childList: true, subtree: true})
    queueMicrotask(scan)
    return () => observer.disconnect()
  }, [container, selector])

  return headings
}
