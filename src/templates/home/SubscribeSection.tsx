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

// "0x05 // subscribe": a copy of the newsletter form. Subscribe checks the email and consent,
// signs up right here and goes on to the thank-you page (/newsletter/thanks).
import {useState, type FormEvent} from 'react'
import {useNavigate} from 'react-router-dom'
import {EMAIL_RE} from '../../contract/forms.ts'
import {Checkbox, Chip, Field, useViewport} from '../../design/index.tsx'
import {subscribe} from '../../forms/index.tsx'
import {Prompt} from './kit/layout.tsx'
import {Rail} from './kit/Rail.tsx'
import {SectionBg} from './kit/SectionBg.tsx'
import {Button, Eyebrow, SectionNumber} from './kit/ui.ts'
import {useV} from './kit/vp.ts'
import {t, type TextKey} from '../../i18n/index.ts'

// Values stay in English, as the newsletter form stores them; the labels follow the language.
const DESCRIBES: [string, TextKey][] = [
  ['Engineer', 'form.describes.engineer'],
  ['Engineering manager', 'form.describes.manager'],
  ['Founder', 'form.describes.founder'],
  ['Recruiter', 'form.describes.recruiter'],
  ['Student', 'form.describes.student'],
  ['Other', 'form.option.other'],
]
const FOUND: [string, TextKey][] = [
  ['Search', 'form.found.search'],
  ['LinkedIn', 'form.found.linkedin'],
  ['GitHub', 'form.found.github'],
  ['YouTube', 'form.found.youtube'],
  ['A friend', 'form.found.friend'],
  ['Other', 'form.option.other'],
]
const TOPICS: [string, string][] = [
  ['java', 'Java'],
  ['react', 'React'],
  ['ai', 'AI'],
  ['architecture', t('form.topic.architecture')],
]
const options = (list: [string, TextKey][]) => [
  {value: '', label: t('form.option.choose')},
  ...list.map(([value, label]) => ({value, label: t(label)})),
]

