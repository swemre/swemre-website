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
// The four forms: fields, options, copy and layout from the V4 playables (META) and
// product-spec 2.7. Field keys are the API field keys of each form table. Owner: agent C.
import type {FormKey} from '../contract/api.ts'
import type {FieldSpec, FormValues} from '../contract/forms.ts'
import {t, type TextKey} from '../i18n/index.ts'

/** A row of fields: two side by side (one column on mobile), or one at full width. pad keeps a
 * single field at half width with an empty cell beside it. gap is the space above the row. */
export interface Row {
  keys: string[]
  pad?: boolean
  gap?: number
}
export interface Group {
  title: string
  copy: string
  rows: Row[]
}
export interface Receipt {
  title: string
  copy: (v: FormValues) => string
  items: (v: FormValues) => [string, string][]
  command: (v: FormValues) => string
}
export interface FormDef {
  key: FormKey
  route: string
  /** The page's hero text. */
  hero: {eyebrow: string; title: string; lead: string}
  /** Hue of the page: rail, number, glow and receipt. */
  hue: 'aqua' | 'blue'
  /** Rail labels of the hero and the form section (desktop and 4K). */
  commits: [string, string]
  fields: FieldSpec[]
  groups: Group[]
  submitLabel: string
  submitIcon: 'arrow-right' | 'phone'
  busyStatus: string
  failureStatus: string
  /** The group shown in place of the form after success. */
  done: {title: string; copy: string}
  receipt: Receipt
}

// Option values stay in English, as the form tables store them; only the labels are translated.
const DESCRIBES: [string, TextKey][] = [
  ['Engineer', 'form.describes.engineer'],
  ['Engineering manager', 'form.describes.manager'],
  ['Founder', 'form.describes.founder'],
  ['Recruiter', 'form.describes.recruiter'],
  ['Student', 'form.describes.student'],
  ['Other', 'form.option.other'],
]
const FOUND_VIA: [string, TextKey][] = [
  ['Search', 'form.found.search'],
  ['LinkedIn', 'form.found.linkedin'],
  ['GitHub', 'form.found.github'],
  ['YouTube', 'form.found.youtube'],
  ['A friend', 'form.found.friend'],
  ['Other', 'form.option.other'],
]
/** Values that read the same in every language (time zones). */
const same = (values: string[]): [string, string][] => values.map(v => [v, v])
const opts = (options: [string, TextKey | string][], translate = true) => [
  {value: '', label: t('form.option.choose')},
  ...options.map(([value, label]) => ({
    value,
    label: translate ? t(label as TextKey) : label,
  })),
]
/** The label of a select's chosen value, for the receipt. */
function labelOf(spec: FieldSpec, v: FormValues[string] | undefined): string {
  const value = str(v)
  return spec.options?.find(o => o.value === value && value)?.label ?? value
}

const EMAIL_ERROR = t('form.error.email')

export const str = (v: FormValues[string] | undefined) =>
  typeof v === 'string' ? v.trim() : ''
const given = (v: FormValues[string] | undefined) =>
  str(v) || t('form.notGiven')
export const firstName = (v: FormValues[string] | undefined) =>
  str(v).split(/\s+/)[0] || t('form.there')

/** "Weekday mornings, weekday evenings": the first as written, the rest in lower case. */
export function joinLabels(labels: string[]): string {
  return labels
    .map((l, i) => (i === 0 ? l : l.charAt(0).toLowerCase() + l.slice(1)))
    .join(', ')
}
function chosen(spec: FieldSpec, v: FormValues[string] | undefined): string[] {
  const values = Array.isArray(v) ? v : []
  return (spec.options ?? [])
    .filter(o => values.includes(o.value))
    .map(o => o.label)
}

export const NEWSLETTER_TOPICS = [
  {value: 'java', label: 'Java'},
  {value: 'react', label: 'React'},
  {value: 'ai', label: 'AI'},
  {value: 'architecture', label: t('form.topic.architecture')},
]

const newsletterFields: FieldSpec[] = [
  {key: 'name', kind: 'text', label: t('form.fullName'), initial: ''},
  {
    key: 'email',
    kind: 'email',
    label: t('form.email'),
    required: true,
    error: EMAIL_ERROR,
    initial: '',
  },
  {
    key: 'role',
    kind: 'select',
    label: t('form.describes'),
    options: opts(DESCRIBES),
    initial: 'Engineer',
  },
  {
    key: 'source',
    kind: 'select',
    label: t('form.found'),
    optional: true,
    options: opts(FOUND_VIA),
    initial: '',
  },
  {
    key: 'topics',
    kind: 'chips',
    label: t('form.topics'),
    optional: true,
    options: NEWSLETTER_TOPICS,
    initial: ['java', 'architecture'],
  },
  {
    key: 'consent',
    kind: 'check',
    label: t('form.newsletter.consent'),
    required: true,
    error: t('form.newsletter.consent.error'),
    summaryLabel: t('form.consent'),
    initial: false,
  },
]

