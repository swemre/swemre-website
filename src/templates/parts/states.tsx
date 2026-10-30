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

// Loading and error states of the detail pages (not drawn on the boards): a skeleton of the hero,
// and the error StatePanel with Try again, inside the page's first section.
import type {ReactNode} from 'react'
import {LoadingStatus, Skel, StatePanel} from '../../design/index.tsx'
import {HeroCurve, Sec, TopGlow} from './deco.tsx'
import {useHeroPad, usePick} from './vp.ts'

function Frame({children}: {children: ReactNode}) {
  const pad = useHeroPad()
  const pick = usePick()
  return (
    <>
      <TopGlow />
      <div style={{position: 'relative'}}>
        <Sec
          deco={{
            rail: {hue: 'blue', top: pick({m: 0, d: 144})},
            node: {top: {m: 115, t: 131, d: 166, k: 198}},
          }}
          style={{...pad, minHeight: '70vh'}}
        >
          <HeroCurve hue="blue" top={40} />
          <div className="a2-c">{children}</div>
        </Sec>
      </div>
    </>
  )
}

/** The hero skeleton: path line, a two-line title, the lead and the meta strip. */
export function PageLoading({label}: {label: string}) {
  return (
    <Frame>
      <LoadingStatus label={label} />
      <div aria-hidden="true">
        <Skel w={280} h={14} />
        <Skel w="min(720px, 100%)" h={56} style={{marginTop: 24}} />
        <Skel w="min(520px, 80%)" h={56} style={{marginTop: 12}} />
        <Skel w="min(760px, 100%)" h={20} style={{marginTop: 32}} />
        <Skel w="min(600px, 90%)" h={20} style={{marginTop: 12}} />
        <div
          style={{display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap'}}
        >
          {[96, 120, 104, 160, 120].map((w, i) => (
            <div key={i}>
              <Skel w={64} h={10} />
              <Skel w={w} h={18} style={{marginTop: 12}} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

export function PageError({
  what,
  command,
  onRetry,
}: {
  what: string
  command: string
  onRetry: () => void
}) {
  return (
    <Frame>
      <div style={{maxWidth: 720}}>
        <StatePanel
          kind="error"
          title={`${what} could not be loaded`}
          copy="The server did not answer in time. Nothing is lost; try again in a moment."
          command={command}
          result="503 Service Unavailable"
          onRetry={onRetry}
        />
      </div>
    </Frame>
  )
}
