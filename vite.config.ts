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

import react from '@vitejs/plugin-react'
import {defineConfig, loadEnv} from 'vite'
import {liveFeeds} from './feeds/plugin.ts'
import {mockApi} from './mock/plugin.ts'

// VITE_API_MODE=mock (the default) answers every /api/public/v2 call from mock/seed inside the dev
// server, so the site runs with no backend. VITE_API_MODE=live sends calls to VITE_API_BASE, and
// its build writes rss.xml and sitemap.xml from the channel (feeds/plugin.ts).
export default defineConfig(({mode}) => {
  const env = {...loadEnv(mode, process.cwd()), ...process.env}
  const mock = (env.VITE_API_MODE ?? 'mock') === 'mock'
  return {
    plugins: [
      react(),
      ...(mock
        ? [
            mockApi({
              apiBase: env.VITE_API_BASE,
              channel: env.VITE_CHANNEL_KEY,
              readKey: env.VITE_READ_KEY,
              siteUrl: env.VITE_SITE_URL,
            }),
          ]
        : [
            liveFeeds({
              apiBase: env.VITE_API_BASE ?? '/api',
              channel: env.VITE_CHANNEL_KEY ?? 'swemre-website',
              readKey: env.VITE_READ_KEY ?? '',
              siteUrl: env.VITE_SITE_URL ?? 'https://swemre.com',
              locales: ['en', 'tr'],
              required: env.VITE_FEEDS_REQUIRED === '1',
            }),
          ]),
    ],
    server: {port: 5173},
    preview: {port: 4173},
  }
})