export const NEWSLETTER: FormDef = {
  key: 'newsletter',
  route: '/newsletter',
  hero: {
    eyebrow: t('form.newsletter.page.eyebrow'),
    title: t('form.newsletter.page.title'),
    lead: t('form.newsletter.page.lead'),
  },
  hue: 'blue',
  commits: ['ne75e11', 'acce55d'],
  fields: newsletterFields,
  groups: [
    {
      title: t('nav.subscribe'),
      copy: '',
      rows: [
        {keys: ['name', 'email']},
        {keys: ['role', 'source'], gap: 24},
        {keys: ['topics'], gap: 32},
        {keys: ['consent'], gap: 32},
      ],
    },
  ],
  submitLabel: t('nav.subscribe'),
  submitIcon: 'arrow-right',
  busyStatus: t('form.newsletter.busy'),
  failureStatus: t('form.newsletter.failure'),
  done: {title: t('form.newsletter.done'), copy: ''},
  receipt: {
    title: t('form.newsletter.receipt.title'),
    copy: v => t('form.newsletter.receipt.copy', {email: str(v.email)}),
    items: v => [
      [t('form.email'), str(v.email)],
      [
        t('form.topics'),
        chosen(newsletterFields[4], v.topics).join(', ') ||
          t('form.nonePicked'),
      ],
      [t('form.frequency'), t('form.frequency.value')],
      [t('form.sentFrom'), 'emre@swemre.com'],
    ],
    command: v => `subscribe --email ${str(v.email)}`,
  },
}

export const CONTACT: FormDef = {
  key: 'contact',
  route: '/contact',
  hero: {
    eyebrow: t('form.contact.page.eyebrow'),
    title: t('form.contact.page.title'),
    lead: t('form.contact.page.lead'),
  },
  hue: 'aqua',
  commits: ['c0ntac7', '5e7d0a1'],
  fields: [
    {key: 'fullName', kind: 'text', label: t('form.fullName'), initial: ''},
    {
      key: 'email',
      kind: 'email',
      label: t('form.email'),
      required: true,
      error: EMAIL_ERROR,
      initial: '',
    },
    {
      key: 'phone',
      kind: 'tel',
      label: t('form.phone'),
      optional: true,
      placeholder: '+44 7700 900000',
      initial: '',
    },
    {
      key: 'describesYou',
      kind: 'select',
      label: t('form.describes'),
      options: opts(DESCRIBES),
      initial: 'Engineer',
    },
    {
      key: 'foundVia',
      kind: 'select',
      label: t('form.found'),
      optional: true,
      options: opts(FOUND_VIA),
      initial: '',
    },
    {
      key: 'favouriteLanguage',
      kind: 'text',
      label: t('form.favouriteLanguage'),
      optional: true,
      placeholder: t('form.favouriteLanguage.placeholder'),
      initial: '',
    },
    {
      key: 'message',
      kind: 'area',
      label: t('form.message'),
      required: true,
      placeholder: t('form.message.placeholder'),
      error: t('form.message.error'),
      initial: '',
    },
    {
      key: 'consent',
      kind: 'check',
      label: t('form.contact.consent'),
      required: true,
      error: t('form.contact.consent.error'),
      summaryLabel: t('form.consent'),
      initial: false,
    },
    {
      key: 'newsletterOptIn',
      kind: 'check',
      label: t('form.contact.optIn'),
      hint: t('form.contact.optIn.hint'),
      initial: false,
    },
  ],
  groups: [
    {
      title: t('form.group.aboutYou'),
      copy: t('form.contact.group.aboutYou'),
      rows: [
        {keys: ['fullName', 'email']},
        {keys: ['phone'], pad: true, gap: 24},
      ],
    },
    {
      title: t('form.group.background'),
      copy: t('form.contact.group.background'),
      rows: [
        {keys: ['describesYou', 'foundVia']},
        {keys: ['favouriteLanguage'], gap: 24},
      ],
    },
    {
      title: t('form.group.message'),
      copy: t('form.contact.group.message'),
      rows: [{keys: ['message']}],
    },
    {
      title: t('form.group.send'),
      copy: t('form.contact.group.send'),
      rows: [{keys: ['consent', 'newsletterOptIn']}],
    },
  ],
  submitLabel: t('form.contact.submit'),
  submitIcon: 'arrow-right',
  busyStatus: t('form.contact.busy'),
  failureStatus: t('form.failure'),
  done: {
    title: t('form.contact.done'),
    copy: t('form.contact.done.copy'),
  },
  receipt: {
    title: t('form.contact.receipt.title'),
    copy: v => t('form.contact.receipt.copy', {name: firstName(v.fullName)}),
    items: v => [
      [t('form.receipt.from'), given(v.fullName)],
      [t('form.receipt.replyTo'), str(v.email)],
      [t('form.phone'), given(v.phone)],
      [
        t('form.receipt.role'),
        given(labelOf(CONTACT.fields[3], v.describesYou)),
      ],
      [
        t('form.receipt.foundVia'),
        given(labelOf(CONTACT.fields[4], v.foundVia)),
      ],
      [t('form.message'), str(v.message)],
    ],
    command: () => 'send --message',
  },
}

