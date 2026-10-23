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

import type {siteConfig} from '../config/site'
import type {DocumentMeta, DocumentTags} from '../types/type'

// Shared with scripts/prerender.mjs, which loads it with Node type stripping, so it has no
// runtime imports. pathname is a route path; the URL never ends with a slash except "/"
export function documentTags(
  site: typeof siteConfig,
  pathname: string,
  title: string | undefined,
  meta: DocumentMeta,
  defaultImage: string,
): DocumentTags {
  const path = pathname.replace(/\/+$/, '') || '/'
  return {
    title: title ? `${title} · ${site.brand}` : site.brand,
    description:
      meta.description ||
      `Portfolio, articles and projects of ${site.name}, ${site.jobTitle.toLowerCase()}.`,
    url: `${site.url}${path}`,
    image: meta.image || defaultImage,
    twitterCard: meta.image ? 'summary_large_image' : 'summary',
  }
}
