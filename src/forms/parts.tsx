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
// Pieces shared by the form pages: one field by its spec, the field rows, the status slot and
// submit row, the hero title with the squiggle under its last word. Owner: agent C.
import type {CSSProperties, ReactNode} from 'react'
import type {FieldSpec} from '../contract/forms.ts'
import {
  Anchor,
  Button,
  Checkbox,
  Chip,
  Field,
  Icon,
  StatusLine,
  useViewport,
  type IconName,
} from '../design/index.tsx'
import type {Machine} from './useFormMachine.ts'
import {errorSummary} from './validate.ts'
import type {FormDef, Row} from './specs.ts'

const PRIVACY = '/policies/privacy-policy'

/** The consent label with its privacy link: inline when the copy names the policy, else after. */
function checkLabel(f: FieldSpec): ReactNode {
  const i = f.label.toLowerCase().indexOf('privacy policy')
  if (i >= 0) {
    return (
      <>
        {f.label.slice(0, i)}
        <Anchor className="a2-ilink" href={PRIVACY}>
          {f.label.slice(i, i + 14)}
        </Anchor>
        {f.label.slice(i + 14)}
      </>
    )
  }
  if (f.required) {
    return (
      <>
        {f.label}{' '}
        <Anchor className="a2-ilink" href={PRIVACY}>
          Privacy policy
        </Anchor>
      </>
    )
  }
  return (
    <>
      {f.label} {f.hint && <span className="a2-lo">{f.hint}</span>}
    </>
  )
}

export function FormField({m, f}: {m: Machine; f: FieldSpec}) {
  const id = m.fieldId(f.key)
  const error = m.errors[f.key]
  const busy = m.state === 'submitting'
  const state = error ? 'error' : busy ? 'busy' : undefined
  const v = m.values[f.key]
  if (f.kind === 'check') {
    return (
      <Checkbox
        label={checkLabel(f)}
        name={f.key}
        checked={v === true}
        onChange={c => m.set(f.key, c)}
        state={state}
        error={error}
        required={f.required}
        inputRef={el => {
          if (el) el.id = id
        }}
      />
    )
  }
  if (f.kind === 'chips') {
    const picked = Array.isArray(v) ? v : []
    return (
      <fieldset
        className={`a2-field${error ? ' is-error' : ''}`}
        id={id}
        tabIndex={-1}
        aria-describedby={`${id}-msg`}
      >
        <legend className="a2-label">
          {f.label}
          {f.optional && <em>optional</em>}
        </legend>
        <div className="a2-chips">
          {(f.options ?? []).map(o => {
            const on = picked.includes(o.value)
            return (
              <Chip
                key={o.value}
                label={o.label}
                active={on}
                check={on}
                pressed={on}
                disabled={busy}
                onClick={e => {
                  e.preventDefault()
                  m.set(
                    f.key,
                    on
                      ? picked.filter(x => x !== o.value)
                      : [...picked, o.value],
                  )
                }}
              />
            )
          })}
        </div>
        <span className="a2-msg" id={`${id}-msg`} style={{marginTop: 8}}>
          {error && (
            <span className="a2-err">
              <Icon name="alert" size={14} />
              {error}
            </span>
          )}
        </span>
      </fieldset>
    )
  }
  const kind = f.kind === 'contact' ? 'text' : f.kind
  return (
    <Field
      id={id}
      label={f.label}
      name={f.key}
      kind={kind}
      value={typeof v === 'string' ? v : ''}
      onChange={value => m.set(f.key, value)}
      placeholder={f.placeholder}
      state={state}
      error={error}
      hint={f.hint}
      optional={f.optional}
      required={f.required}
      options={f.options}
      autoComplete={autoComplete(f)}
    />
  )
}

function autoComplete(f: FieldSpec): string | undefined {
  if (f.kind === 'email') return 'email'
  if (f.kind === 'tel') return 'tel'
  if (f.key === 'name' || f.key === 'fullName') return 'name'
  if (f.key === 'company') return 'organization'
  return undefined
}

