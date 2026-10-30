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

// URL -> ResolvedRoute -> template, inside the site shell. Owner: agent C. Day-0 stub.
import {useLocation} from 'react-router-dom'
import {SiteShell} from '../chrome/index.tsx'
import type {ResolvedRoute} from '../contract/templates.ts'
import {templates} from '../templates/index.ts'

export function RouteResolver() {
  const location = useLocation()
  const route: ResolvedRoute = {
    template: location.pathname === '/' ? 'home' : 'not-found',
    path: location.pathname,
    params: Object.fromEntries(new URLSearchParams(location.search)),
    notFoundKind: 'page',
    chrome: {nav: true, footer: true},
  }
  const Template = templates[route.template]
  return (
    <SiteShell chrome={route.chrome}>
      <Template route={route} />
    </SiteShell>
  )
}
