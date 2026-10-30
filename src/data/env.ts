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

// Build-time configuration from VITE_* variables (see .env.example).
const env = import.meta.env

export const API_MODE: 'mock' | 'live' =
  env.VITE_API_MODE === 'live' ? 'live' : 'mock'
export const API_BASE: string = (env.VITE_API_BASE ?? '/api').replace(/\/$/, '')
export const CHANNEL_KEY: string = env.VITE_CHANNEL_KEY ?? 'swemre-website'
export const READ_KEY: string = env.VITE_READ_KEY ?? 'local-mock'
export const API_TIMEOUT_MS: number = Number(env.VITE_API_TIMEOUT_MS ?? 10000)
export const SITE_URL: string = (
  env.VITE_SITE_URL ?? 'https://swemre.com'
).replace(/\/$/, '')
/** Kept for the deploy scripts; the site takes its language from the URL (src/i18n). */
export const LOCALE: string = env.VITE_LOCALE ?? 'en'
/** Dev switches (?state=, ?fault=, ?seed=) work in dev and whenever the mock serves the API. */
export const DEV_SWITCHES: boolean = env.DEV || API_MODE === 'mock'
