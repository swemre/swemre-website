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

// "0x05 // subscribe": a copy of the newsletter form. Subscribe carries the typed values to
// /newsletter, which fills its own form and submits there (spec Q13).
import {useState, type FormEvent} from 'react'
import {useNavigate} from 'react-router-dom'
import {Checkbox, Chip, Field, useViewport} from '../../design/index.tsx'
import {Prompt} from './kit/layout.tsx'
import {Rail} from './kit/Rail.tsx'
import {SectionBg} from './kit/SectionBg.tsx'
import {Button, Eyebrow, SectionNumber} from './kit/ui.ts'
import {useV} from './kit/vp.ts'

const DESCRIBES = [
  'Engineer',
  'Engineering manager',
  'Founder',
  'Recruiter',
  'Student',
  'Other',
]
const FOUND = ['Search', 'LinkedIn', 'GitHub', 'YouTube', 'A friend', 'Other']
const TOPICS: [string, string][] = [
  ['java', 'Java'],
  ['react', 'React'],
  ['ai', 'AI'],
  ['architecture', 'Architecture'],
]
const options = (list: string[]) => [
  {value: '', label: 'Choose one'},
  ...list.map(o => ({value: o, label: o})),
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

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    void navigate('/newsletter', {
      state: {
        prefill: {
          name: fullName,
          email,
          role: describesYou,
          source: foundVia,
          topics,
          consent,
        },
        submit: true,
      },
    })
  }
  const toggle = (key: string) =>
    setTopics(t => (t.includes(key) ? t.filter(k => k !== key) : [...t, key]))

  const name = (
    <Field
      label="Full name"
      name="fullName"
      value={fullName}
      onChange={setFullName}
      autoComplete="name"
    />
  )
  const mail = (
    <Field
      label="Email"
      name="email"
      kind="email"
      value={email}
      onChange={setEmail}
      autoComplete="email"
    />
  )
  const describes = (
    <Field
      label="What best describes you"
      name="describesYou"
      kind="select"
      value={describesYou}
      onChange={setDescribesYou}
      options={options(DESCRIBES)}
    />
  )
  const found = (
    <Field
      label="Where did you first find me"
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
        Topics<em>optional</em>
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
      label={
        <>
          Email me new articles and the occasional update. I’ve read the{' '}
          <a
            className="a2-ilink"
            href="/policies/privacy-policy"
            onClick={e => {
              e.preventDefault()
              void navigate('/policies/privacy-policy')
            }}
          >
            privacy policy
          </a>
          .
        </>
      }
    />
  )
  const button = (block?: boolean) => (
    <Button
      label="Subscribe"
      kind="primary"
      type="submit"
      iconRight="arrow-right"
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
            <span className="a2-msg" />
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
            <Eyebrow>subscribe</Eyebrow>
            <h2 className="a2-h2" id="home-subscribe">
              Get the next letter in your inbox.
            </h2>
            <Prompt command="subscribe --email" caret />
          </div>
        </div>
        <div style={{marginTop: v(48, 48, 64)}}>
          <form
            aria-label="Subscribe to the newsletter"
            noValidate
            onSubmit={submit}
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
