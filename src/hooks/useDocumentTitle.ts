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

import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {siteConfig} from '../config/site'
import type {DocumentMeta, JsonLd} from '../types/type'
import {documentTags} from '../utils/documentTags'
import {useSiteSettings} from './useSiteSettings'

function setMeta(attribute: 'name' | 'property', key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  )
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = value
}

// Optional tags are removed when the page has no value, so they never go stale
function setOptionalMeta(
  attribute: 'name' | 'property',
  key: string,
  value: string | number | undefined,
) {
  if (value === undefined || value === '') {
    document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove()
  } else {
    setMeta(attribute, key, String(value))
  }
}

function setJsonLd(data: JsonLd | undefined) {
  const id = 'structured-data'
  const existing = document.getElementById(id)
  if (!data) {
    existing?.remove()
    return
  }
  const element = existing ?? document.createElement('script')
  element.id = id
  element.setAttribute('type', 'application/ld+json')
  element.textContent = JSON.stringify(data)
  if (!existing) document.head.append(element)
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  )
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.append(element)
  }
  element.href = href
}

export function useDocumentTitle(title?: string, meta: DocumentMeta = {}) {
  const {pathname} = useLocation()
  const settings = useSiteSettings()
  const {description, image, article, schema} = meta

  useEffect(() => {
    const tags = documentTags(
      siteConfig,
      pathname,
      title,
      {description, image, article, schema},
      settings.defaultOgImage,
    )
    document.title = tags.title
    setMeta('name', 'description', tags.description)
    setCanonical(tags.url)
    setMeta('property', 'og:title', tags.title)
    setMeta('property', 'og:description', tags.description)
    setMeta('property', 'og:url', tags.url)
    setMeta('property', 'og:type', tags.ogType)
    setMeta('property', 'og:image', tags.image.url)
    setOptionalMeta('property', 'og:image:width', tags.image.width)
    setOptionalMeta('property', 'og:image:height', tags.image.height)
    setOptionalMeta('property', 'og:image:alt', tags.image.alt)
    setOptionalMeta(
      'property',
      'article:published_time',
      tags.article?.publishedTime,
    )
    setOptionalMeta(
      'property',
      'article:modified_time',
      tags.article?.modifiedTime,
    )
    setMeta('name', 'twitter:card', tags.twitterCard)
    setMeta('name', 'twitter:title', tags.title)
    setMeta('name', 'twitter:description', tags.description)
    setMeta('name', 'twitter:image', tags.image.url)
    setOptionalMeta('name', 'twitter:image:alt', tags.image.alt)
    setJsonLd(tags.jsonLd)
  }, [
    title,
    description,
    image,
    article,
    schema,
    pathname,
    settings.defaultOgImage,
  ])
}
