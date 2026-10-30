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

// FAQ accordion (.p2-faq): the first item open and full width, the others in a grid below.
import {useId, useState} from 'react'
import {useViewport} from '../../design/index.tsx'
import {rgb} from './vp.ts'
import {Icon} from '../../design/index.tsx'

export function Faq({items}: {items: {q: string; a: string}[]}) {
  const vp = useViewport()
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]))
  const base = useId()
  const pad = vp === 'd' || vp === '4k' ? 32 : 24
  const toggle = (i: number) =>
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  const item = (it: {q: string; a: string}, i: number, lead: boolean) => {
    const isOpen = open.has(i)
    const answerId = `${base}-a${i}`
    return (
      <div
        key={i}
        className="p2-faq"
        style={
          isOpen
            ? {borderColor: rgb('blue', '.22'), background: 'var(--a2-card-bg)'}
            : undefined
        }
      >
        <h3 style={{margin: 0}}>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={answerId}
            onClick={() => toggle(i)}
            style={{
              display: 'flex',
              alignItems: isOpen ? undefined : 'center',
              gap: 16,
              width: '100%',
              padding: isOpen ? `${pad}px ${pad}px 0` : pad,
              textAlign: 'left',
              background: 'none',
              border: 0,
              color: 'inherit',
              font: 'inherit',
            }}
          >
            <span
              className="a2-h4"
              style={
                lead && isOpen ? undefined : {fontSize: 16, lineHeight: '24px'}
              }
            >
              {it.q}
            </span>
            <span style={{marginLeft: 'auto', color: 'var(--a2-text-mid)'}}>
              <Icon name={isOpen ? 'x' : 'chevron-down'} size={16} />
            </span>
          </button>
        </h3>
        <p
          id={answerId}
          hidden={!isOpen}
          className="a2-small"
          style={{
            padding: `8px ${pad}px ${pad}px`,
            maxWidth: 760,
            color: 'var(--a2-text)',
          }}
        >
          {it.a}
        </p>
      </div>
    )
  }
  const [first, ...rest] = items
  if (!first) return null
  return (
    <>
      {item(first, 0, true)}
      {rest.length > 0 && (
        <div
          className="a2-cols"
          style={{
            gridTemplateColumns: `repeat(${vp === 'm' ? 1 : 2},minmax(0,1fr))`,
            columnGap: 16,
            rowGap: 16,
            marginTop: 16,
            alignItems: 'start',
          }}
        >
          {rest.map((it, i) => item(it, i + 1, false))}
        </div>
      )}
    </>
  )
}
