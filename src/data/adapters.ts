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
// ApiPublication -> view models (src/contract/view.ts). Templates never read `fields`; all
// defaults live here. Owner: agent C.
import type {
  ApiMedia,
  ApiPublication,
  ApiPublicationSummary,
  ApiTerm,
  FieldMap,
} from '../contract/api.ts'
import type {Block, Hue} from '../contract/blocks.ts'
import {RESERVED_TAGS} from '../contract/templates.ts'
import type {
  ArticleSummary,
  Crumb,
  Media,
  Page,
  ProjectSummary,
  Seo,
  SiteSettings,
  TermRef,
} from '../contract/view.ts'
import {api} from './client.ts'
import {SITE_URL} from './env.ts'
import {canonicalHref} from './rules.ts'
import {t} from '../i18n/index.ts'

const HUES: Hue[] = ['blue', 'sky', 'lilac', 'peri', 'aqua', 'mist']
const RESERVED = new Set<string>(RESERVED_TAGS)

export const isReservedTag = (slug: string) => RESERVED.has(slug)

function fieldsOf<K extends keyof FieldMap>(
  pub: ApiPublicationSummary,
): FieldMap[K] {
  return pub.fields as FieldMap[K]
}

/** A stable hue from a slug, for items that do not set one. */
function hueOf(slug: string): Hue {
  let h = 0
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return HUES[h % HUES.length]
}

export function termRef(t: ApiTerm, count?: number): TermRef {
  return {
    slug: t.slug,
    name: t.name,
    kind: t.kind,
    href: t.kind === 'TAG' ? `/articles/topic/${t.slug}` : `/${t.slug}`,
    ...(count !== undefined || t.publicationCount !== undefined
      ? {count: count ?? t.publicationCount}
      : {}),
    ...(t.description ? {description: t.description} : {}),
  }
}

/** The topic tags of a publication (reserved tags removed). */
export function topicTags(pub: ApiPublicationSummary): TermRef[] {
  return pub.terms
    .filter(t => t.kind === 'TAG' && !isReservedTag(t.slug))
    .map(t => termRef(t))
}

export function media(
  m: ApiMedia | null | undefined,
  alt = '',
): Media | undefined {
  if (!m) return undefined
  return {
    url: api.mediaUrl(m),
    alt: m.alt ?? alt,
    width: m.width,
    height: m.height,
  }
}

export function seoOf(pub: ApiPublicationSummary): Seo {
  return {
    title: pub.seoTitle ?? pub.title,
    description: pub.seoDescription ?? pub.excerpt ?? undefined,
    canonical: pub.canonicalUrl ?? SITE_URL + canonicalHref(pub),
    noindex: pub.noindex,
  }
}

export function blocksOf(pub: ApiPublication): Block[] {
  return (pub.body?.blocks ?? []) as Block[]
}

export function toArticleSummary(pub: ApiPublicationSummary): ArticleSummary {
  const f = fieldsOf<'article'>(pub)
  const hue = f.hue ?? hueOf(pub.slug)
  const coverStyle =
    f.coverStyle ?? (pub.cover ? 'image' : f.codeCover ? 'code' : 'none')
  return {
    slug: pub.slug,
    href: canonicalHref(pub),
    title: pub.title,
    summary: f.summary ?? pub.excerpt ?? '',
    publishedAt: pub.publishedAt,
    updatedAt: pub.updatedAt ?? pub.publishedAt,
    readingTime: f.readingTime,
    category: pub.section?.slug,
    tags: topicTags(pub),
    cover: media(pub.cover, pub.title),
    codeCover: f.codeCover
      ? {
          code: f.codeCover,
          filename: f.codeCoverFile,
          language: f.codeCoverFile?.split('.').pop(),
          repo: f.codeCoverRepo,
          glyph: f.codeCoverGlyph,
          hue,
        }
      : undefined,
    coverCaption: f.coverCaption,
    coverStyle,
    hue,
  }
}

