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

// Date and time formats used on the boards, in Amsterdam time.
import {intlLocale, t} from '../../i18n/index.ts'

const TZ = 'Europe/Amsterdam'

/** "Oct 23, 2026" */
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(intlLocale('en-US'), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: TZ,
  })
}

/** "15 October 2026" */
export function fmtLongDate(iso: string) {
  return new Date(iso).toLocaleDateString(intlLocale('en-GB'), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  })
}

/** "09:00 CET" */
export function fmtClock(iso: string) {
  const d = new Date(iso)
  const time = d.toLocaleTimeString(intlLocale('en-GB'), {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  })
  const zone =
    new Intl.DateTimeFormat(intlLocale('en-GB'), {
      timeZone: TZ,
      timeZoneName: 'short',
    })
      .formatToParts(d)
      .find(p => p.type === 'timeZoneName')?.value ?? ''
  return `${time} ${zone.replace('GMT+1', 'CET').replace('GMT+2', 'CEST')}`.trim()
}

export const minRead = (n?: number) =>
  n ? t('article.minRead', {count: n}) : ''

const ISO_DAY = /^\d{4}-\d{2}-\d{2}/

/** "01 Sep 2026" */
export function fmtDayMonth(iso: string) {
  const parts = new Intl.DateTimeFormat(intlLocale('en-US'), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: TZ,
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${get('day')} ${get('month')} ${get('year')}`
}

/** Timeline dates: ISO days are formatted per variant ("Oct 20, 2026" or "15 Oct 2026"); other
 * strings are shown as written. */
export function fmtTimelineDate(date: string, single: boolean) {
  if (!ISO_DAY.test(date)) return date
  const iso = date.length === 10 ? `${date}T12:00:00Z` : date
  return single ? fmtDayMonth(iso) : fmtDate(iso)
}
