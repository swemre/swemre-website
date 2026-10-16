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

import {BandBackdrop} from './BandBackdrop'

export function HeaderBand() {
  return (
    <div
      aria-hidden="true"
      className="relative isolate h-band border-b border-border-muted"
    >
      <BandBackdrop />
    </div>
  )
}
