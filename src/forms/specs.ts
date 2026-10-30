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

const DESCRIBES = [
  'Engineer',
  'Engineering manager',
  'Founder',
  'Recruiter',
  'Student',
  'Other',
]
const FOUND_VIA = [
  'Search',
  'LinkedIn',
  'GitHub',
  'YouTube',
  'A friend',
  'Other',
]
const opts = (labels: string[]) => [
  {value: '', label: 'Choose one'},
  ...labels.map(l => ({value: l, label: l})),
]

const EMAIL_ERROR = 'Enter a full email address.'

export const str = (v: FormValues[string] | undefined) =>
  typeof v === 'string' ? v.trim() : ''
const given = (v: FormValues[string] | undefined) => str(v) || 'Not given'
export const firstName = (v: FormValues[string] | undefined) =>
  str(v).split(/\s+/)[0] || 'there'

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
  {value: 'architecture', label: 'Architecture'},
]

const newsletterFields: FieldSpec[] = [
  {key: 'name', kind: 'text', label: 'Full name', initial: ''},
  {
    key: 'email',
    kind: 'email',
    label: 'Email',
    required: true,
    error: EMAIL_ERROR,
    initial: '',
  },
  {
    key: 'role',
    kind: 'select',
    label: 'What best describes you',
    options: opts(DESCRIBES),
    initial: 'Engineer',
  },
  {
    key: 'source',
    kind: 'select',
    label: 'Where did you first find me',
    optional: true,
    options: opts(FOUND_VIA),
    initial: '',
  },
  {
    key: 'topics',
    kind: 'chips',
    label: 'Topics',
    optional: true,
    options: NEWSLETTER_TOPICS,
    initial: ['java', 'architecture'],
  },
  {
    key: 'consent',
    kind: 'check',
    label:
      'Email me new articles and the occasional update. I’ve read the privacy policy.',
    required: true,
    error: 'Tick this to subscribe.',
    summaryLabel: 'Consent',
    initial: false,
  },
]

export const NEWSLETTER: FormDef = {
  key: 'newsletter',
  route: '/newsletter',
  hue: 'blue',
  commits: ['ne75e11', 'acce55d'],
  fields: newsletterFields,
  groups: [
    {
      title: 'Subscribe',
      copy: '',
      rows: [
        {keys: ['name', 'email']},
        {keys: ['role', 'source'], gap: 24},
        {keys: ['topics'], gap: 32},
        {keys: ['consent'], gap: 32},
      ],
    },
  ],
  submitLabel: 'Subscribe',
  submitIcon: 'arrow-right',
  busyStatus: 'Subscribing you. Keep this page open.',
  failureStatus:
    'That didn’t subscribe you. Nothing was lost, so press Try again.',
  done: {title: 'Subscribed', copy: ''},
  receipt: {
    title: 'Almost done. Check your inbox.',
    copy: v =>
      `I sent a confirmation link to ${str(v.email)}. Click it and the next article comes straight to you. Not there in a minute? Look in spam or promotions.`,
    items: v => [
      ['Email', str(v.email)],
      [
        'Topics',
        chosen(newsletterFields[4], v.topics).join(', ') || 'None picked',
      ],
      ['Frequency', 'At most twice a month'],
      ['Sent from', 'emre@swemre.com'],
    ],
    command: v => `subscribe --email ${str(v.email)}`,
  },
}

