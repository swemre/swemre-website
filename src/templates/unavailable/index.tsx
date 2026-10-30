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

// 503 (boards 503, 4K 503): the logo-only bar with the "Maintenance in progress" badge is
// A's SiteShell (route chrome bar 'logo', no footer); this draws the status page and the window
// from the route (resolver) or settings.
import type {TemplateProps} from '../../contract/templates.ts'
import {useSettings} from '../../data/hooks.ts'
import {Button} from '../../design/index.tsx'
import {fmtClock} from '../parts/format.ts'
import {CodeMark, StatusHero} from '../parts/status.tsx'

function reload() {
  window.location.reload()
}

function useWindow(params: Record<string, string>) {
  const settings = useSettings()
  if (params.maintenanceFrom && params.maintenanceUntil)
    return {from: params.maintenanceFrom, until: params.maintenanceUntil}
  return settings.status === 'ready'
    ? (settings.data.maintenance ?? undefined)
    : undefined
}

export function UnavailableTemplate({route}: TemplateProps) {
  const win = useWindow(route.params)
  return (
    <>
      <StatusHero
        hue="lilac"
        railLabel="ma1n7en"
        mark={
          <CodeMark
            code="503"
            color="var(--a2-hue-lilac)"
            glow="var(--a2-hue-lilac-rgb)"
          />
        }
        markLabel="Maintenance"
        markColor="var(--a2-hue-lilac)"
        eyebrow="error 503"
        detail="scheduled maintenance"
        title="Back in a few minutes."
        lead="swemre.com is being updated. Everything will be back shortly; nothing you saved is lost."
        actions={
          <>
            <Button
              kind="primary"
              label="Try again"
              iconLeft="refresh"
              onClick={reload}
            />
            {win && (
              <span
                className="a2-mono"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 48,
                }}
              >
                {`started ${fmtClock(win.from)} · back by ${fmtClock(win.until)}`}
              </span>
            )}
          </>
        }
      />
    </>
  )
}
