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

// Receipt (V4-Comp-Receipt): the success card of every form. Hue card, glowing check tile, h3,
// copy, an optional key/value list under a rule, actions and the terminal line.
import type {ReactNode} from 'react'
import {useViewport} from '../context.ts'
import {Card, IconTile, KeyValue, Prompt} from './Card.tsx'
import type {IconName} from './Icon.tsx'
import type {Hue} from './util.ts'

export interface ReceiptProps {
  title: ReactNode
  copy?: ReactNode
  hue?: Hue
  icon?: IconName
  items?: [ReactNode, ReactNode][]
  /** Buttons and links. */
  actions?: ReactNode
  /** The terminal line ("mail --queue   1 sent"). */
  command?: string
  /** h3 id: forms move focus here on success. */
  id?: string
}

export function Receipt({
  title,
  copy,
  hue = 'aqua',
  icon = 'check-circle',
  items,
  actions,
  command,
  id,
}: ReceiptProps) {
  const vp = useViewport()
  return (
    <Card hue={hue}>
      <div role="status">
        <IconTile icon={icon} hue={hue} big glow />
        <h3 className="a2-h3" style={{marginTop: 16}} id={id} tabIndex={-1}>
          {title}
        </h3>
        {copy && (
          <p className="a2-body" style={{marginTop: 8, maxWidth: 560}}>
            {copy}
          </p>
        )}
      </div>
      {items && items.length > 0 && (
        <>
          <div className="a2-hr" style={{margin: '24px 0'}} />
          <KeyValue items={items} />
        </>
      )}
      {actions && (
        <div
          style={{marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 16}}
        >
          {actions}
        </div>
      )}
      {command && (
        <Prompt command={command} wrap={vp === 'm'} style={{marginTop: 24}} />
      )}
    </Card>
  )
}
