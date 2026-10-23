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

import {siteConfig} from '../config/site'
import type {SiteSettings} from '../types/type'
import {
  fieldMediaUrl,
  fieldString,
  publicRequest,
  safely,
  workspacePath,
  type PagedContent,
  type PublicPost,
} from './apiClient'

export const defaultSiteSettings: SiteSettings = {
  tagline: siteConfig.tagline,
  contactEmail: siteConfig.email,
  defaultOgImageUrl: `${siteConfig.url}${siteConfig.avatarLarge}`,
}

// The "site-settings" content type holds a single entry; empty fields keep the defaults
export class SiteSettingsService {
  private cache?: Promise<SiteSettings>

  load(): Promise<SiteSettings> {
    this.cache ??= safely(async () => {
      const page = await publicRequest<PagedContent<PublicPost>>(
        `${workspacePath}/posts?type=site-settings&size=1`,
      )
      const fields = page?.content[0]?.fields ?? {}
      return {
        tagline: fieldString(fields, 'tagline') ?? defaultSiteSettings.tagline,
        contactEmail:
          fieldString(fields, 'contactEmail') ??
          defaultSiteSettings.contactEmail,
        defaultOgImageUrl:
          fieldMediaUrl(fields, 'defaultOgImage') ??
          defaultSiteSettings.defaultOgImageUrl,
        logoUrl: fieldMediaUrl(fields, 'logo'),
      }
    }, defaultSiteSettings)
    return this.cache
  }
}