/** The field rows of a group: pairs side by side (one column on mobile), singles full width. */
export function FieldRows({m, rows}: {m: Machine; rows: Row[]}) {
  const vp = useViewport()
  const cols = vp === 'm' ? 1 : 2
  const byKey = (k: string) => m.def.fields.find(f => f.key === k)!
  return (
    <div>
      {rows.map((row, i) => {
        const fields = row.keys.map(byKey)
        const gap =
          i === 0
            ? 0
            : row.gap && vp !== 'd' && vp !== '4k' && row.gap > 24
              ? 24
              : (row.gap ?? 24)
        const checks = fields.every(f => f.kind === 'check')
        const body = checks ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
            {fields.map(f => (
              <FormField key={f.key} m={m} f={f} />
            ))}
          </div>
        ) : fields.length > 1 || (row.pad && cols === 2) ? (
          <div
            className="a2-cols"
            style={{
              gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`,
              columnGap: 24,
              rowGap: 24,
            }}
          >
            {fields.map(f => (
              <FormField key={f.key} m={m} f={f} />
            ))}
            {row.pad && cols === 2 && <div />}
          </div>
        ) : (
          <FormField m={m} f={fields[0]} />
        )
        return (
          <div key={row.keys.join()}>
            {gap > 0 && <div style={{height: gap}} />}
            {body}
          </div>
        )
      })}
    </div>
  )
}

/** The fixed status slot: error summary, sending or failure line (never moves the layout). */
export function FormStatus({m}: {m: Machine}) {
  if (m.state === 'errors') {
    const summary = errorSummary(m.def, m.errors)
    return summary ? (
      <StatusLine kind="errors" message={summary} />
    ) : (
      <StatusLine />
    )
  }
  if (m.state === 'submitting')
    return <StatusLine kind="busy" message={m.def.busyStatus} />
  if (m.state === 'failure')
    return <StatusLine kind="failure" message={failureLine(m)} />
  return <StatusLine />
}

function failureLine(m: Machine): string {
  if (m.failure === 'closed')
    return 'This form is closed right now. Email me instead.'
  if (m.failure === 'limited')
    return 'Too many tries in a short time. Wait a minute, then press Try again.'
  return m.def.failureStatus
}

/** The submit button plus what sits beside it (a mailto line or the content type). */
export function SubmitRow({m, aside}: {m: Machine; aside: ReactNode}) {
  const vp = useViewport()
  const busy = m.state === 'submitting'
  const retry = m.state === 'failure'
  const button = (
    <Button
      kind="primary"
      type="submit"
      label={retry ? 'Try again' : m.def.submitLabel}
      iconLeft={retry ? 'refresh' : undefined}
      iconRight={retry ? undefined : (m.def.submitIcon as IconName)}
      state={busy ? 'busy' : undefined}
      busyLabel="Sending…"
      block={vp === 'm'}
      style={vp === 'm' ? undefined : {width: 200}}
    />
  )
  const row: CSSProperties =
    vp === 'm'
      ? {display: 'flex', flexDirection: 'column', gap: 16}
      : {display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'}
  return (
    <div style={row}>
      {button}
      {aside}
    </div>
  )
}

export function PreferEmail() {
  return (
    <span className="a2-cap">
      Prefer email?{' '}
      <a
        className="a2-mono a2-soft"
        href="mailto:emre@swemre.com"
        style={{whiteSpace: 'nowrap'}}
      >
        emre@swemre.com
      </a>
    </span>
  )
}

/** The hand-drawn underline under the hero's last word. */
function Squiggle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 150 14"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: -4,
        bottom: -10,
        width: 'calc(100% + 8px)',
        height: 14,
        overflow: 'visible',
      }}
    >
      <path
        d="M3 9 C 22 3, 38 12, 58 7 S 96 3, 116 8 S 140 9, 147 4"
        fill="none"
        strokeWidth="3.2"
        strokeLinecap="round"
        style={{stroke: 'var(--a2-link)'}}
      />
    </svg>
  )
}

/** "Never gonna let you <down.>": the last word in ink with the squiggle. */
export function HeroTitle({title, accent}: {title: string; accent?: boolean}) {
  const i = title.trimEnd().lastIndexOf(' ')
  const head = i > 0 ? title.slice(0, i + 1) : ''
  const last = i > 0 ? title.slice(i + 1) : title
  return (
    <>
      {head}
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          color: 'var(--a2-blue-ink)',
        }}
      >
        {accent ? <span className="a2-accent">{last}</span> : last}
        <Squiggle />
      </span>
    </>
  )
}

/**
 * The eyebrow from the page: "// call back · Mon to Fri, 09:00 to 18:00 CET" puts the part after
 * the first " · " upright; "// now playing · 1987 · Title · Artist" draws the now-playing line.
 */
export function EyebrowText({text}: {text: string}) {
  const parts = text.replace(/^\/\/\s*/, '').split(' · ')
  if (parts[0] === 'now playing' && parts.length === 4) {
    const [, year, song, artist] = parts
    return (
      <>
        now playing{' '}
        <span style={{fontStyle: 'normal', color: 'var(--a2-hue-peri)'}}>
          <Icon
            name="music"
            size={12}
            style={{display: 'inline', verticalAlign: -1}}
          />
        </span>{' '}
        <span style={{fontStyle: 'normal'}}>{year}</span>{' '}
        <span className="a2-txt" style={{fontStyle: 'normal', fontWeight: 600}}>
          {song}
        </span>{' '}
        <span style={{fontStyle: 'normal'}}>{artist}</span>
      </>
    )
  }
  if (parts.length === 1) return <>{parts[0]}</>
  return (
    <>
      {parts[0]}{' '}
      <span style={{fontStyle: 'normal'}}>· {parts.slice(1).join(' · ')}</span>
    </>
  )
}

/** The prompt pill of the newsletter page ("emre@swemre:~$ subscribe --email▌"). */
export function PromptPill({command}: {command: string}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 40,
        padding: '0 16px',
        borderRadius: 6,
        background: 'var(--a2-prompt-bg)',
        border: '1px solid rgb(var(--a2-hue-blue-rgb) / 0.18)',
        boxShadow: 'var(--a2-tile-inset)',
      }}
    >
      <p className="a2-mono" style={{whiteSpace: 'nowrap'}}>
        <span className="a2-mint">emre@swemre</span>
        <span>:</span>
        <span className="a2-soft">~</span>
        <span>$ </span>
        <span className="a2-txt">{command}</span>
        <span className="a2-caret" aria-hidden="true" />
      </p>
    </div>
  )
}

export type {FormDef}