export const CONTACT: FormDef = {
  key: 'contact',
  route: '/contact',
  hue: 'aqua',
  commits: ['c0ntac7', '5e7d0a1'],
  fields: [
    {key: 'fullName', kind: 'text', label: 'Full name', initial: ''},
    {
      key: 'email',
      kind: 'email',
      label: 'Email',
      required: true,
      error: EMAIL_ERROR,
      initial: '',
    },
    {
      key: 'phone',
      kind: 'tel',
      label: 'Phone',
      optional: true,
      placeholder: '+44 7700 900000',
      initial: '',
    },
    {
      key: 'describesYou',
      kind: 'select',
      label: 'What best describes you',
      options: opts(DESCRIBES),
      initial: 'Engineer',
    },
    {
      key: 'foundVia',
      kind: 'select',
      label: 'Where did you first find me',
      optional: true,
      options: opts(FOUND_VIA),
      initial: '',
    },
    {
      key: 'favouriteLanguage',
      kind: 'text',
      label: 'Favourite programming language',
      optional: true,
      placeholder: 'Java, obviously',
      initial: '',
    },
    {
      key: 'message',
      kind: 'area',
      label: 'Message',
      required: true,
      placeholder:
        'A sentence or two on the project and what you need from me.',
      error: 'Tell me a little about what you need.',
      initial: '',
    },
    {
      key: 'consent',
      kind: 'check',
      label: 'I agree my details are used to reply to this message.',
      required: true,
      error: 'Tick this so I can reply.',
      summaryLabel: 'Consent',
      initial: false,
    },
    {
      key: 'newsletterOptIn',
      kind: 'check',
      label: 'Also send me new articles by email',
      hint: '(optional, unsubscribe any time)',
      initial: false,
    },
  ],
  groups: [
    {
      title: 'About you',
      copy: 'So I know who I’m replying to.',
      rows: [
        {keys: ['fullName', 'email']},
        {keys: ['phone'], pad: true, gap: 24},
      ],
    },
    {
      title: 'Background',
      copy: 'Helps me pitch the reply right.',
      rows: [
        {keys: ['describesYou', 'foundVia']},
        {keys: ['favouriteLanguage'], gap: 24},
      ],
    },
    {
      title: 'Your message',
      copy: 'The more context, the better.',
      rows: [{keys: ['message']}],
    },
    {
      title: 'Send',
      copy: 'I reply within two working days.',
      rows: [{keys: ['consent', 'newsletterOptIn']}],
    },
  ],
  submitLabel: 'Send message',
  submitIcon: 'arrow-right',
  busyStatus: 'Sending your message. Keep this page open.',
  failureStatus:
    'That didn’t send. Nothing was lost, so press Try again or email me.',
  done: {
    title: 'Sent',
    copy: 'A copy of what you sent. Nothing else is stored.',
  },
  receipt: {
    title: 'Message sent.',
    copy: v =>
      `Thanks, ${firstName(v.fullName)}. I’ll reply within two working days, from my own inbox, not a no-reply address. Here’s what you sent.`,
    items: v => [
      ['From', given(v.fullName)],
      ['Reply to', str(v.email)],
      ['Phone', given(v.phone)],
      ['Role', given(v.describesYou)],
      ['Found via', given(v.foundVia)],
      ['Message', str(v.message)],
    ],
    command: () => 'send --message',
  },
}

export const RESUME: FormDef = {
  key: 'cv-request',
  route: '/resume',
  hue: 'aqua',
  commits: ['cafe5ee', 'beefcab'],
  fields: [
    {key: 'fullName', kind: 'text', label: 'Full name', initial: ''},
    {
      key: 'email',
      kind: 'email',
      label: 'Email',
      hint: 'The PDF is sent here, nowhere else.',
      initial: '',
    },
    {
      key: 'company',
      kind: 'text',
      label: 'Company',
      required: true,
      placeholder: 'Company, or “Independent”',
      error: 'Enter your company, or “Independent”.',
      initial: '',
    },
    {
      key: 'reason',
      kind: 'select',
      label: 'Reason',
      required: true,
      options: opts([
        'Hiring for a role',
        'Freelance project',
        'Conference or talk',
        'Other',
      ]),
      error: 'Choose a reason.',
      initial: '',
    },
    {
      key: 'roleOrProject',
      kind: 'text',
      label: 'Role or project',
      optional: true,
      placeholder: 'What the role or project is about',
      initial: '',
    },
    {
      key: 'consent',
      kind: 'check',
      label: 'I agree my details are used to send the resume and to reply.',
      required: true,
      error: 'Tick this so I can send it.',
      summaryLabel: 'Consent',
      initial: false,
    },
  ],
  groups: [
    {
      title: 'About you',
      copy: 'So I know who is asking.',
      rows: [{keys: ['fullName', 'email']}],
    },
    {
      title: 'Why you need it',
      copy: 'A line of context helps me answer well.',
      rows: [{keys: ['company', 'reason']}, {keys: ['roleOrProject'], gap: 24}],
    },
    {
      title: 'Send',
      copy: 'One email with the PDF, nothing else.',
      rows: [{keys: ['consent']}],
    },
  ],
  submitLabel: 'Request resume',
  submitIcon: 'arrow-right',
  busyStatus: 'Sending your request. Keep this page open.',
  failureStatus:
    'That didn’t send. Nothing was lost, so press Try again or email me.',
  done: {
    title: 'Requested',
    copy: 'The details I use to send it. Nothing else is stored.',
  },
  receipt: {
    title: 'Resume on its way.',
    copy: v =>
      `Thanks, ${firstName(v.fullName)}. I check each request myself; the PDF arrives at ${str(v.email) || 'your email'} within one working day.`,
    items: v => [
      ['Name', given(v.fullName)],
      ['Send to', given(v.email)],
      ['Company', str(v.company)],
      ['Reason', str(v.reason)],
      ...(str(v.roleOrProject)
        ? [['Role', str(v.roleOrProject)] as [string, string]]
        : []),
    ],
    command: () => 'request --resume',
  },
}

