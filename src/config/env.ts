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

import type {EnvSource, SiteEnv} from '../types/type'
import {siteDefaults} from './siteDefaults.ts'

const text = (source: EnvSource, key: string): string | undefined => {
  const value = source[key]
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined
}

export function readSiteEnv(source: EnvSource): SiteEnv {
  const timeout = Number(text(source, 'VITE_API_TIMEOUT_MS'))
  return {
    apiBase: text(source, 'VITE_API_BASE') ?? siteDefaults.apiBase,
    channelKey: text(source, 'VITE_CHANNEL_KEY') ?? siteDefaults.channelKey,
    readKey: text(source, 'VITE_READ_KEY'),
    siteUrl: (text(source, 'VITE_SITE_URL') ?? siteDefaults.siteUrl).replace(
      /\/+$/,
      '',
    ),
    locale: text(source, 'VITE_LOCALE') ?? siteDefaults.locale,
    timeoutMs: timeout > 0 ? timeout : siteDefaults.timeoutMs,
  }
}

// Vite replaces import.meta.env in the bundle; the build scripts run in Node, where it is
// undefined and process.env holds the same variables
const nodeEnv = (): EnvSource =>
  (globalThis as unknown as {process?: {env: EnvSource}}).process?.env ?? {}

export const siteEnv: SiteEnv = readSiteEnv(import.meta.env ?? nodeEnv())
