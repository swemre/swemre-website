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

import type {TemplateProps} from '../../contract/templates.ts'

// Placeholder until its owner builds it.
export function ArticlesTemplate({route}: TemplateProps) {
  return <p>articles template: {route.path}</p>
}
