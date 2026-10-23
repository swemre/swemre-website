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
import type {DocumentMeta} from '../types/type'
import {useSiteSettings} from './useSiteSettings'

const defaults = {
  description: `Portfolio, articles and projects of ${siteConfig.name}, ${siteConfig.jobTitle.toLowerCase()}.`,
}

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

export function useDocumentTitle(title?: string, meta: DocumentMeta = {}) {
  const {pathname} = useLocation()
  const settings = useSiteSettings()
  const {description, image} = meta

  useEffect(() => {
    const fullTitle = title
      ? `${title} · ${siteConfig.brand}`
      : siteConfig.brand
    const text = description || defaults.description
    const picture = image || settings.defaultOgImageUrl
    document.title = fullTitle
    setMeta('name', 'description', text)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', text)
    setMeta('property', 'og:url', `${siteConfig.url}${pathname}`)
    setMeta('property', 'og:image', picture)
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
  }, [title, description, image, pathname, settings.defaultOgImageUrl])
}