export function SubscribeSection() {
  const v = useV()
  const vp = useViewport()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [describesYou, setDescribesYou] = useState('Engineer')
  const [foundVia, setFoundVia] = useState('')
  const [topics, setTopics] = useState<string[]>(['java', 'architecture'])
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState('')

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    if (busy) return
    const local: Record<string, string> = {}
    if (!EMAIL_RE.test(email.trim())) local.email = t('form.error.email')
    if (!consent) local.consent = t('form.newsletter.consent.error')
    setErrors(local)
    setFailed('')
    if (Object.keys(local).length) return
    setBusy(true)
    const res = await subscribe({
      name: fullName.trim(),
      email: email.trim(),
      role: describesYou,
      source: foundVia || null,
      topics,
      consent,
    })
    setBusy(false)
    if (res.ok) {
      void navigate('/newsletter/thanks', {
        state: {name: fullName.trim(), email: email.trim(), topics},
      })
    } else if (Object.keys(res.fields).length) {
      setErrors(res.fields)
    } else {
      setFailed(t('home.subscribe.failed'))
    }
  }
  const fieldState = (key: string) =>
    errors[key] ? ('error' as const) : busy ? ('busy' as const) : undefined
  const toggle = (key: string) =>
    setTopics(ts =>
      ts.includes(key) ? ts.filter(k => k !== key) : [...ts, key],
    )

  const name = (
    <Field
      label={t('form.fullName')}
      name="fullName"
      value={fullName}
      onChange={setFullName}
    />
  )
  const mail = (
    <Field
      label={t('form.email')}
      name="email"
      kind="email"
      value={email}
      onChange={setEmail}
      state={fieldState('email')}
      error={errors.email}
    />
  )
  const describes = (
    <Field
      label={t('form.describes')}
      name="describesYou"
      kind="select"
      value={describesYou}
      onChange={setDescribesYou}
      options={options(DESCRIBES)}
    />
  )
  const found = (
    <Field
      label={t('form.found')}
      name="foundVia"
      kind="select"
      value={foundVia}
      onChange={setFoundVia}
      options={options(FOUND)}
    />
  )
  const chips = (
    <fieldset className="a2-field">
      <legend className="a2-label" style={{marginBottom: 8}}>
        {t('form.topics')}
        <em>{t('form.optional')}</em>
      </legend>
      <div className="a2-chips">
        {TOPICS.map(([key, label]) => (
          <Chip
            key={key}
            label={label}
            check
            active={topics.includes(key)}
            pressed={topics.includes(key)}
            onClick={() => toggle(key)}
          />
        ))}
      </div>
      <span className="a2-msg" style={{marginTop: 8}} />
    </fieldset>
  )
  const check = (
    <Checkbox
      name="consent"
      checked={consent}
      onChange={setConsent}
      state={errors.consent ? 'error' : undefined}
      error={errors.consent}
      label={
        <>
          {t('home.subscribe.consent.before')}
          <a
            className="a2-ilink"
            href="/policies/privacy-policy"
            onClick={e => {
              e.preventDefault()
              void navigate('/policies/privacy-policy')
            }}
          >
            {t('home.subscribe.consent.link')}
          </a>
          {t('home.subscribe.consent.after')}
        </>
      }
    />
  )
  const button = (block?: boolean) => (
    <Button
      label={t('nav.subscribe')}
      kind="primary"
      type="submit"
      iconRight="arrow-right"
      state={busy ? 'busy' : undefined}
      block={block}
      style={block ? undefined : {width: 176}}
    />
  )

  let body
  if (vp === 'm')
    body = (
      <>
        {name}
        {mail}
        {describes}
        {found}
        {chips}
        {check}
        <div>{button(true)}</div>
        {failed && (
          <span className="a2-msg" role="status">
            {failed}
          </span>
        )}
      </>
    )
  else if (vp === 't')
    body = (
      <>
        <div
          className="a2-cols"
          style={{gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 24}}
        >
          {name}
          {mail}
          {describes}
          {found}
        </div>
        {chips}
        {check}
        <div>{button()}</div>
        {failed && (
          <span className="a2-msg" role="status">
            {failed}
          </span>
        )}
      </>
    )
  else
    body = (
      <>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,minmax(0,1fr)) auto',
            gap: 24,
            alignItems: 'end',
          }}
        >
          {name}
          {mail}
          {describes}
          {found}
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {button()}
            <span className="a2-msg" role="status">
              {failed}
            </span>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0,1fr)',
            gap: 64,
            alignItems: 'end',
          }}
        >
          {chips}
          <div style={{paddingBottom: 4}}>{check}</div>
        </div>
      </>
    )

  return (
    <section className="a2-sec" data-cut aria-labelledby="home-subscribe">
      <SectionBg
        hue="aqua"
        at={[30, 46]}
        second={{at: [22, 24]}}
        texture="hatch"
      />
      <Rail
        from="mist"
        to="aqua"
        node={[69, 95, 130, 166]}
        label="acce55d"
        end
      />
      <div className="a2-c">
        <div
          id="subscribe"
          style={{
            display: 'flex',
            flexDirection: vp === 'm' ? 'column' : undefined,
            alignItems: vp === 'm' ? 'flex-start' : 'flex-end',
            gap: v(24, 24, 32),
          }}
        >
          <SectionNumber number={['05', '0x', '', 'aqua']} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              minWidth: 0,
            }}
          >
            <Eyebrow>{t('newsletter.subscribe.eyebrow')}</Eyebrow>
            <h2 className="a2-h2" id="home-subscribe">
              {t('newsletter.subscribe.title')}
            </h2>
            <Prompt command="subscribe --email" caret />
          </div>
        </div>
        <div style={{marginTop: v(48, 48, 64)}}>
          <form
            autoComplete="off"
            aria-label={t('newsletter.form.label')}
            noValidate
            onSubmit={e => void submit(e)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: v(24, 24, 32),
            }}
          >
            {body}
          </form>
        </div>
      </div>
    </section>
  )
}