const SLOTS = [
  {value: 'weekday-mornings', label: 'Weekday mornings'},
  {value: 'weekday-afternoons', label: 'Weekday afternoons'},
  {value: 'weekday-evenings', label: 'Weekday evenings'},
  {value: 'saturday-morning', label: 'Saturday morning'},
]
const callbackFields: FieldSpec[] = [
  {key: 'fullName', kind: 'text', label: 'Full name', initial: ''},
  {
    key: 'contact',
    kind: 'contact',
    label: 'Phone or email',
    required: true,
    placeholder: '+31 6 2345 6789 or you@example.com',
    hint: 'I call, or email to set up a video call.',
    error: 'Enter a full phone number or an email.',
    initial: '',
  },
  {
    key: 'preferredTime',
    kind: 'chips',
    label: 'Preferred time',
    required: true,
    options: SLOTS,
    error: 'Pick at least one time slot.',
    initial: ['weekday-mornings'],
  },
  {
    key: 'timeZone',
    kind: 'select',
    label: 'Time zone',
    options: opts([
      'Europe/Amsterdam (CET)',
      'Europe/London (GMT)',
      'America/New_York (ET)',
      'Asia/Singapore (SGT)',
    ]),
    initial: 'Europe/Amsterdam (CET)',
  },
  {
    key: 'topic',
    kind: 'select',
    label: 'Topic',
    required: true,
    options: opts([
      'Architecture review',
      'Spring Boot',
      'React front end',
      'Hiring',
      'Something else',
    ]),
    error: 'Choose a topic.',
    initial: '',
  },
  {
    key: 'note',
    kind: 'area',
    label: 'Note',
    optional: true,
    placeholder: 'Anything I should read before the call',
    initial: '',
  },
  {
    key: 'consent',
    kind: 'check',
    label: 'I agree my details are used to call me back.',
    required: true,
    error: 'Tick this so I can call you.',
    summaryLabel: 'Consent',
    initial: false,
  },
]

export const CALLBACK: FormDef = {
  key: 'callback-request',
  route: '/call-back',
  hue: 'aqua',
  commits: ['ca11bac', 'd1a10ff'],
  fields: callbackFields,
  groups: [
    {
      title: 'About you',
      copy: 'Who I’m calling, and how to reach you.',
      rows: [{keys: ['fullName', 'contact']}],
    },
    {
      title: 'When',
      copy: 'Pick every slot that works. Times are in your time zone.',
      rows: [
        {keys: ['preferredTime']},
        {keys: ['timeZone'], pad: true, gap: 32},
      ],
    },
    {
      title: 'What about',
      copy: 'So I come prepared.',
      rows: [
        {keys: ['topic'], pad: true},
        {keys: ['note'], gap: 24},
      ],
    },
    {
      title: 'Send',
      copy: 'A short email confirms the time first.',
      rows: [{keys: ['consent']}],
    },
  ],
  submitLabel: 'Request call back',
  submitIcon: 'phone',
  busyStatus: 'Sending your request. Keep this page open.',
  failureStatus:
    'That didn’t send. Nothing was lost, so press Try again or email me.',
  done: {
    title: 'Requested',
    copy: 'What I need to call you. Nothing else is stored.',
  },
  receipt: {
    title: 'Call back requested.',
    copy: v =>
      `Thanks, ${firstName(v.fullName)}. I’ll call you in one of the slots you picked and send a short email first to confirm the time.`,
    items: v => [
      ['Name', given(v.fullName)],
      ['Reach me on', str(v.contact)],
      ['Slots', joinLabels(chosen(callbackFields[2], v.preferredTime))],
      ['Time zone', given(v.timeZone)],
      ['Topic', str(v.topic)],
    ],
    command: () => 'request --call-back',
  },
}

export const FORMS: Record<string, FormDef> = {
  newsletter: NEWSLETTER,
  contact: CONTACT,
  'cv-request': RESUME,
  'callback-request': CALLBACK,
}

/** The form of a route, for pages without a formKey. */
export const FORM_BY_ROUTE: Record<string, FormDef> = Object.fromEntries(
  Object.values(FORMS).map(f => [f.route, f]),
)
