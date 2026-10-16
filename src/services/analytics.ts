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

import {publicRequest, workspacePath, visitorSessionId} from './apiClient'

// Analytics must never break navigation, so failures are dropped silently.
// Referrers from the same site are sent as empty, because the API ignores them anyway.
export async function recordPageView(path: string): Promise<void> {
  try {
    await publicRequest(`${workspacePath}/page-views`, {
      method: 'POST',
      body: {
        path,
        referrer: document.referrer || null,
        sessionId: visitorSessionId(),
      },
    })
  } catch {
    // Dropped: the visitor's page view is not essential
  }
}
