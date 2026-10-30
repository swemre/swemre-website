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

// Static UI texts and the site's language. Every text lives in texts.json, one key with every
// language side by side. The language comes from the URL prefix (/tr/...) and is fixed for the
// page load: switching language loads the other prefix, so t() can be called anywhere.
import texts from './texts.json'

export const LOCALES = ['en', 'tr'] as const
export type Locale = (typeof LOCALES)[number]
/** The language every text and publication must have, served without a URL prefix. */
export const DEFAULT_LOCALE: Locale = 'en'
/** Each language's name in that language, for the switcher. */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
}

type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & {other: string}
type Entry = Partial<Record<Locale, string | Plural>>
export type TextKey = keyof typeof texts
export type TextParams = Record<string, string | number>

const TABLE = texts as Record<string, Entry>

/** The language named by the path's first segment, or the default. */
export function localeOf(pathname: string): Locale {
  const first = pathname.split('/')[1] as Locale
  return first !== DEFAULT_LOCALE && LOCALES.includes(first)
    ? first
    : DEFAULT_LOCALE
}

/** This page load's language. */
export const locale: Locale =
  typeof window === 'undefined'
    ? DEFAULT_LOCALE
    : localeOf(window.location.pathname)

/** The router's basename: '' for the default language, else '/tr'. */
export const basename = locale === DEFAULT_LOCALE ? '' : `/${locale}`

/** The language tag for Intl and <html lang>. */
export const htmlLang = locale

/**
 * The tag for dates and numbers. English keeps the tag each call site chose (en-US dates,
 * en-GB times); other languages use their own.
 */
export function intlLocale(english = 'en-GB'): string {
  return locale === 'tr' ? 'tr-TR' : english
}

const plurals = new Intl.PluralRules(locale)

function fill(text: string, params?: TextParams): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (m, name: string) =>
    name in params ? String(params[name]) : m,
  )
}

function pick(value: string | Plural, count: number | undefined): string {
  if (typeof value === 'string') return value
  const form = count === undefined ? 'other' : plurals.select(count)
  return value[form] ?? value.other
}

/**
 * The text for a key in this page's language. A missing translation falls back to English.
 * A numeric `count` param picks the plural form; `{name}` placeholders take the params.
 */
export function t(key: TextKey, params?: TextParams): string {
  const entry = TABLE[key]
  if (!entry) return import.meta.env.DEV ? `⟦${key}⟧` : key
  const value = entry[locale] ?? entry[DEFAULT_LOCALE]
  if (value === undefined) return key
  const count = typeof params?.count === 'number' ? params.count : undefined
  return fill(pick(value, count), params)
}

/** The same page in another language: swaps the language prefix on the current path. */
export function localeHref(
  target: Locale,
  pathname: string,
  search = '',
): string {
  const first = pathname.split('/')[1]
  const bare = (LOCALES as readonly string[]).includes(first)
    ? pathname.slice(first.length + 1) || '/'
    : pathname
  const prefixed =
    target === DEFAULT_LOCALE ? bare : `/${target}${bare === '/' ? '' : bare}`
  return prefixed + search
}
