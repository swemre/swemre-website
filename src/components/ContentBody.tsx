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

import {BlocksView, blocksFromValue} from 'swemre-blocks'
import {useTheme} from '../hooks/useTheme'

// Body of an article, project or special page: the blocks of its rich text field, rendered by
// the same view as the CMS preview, so the two look the same
export function ContentBody({value}: {value: unknown}) {
  const {mode} = useTheme()
  return <BlocksView blocks={blocksFromValue(value)} theme={mode} />
}
