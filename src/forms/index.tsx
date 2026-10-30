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
// The form template: the route picks the form, which carries its own hero text. /newsletter
// takes values carried from the home block in location.state.prefill and submits them once on
// arrival when state.submit is true. The other forms take text and option values from the query
// string (/contact?message=…), so a page can link to a filled-in form.
// Owner: agent C.
import {useLocation} from 'react-router'
import type {FormValues} from '../contract/forms.ts'
import type {TemplateProps} from '../contract/templates.ts'
import {FormPage} from './FormPage.tsx'
import {NewsletterPage} from './NewsletterPage.tsx'
import {FORM_BY_ROUTE, NEWSLETTER, type FormDef} from './specs.ts'

// eslint-disable-next-line react-refresh/only-export-components -- the brief exports these here
export {confirmSubscription, subscribe, unsubscribe} from './newsletter.ts'
export type {NewsletterOutcome, Subscriber} from './newsletter.ts'
/** The newsletter form (fields, labels, options), for the home page's copy of it. */
// eslint-disable-next-line react-refresh/only-export-components
export const newsletterSpec = NEWSLETTER

interface CarriedState {
  prefill?: FormValues
  submit?: boolean
}

export function FormTemplate({route}: TemplateProps) {
  const location = useLocation()
  const def = FORM_BY_ROUTE[route.path]
  if (!def) return null
  if (def.key === 'newsletter') {
    const carried = (location.state ?? {}) as CarriedState
    return (
      <NewsletterPage
        key={location.key}
        copy={def.hero}
        initial={carried.prefill}
        submitOnArrival={carried.submit === true}
      />
    )
  }
  return (
    <FormPage
      key={def.key}
      def={def}
      copy={def.hero}
      initial={queryPrefill(def, location.search)}
    />
  )
}

const PREFILLED = new Set(['text', 'area', 'select'])

function queryPrefill(def: FormDef, search: string): FormValues {
  const query = new URLSearchParams(search)
  const values: FormValues = {}
  for (const f of def.fields) {
    const v = query.get(f.key)
    if (v === null || !PREFILLED.has(f.kind)) continue
    if (f.options && !f.options.some(o => o.value === v)) continue
    values[f.key] = v
  }
  return values
}
