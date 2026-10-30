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

import type {Plugin} from 'vite'

// Mock public API v2, served by the Vite dev and preview servers. Owner: agent C.
// Answers /api/public/v2/channels/:channel/... from mock/seed/*.json (see docs/mock-api.md).
export function mockApi(): Plugin {
  return {
    name: 'swemre-mock-api',
    configureServer(server) {
      server.middlewares.use('/api/public/v2', (_req, res) => {
        res.statusCode = 501
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({key: 'NOT_IMPLEMENTED', message: 'mock not built yet', errors: []}))
      })
    },
  }
}
