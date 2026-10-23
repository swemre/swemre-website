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

import {defaultShareImage, siteConfig} from '../config/site'
import type {SiteSettings} from '../types/type'
import {fieldMediaUrl, fieldString, safely, shareImage} from './apiClient'
import {publicApi} from './publicApi'

export const defaultSiteSettings: SiteSettings = {
  tagline: siteConfig.tagline,
  contactEmail: siteConfig.email,
  defaultOgImage: defaultShareImage,
}

// The "site-settings" content type holds a single entry; empty fields keep the defaults
export class SiteSettingsService {
  private cache?: Promise<SiteSettings>

  load(): Promise<SiteSettings> {
    this.cache ??= safely(async () => {
      const posts = await publicApi.listPosts('site-settings', {size: 1})
      const fields = posts[0]?.fields ?? {}
      return {
        tagline: fieldString(fields, 'tagline') ?? defaultSiteSettings.tagline,
        contactEmail:
          fieldString(fields, 'contactEmail') ??
          defaultSiteSettings.contactEmail,
        defaultOgImage:
          shareImage(fields, ['defaultOgImage']) ??
          defaultSiteSettings.defaultOgImage,
        logoUrl: fieldMediaUrl(fields, 'logo'),
      }
    }, defaultSiteSettings)
    return this.cache
  }
}
