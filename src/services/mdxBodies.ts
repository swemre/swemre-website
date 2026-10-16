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

import {lazy, type ComponentType} from 'react'

type MdxModules = Record<string, () => Promise<{default: ComponentType}>>

// Built once at module load: creating lazy components during render breaks
// react-hooks/static-components and resets their state on every render.
export const lazyBodies = (
  modules: MdxModules,
): Record<string, ComponentType> =>
  Object.fromEntries(
    Object.entries(modules).map(([path, loader]) => [
      path.replace(/^.*\/|\.mdx$/g, ''),
      lazy(loader),
    ]),
  )
