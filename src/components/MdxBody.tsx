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

import {Suspense, type ComponentType} from 'react'
import {MDXProvider} from '@mdx-js/react'
import type {MDXComponents} from 'mdx/types'

export function MdxBody({
  body: Body,
  components,
}: {
  body: ComponentType
  components: MDXComponents
}) {
  return (
    <MDXProvider components={components}>
      <Suspense
        fallback={<p className="py-10 text-sm text-fg-muted">Loading…</p>}
      >
        <Body />
      </Suspense>
    </MDXProvider>
  )
}
