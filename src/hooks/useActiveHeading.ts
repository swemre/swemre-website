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

import {useEffect, useState} from 'react'
import type {TocHeading} from '../types/type'

export function useActiveHeading(headings: TocHeading[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const elements = headings
      .map(heading => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return undefined

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const first = elements.find(element => visible.has(element.id))
        if (first) setActive(first.id)
      },
      {rootMargin: '-72px 0px -65% 0px'},
    )
    elements.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [headings])

  return active
}
