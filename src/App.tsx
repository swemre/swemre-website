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

import {AppProviders} from './design/index.tsx'
import {RouteResolver} from './data/resolver.tsx'

// Owner: agent C. The shell (nav, footer) is rendered by RouteResolver around each template,
// because the 503 template hides it.
export function App() {
  return (
    <AppProviders>
      <RouteResolver />
    </AppProviders>
  )
}