function initials(title: string): string {
  const caps = title.match(/\b[A-Za-z]/g) ?? []
  return (
    caps.slice(0, 2).join('').toUpperCase() || title.slice(0, 2).toUpperCase()
  )
}

export function toProjectSummary(pub: ApiPublicationSummary): ProjectSummary {
  const f = fieldsOf<'project'>(pub)
  return {
    slug: pub.slug,
    href: canonicalHref(pub),
    title: pub.title,
    summary: f.summary ?? pub.excerpt ?? '',
    status: f.status,
    version: f.version,
    year: f.year ?? Number(pub.publishedAt.slice(0, 4)),
    language: f.language,
    stack: topicTags(pub),
    cover: media(pub.cover, pub.title),
    codeCover: f.codeCover
      ? {code: f.codeCover, filename: f.codeCoverFile}
      : undefined,
    featured: f.featured ?? pub.terms.some(t => t.slug === 'featured'),
    order: f.order,
    url: f.url,
    repoUrl: f.repoUrl,
    docsUrl: f.docsUrl,
    privateRepo: f.privateRepo ?? false,
    updatedAt: pub.updatedAt ?? pub.publishedAt,
    hue: f.hue ?? hueOf(pub.slug),
    glyph: f.glyph ?? initials(pub.title),
    tagline: f.tagline,
    live: Boolean(f.url),
    sourceAvailable: Boolean(f.repoUrl) && !f.privateRepo,
  }
}

export function toSettings(
  pub: ApiPublicationSummary | undefined,
): SiteSettings {
  const f = pub ? fieldsOf<'site-settings'>(pub) : {}
  return {
    tagline: f.tagline ?? t('settings.tagline'),
    contactEmail: f.contactEmail ?? 'emre@swemre.com',
    footerTagline: f.footerTagline ?? t('footer.tagline'),
    heroEyebrow: f.heroEyebrow,
    heroLead: f.heroLead,
    nowBuilding: f.nowBuilding,
    latestArticle: f.latestArticle,
    newsletterCadence: f.newsletterCadence,
    statusUrl: f.statusUrl,
    maintenance: f.maintenance ?? null,
    likedSongsTotal: f.likedSongsTotal,
    social: f.social ?? {},
  }
}

export function crumbsOf(pub: ApiPublicationSummary): Crumb[] {
  const area = pub.contentType === 'project' ? 'projects' : pub.section?.slug
  return [...(area ? [{label: area, href: `/${area}`}] : []), {label: pub.slug}]
}

export function toPage(pub: ApiPublication): Page {
  const f = fieldsOf<'page'>(pub)
  const tags = pub.terms.filter(t => t.kind === 'TAG').map(t => t.slug)
  return {
    slug: pub.slug,
    href: canonicalHref(pub),
    title: pub.title,
    eyebrow: f.eyebrow,
    lead: f.lead ?? pub.excerpt ?? undefined,
    section: pub.section ? termRef(pub.section) : undefined,
    tags,
    body: blocksOf(pub),
    updatedAt: pub.updatedAt ?? pub.publishedAt,
    policyVersion: f.policyVersion,
    effectiveDate: f.effectiveDate,
    changelogUrl: f.changelogUrl,
    pdfUrl: f.pdfUrl,
    showToc: f.showToc ?? false,
    showPrint: f.showPrint ?? false,
    seo: seoOf(pub),
    crumbs: crumbsOf(pub),
  }
}

/** Newest first. */
export const byNewest = (a: {publishedAt: string}, b: {publishedAt: string}) =>
  b.publishedAt.localeCompare(a.publishedAt)

/** Featured first, then by order, then most recently updated. */
export function byProjectOrder(a: ProjectSummary, b: ProjectSummary): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  const ao = a.order ?? Number.MAX_SAFE_INTEGER
  const bo = b.order ?? Number.MAX_SAFE_INTEGER
  if (ao !== bo) return ao - bo
  return b.updatedAt.localeCompare(a.updatedAt)
}
