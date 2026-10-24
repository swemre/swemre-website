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

// Used when the build's environment leaves a variable unset; see .env.example
export const siteDefaults = {
  apiBase: 'http://localhost:8080/api',
  // The website channel the site reads (Channels in the CMS)
  channelKey: 'swemre-website',
  siteUrl: 'https://swemre.com',
  locale: 'en',
  timeoutMs: 10000,
}