const SLOTS = [
  {value: 'weekday-mornings', label: t('form.slot.weekdayMornings')},
  {value: 'weekday-afternoons', label: t('form.slot.weekdayAfternoons')},
  {value: 'weekday-evenings', label: t('form.slot.weekdayEvenings')},
  {value: 'saturday-morning', label: t('form.slot.saturdayMorning')},
]
const callbackFields: FieldSpec[] = [
  {key: 'fullName', kind: 'text', label: t('form.fullName'), initial: ''},
  {
    key: 'contact',
    kind: 'contact',
    label: t('form.callback.contact'),
    required: true,
    placeholder: t('form.callback.contact.placeholder'),
    hint: t('form.callback.contact.hint'),
    error: t('form.callback.contact.error'),
    initial: '',
  },
  {
    key: 'preferredTime',
    kind: 'chips',
    label: t('form.callback.time'),
    required: true,
    options: SLOTS,
    error: t('form.callback.time.error'),
    initial: ['weekday-mornings'],
  },
  {
    key: 'timeZone',
    kind: 'select',
    label: t('form.callback.timeZone'),
    options: opts(
      same([
        'Europe/Amsterdam (CET)',
        'Europe/London (GMT)',
        'America/New_York (ET)',
        'Asia/Singapore (SGT)',
      ]),
      false,
    ),
    initial: 'Europe/Amsterdam (CET)',
  },
  {
    key: 'topic',
    kind: 'select',
    label: t('form.callback.topic'),
    required: true,
    options: opts([
      ['Architecture review', 'form.callback.topic.review'],
      ['Spring Boot', 'form.callback.topic.springBoot'],
      ['React front end', 'form.callback.topic.react'],
      ['Hiring', 'form.callback.topic.hiring'],
      ['Something else', 'form.callback.topic.else'],
    ]),
    error: t('form.callback.topic.error'),
    initial: '',
  },
  {
    key: 'note',
    kind: 'area',
    label: t('form.callback.note'),
    optional: true,
    placeholder: t('form.callback.note.placeholder'),
    initial: '',
  },
  {
    key: 'consent',
    kind: 'check',
    label: t('form.callback.consent'),
    required: true,
    error: t('form.callback.consent.error'),
    summaryLabel: t('form.consent'),
    initial: false,
  },
]

export const CALLBACK: FormDef = {
  key: 'callback-request',
  route: '/call-back',
  hero: {
    eyebrow: t('form.callback.page.eyebrow'),
    title: t('form.callback.page.title'),
    lead: t('form.callback.page.lead'),
  },
  hue: 'aqua',
  commits: ['ca11bac', 'd1a10ff'],
  fields: callbackFields,
  groups: [
    {
      title: t('form.group.aboutYou'),
      copy: t('form.callback.group.aboutYou'),
      rows: [{keys: ['fullName', 'contact']}],
    },
    {
      title: t('form.group.when'),
      copy: t('form.callback.group.when'),
      rows: [
        {keys: ['preferredTime']},
        {keys: ['timeZone'], pad: true, gap: 32},
      ],
    },
    {
      title: t('form.group.whatAbout'),
      copy: t('form.callback.group.whatAbout'),
      rows: [
        {keys: ['topic'], pad: true},
        {keys: ['note'], gap: 24},
      ],
    },
    {
      title: t('form.group.send'),
      copy: t('form.callback.group.send'),
      rows: [{keys: ['consent']}],
    },
  ],
  submitLabel: t('form.callback.submit'),
  submitIcon: 'phone',
  busyStatus: t('form.callback.busy'),
  failureStatus: t('form.failure'),
  done: {
    title: t('form.callback.done'),
    copy: t('form.callback.done.copy'),
  },
  receipt: {
    title: t('form.callback.receipt.title'),
    copy: v => t('form.callback.receipt.copy', {name: firstName(v.fullName)}),
    items: v => [
      [t('form.receipt.name'), given(v.fullName)],
      [t('form.receipt.reachMe'), str(v.contact)],
      [
        t('form.receipt.slots'),
        joinLabels(chosen(callbackFields[2], v.preferredTime)),
      ],
      [t('form.callback.timeZone'), given(v.timeZone)],
      [t('form.callback.topic'), labelOf(callbackFields[4], v.topic)],
    ],
    command: () => 'request --call-back',
  },
}

export const FORM_BY_ROUTE: Record<string, FormDef> = Object.fromEntries(
  [NEWSLETTER, CONTACT, CALLBACK].map(f => [f.route, f]),
)
