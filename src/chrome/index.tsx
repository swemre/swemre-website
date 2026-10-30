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

// Site chrome: shell, nav, mega menus, mobile menu, footer, quick search. Owner: agent A.
// Day-0 stub with the final signature.
import type {ReactNode} from 'react'
import {Root} from '../design/index.tsx'

export function SiteShell({
  chrome,
  children,
}: {
  chrome: {nav: boolean; footer: boolean}
  children: ReactNode
}) {
  return (
    <Root>
      {chrome.nav && <nav aria-label="Main">SWEMRE</nav>}
      <main id="main">{children}</main>
      {chrome.footer && <footer>Software brand</footer>}
    </Root>
  )
}
