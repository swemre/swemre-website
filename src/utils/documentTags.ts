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
import type {
  DocumentMeta,
  DocumentTags,
  JsonLd,
  PageSchema,
  ShareImage,
} from '../types/type'

// Shared with scripts/prerender.mjs, which loads it with Node type stripping, so it has no
// runtime imports. pathname is a route path; the URL never ends with a slash except "/"
export function documentTags(
  site: typeof siteConfig,
  pathname: string,
  title: string | undefined,
  meta: DocumentMeta,
  defaultImage: ShareImage,
): DocumentTags {
  const path = pathname.replace(/\/+$/, '') || '/'
  const image = meta.image ?? defaultImage
  return {
    title: title ? `${title} · ${site.brand}` : site.brand,
    description:
      meta.description ||
      `Portfolio, articles and projects of ${site.name}, ${site.jobTitle.toLowerCase()}.`,
    url: `${site.url}${path}`,
    image,
    ogType: meta.article ? 'article' : 'website',
    // The square avatar fallback reads better as a small card than cropped wide
    twitterCard: image.url.endsWith(site.avatarLarge)
      ? 'summary'
      : 'summary_large_image',
    article: meta.article,
    jsonLd: meta.schema && structuredData(site, path, title, meta, image),
  }
}

const breadcrumbs = (site: typeof siteConfig, path: string, title?: string) => {
  const parts = path.split('/').filter(Boolean)
  const names: Record<string, string> = {
    articles: 'Articles',
    projects: 'Projects',
  }
  const items = [{name: 'Home', url: `${site.url}/`}]
  if (parts[0] && names[parts[0]]) {
    items.push({name: names[parts[0]], url: `${site.url}/${parts[0]}`})
  }
  if (parts.length > 1 && title)
    items.push({name: title, url: `${site.url}${path}`})
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// schema.org data for search engines: WebSite and Person on home, BlogPosting on articles,
// CreativeWork (SoftwareSourceCode with a repository) on projects, breadcrumbs below home
function structuredData(
  site: typeof siteConfig,
  path: string,
  title: string | undefined,
  meta: DocumentMeta,
  image: ShareImage,
): JsonLd {
  const schema = meta.schema as PageSchema
  const person = {
    '@type': 'Person',
    '@id': `${site.url}/#person`,
    name: site.name,
    jobTitle: site.jobTitle,
    url: `${site.url}/`,
    sameAs: [site.github, site.linkedin],
  }
  const graph: JsonLd[] = []
  if (schema.kind === 'home') {
    graph.push(
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        name: site.brand,
        url: `${site.url}/`,
        description: meta.description,
        publisher: {'@id': person['@id']},
      },
      person,
    )
  } else {
    graph.push(breadcrumbs(site, path, title))
  }
  if (schema.kind === 'article') {
    graph.push({
      '@type': 'BlogPosting',
      headline: title,
      description: meta.description,
      image: image.url,
      url: `${site.url}${path}`,
      mainEntityOfPage: `${site.url}${path}`,
      datePublished: meta.article?.publishedTime,
      dateModified: meta.article?.modifiedTime,
      author: {
        '@type': 'Person',
        name: schema.author || site.name,
        url: `${site.url}/`,
      },
    })
  }
  if (schema.kind === 'project') {
    graph.push({
      '@type': schema.repoUrl ? 'SoftwareSourceCode' : 'CreativeWork',
      name: title,
      description: meta.description,
      image: image.url,
      url: `${site.url}${path}`,
      ...(schema.repoUrl && {codeRepository: schema.repoUrl}),
      ...(schema.url && {sameAs: schema.url}),
      ...(schema.year && {dateCreated: String(schema.year)}),
      author: {'@id': person['@id']},
      creator: person,
    })
  }
  return {'@context': 'https://schema.org', '@graph': graph}
}
