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

// The single-page body: one <section> per H2, separated by rules, as on the Single-Page board.
import {Fragment} from 'react'
import type {Block} from '../../contract/blocks.ts'
import {useViewport} from '../../design/index.tsx'
import {headingId} from './text.ts'
import {Blocks} from './render.tsx'
import {Rich} from './rich.tsx'

type HeadingProps = Extract<Block, {type: 'heading'}>['props']

export function SingleBody({blocks}: {blocks: Block[]}) {
  const vp = useViewport()
  const sections: {head?: HeadingProps; blocks: Block[]}[] = []
  for (const b of blocks) {
    if (b.type === 'heading' && b.props.level === 2)
      sections.push({head: b.props, blocks: []})
    else if (sections.length) sections[sections.length - 1].blocks.push(b)
    else sections.push({blocks: [b]})
  }
  const rule = vp === 'd' || vp === '4k' ? 64 : 48
  return (
    <>
      {sections.map((s, i) => {
        const id = s.head ? headingId(s.head) : undefined
        return (
          <Fragment key={id ?? i}>
            {i > 0 && <div className="a2-hr" style={{margin: `${rule}px 0`}} />}
            <section aria-labelledby={id}>
              {s.head && (
                <h2 id={id} className="a2-h3" style={{scrollMarginTop: 112}}>
                  <Rich text={s.head.text} />
                </h2>
              )}
              <div
                style={{
                  marginTop: s.head ? 16 : 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  fontSize: 16,
                  lineHeight: '28px',
                  color: 'var(--a2-text)',
                }}
              >
                <Blocks blocks={s.blocks} variant="single" />
              </div>
            </section>
          </Fragment>
        )
      })}
    </>
  )
}
