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

import type {ShareImage, SocialLink} from '../types/type'
import {siteEnv} from './env.ts'

// TODO(swemre): confirm the social URLs.
export const siteConfig = {
  name: 'Emre',
  brand: 'SWEMRE',
  handle: 'swemre',
  avatar: '/images/avatar-96.png',
  avatarLarge: '/images/avatar-384.png',
  jobTitle: 'Software Engineer',
  url: siteEnv.siteUrl,
  email: 'emre@swemre.com',
  tagline:
    'I build fast, accessible web applications and care about the details that make software feel simple.',
  rssPath: '/rss.xml',
  privacyPath: '/sp/privacy-policy',
}

// Link previews fall back to this when neither the page nor the site settings have an image
export const defaultShareImage: ShareImage = {
  url: `${siteConfig.url}${siteConfig.avatarLarge}`,
  alt: siteConfig.name,
  width: 384,
  height: 384,
}

export const socialLinks: SocialLink[] = [
  {label: 'GitHub', href: 'https://github.com/swemre', icon: 'github'},
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/swemre',
    icon: 'linkedin',
  },
  {label: 'Email', href: 'mailto:emre@swemre.com', icon: 'mail'},
]
