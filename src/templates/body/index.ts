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

// The body renderers: BlocksView (article prose), ProjectBody (project sections) and SingleBody
// (single-page sections), plus the pieces and helpers the templates use around them.
export {Blocks, BlocksView, BlockView} from './render.tsx'
export {ProjectBody} from './project.tsx'
export {SingleBody} from './single.tsx'
export {
  FactList,
  FactStrip,
  Prompt,
  SectionNumber,
  SmartLink,
} from './blocks.tsx'
export {Rich} from './rich.tsx'
export {
  badgeHue,
  headingId,
  headingsOf,
  isInternal,
  plain,
  slugify,
  type TocEntry,
} from './text.ts'
