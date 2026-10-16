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

import {BlocksView, blocksFromText, parseBlocks} from 'swemre-blocks'
import {useTheme} from '../hooks/useTheme'

// Body of an article, project, song or special page that has no `<slug>.mdx` file. Blocks
// written in the CMS and plain text from older posts both render through the shared view that
// the CMS preview uses, so the two look the same.
export function ContentBody({
  body,
  format,
}: {
  body: string
  format?: 'TEXT' | 'BLOCKS'
}) {
  const {mode} = useTheme()
  const blocks = format === 'BLOCKS' ? parseBlocks(body) : blocksFromText(body)
  return <BlocksView blocks={blocks} theme={mode} />
}
