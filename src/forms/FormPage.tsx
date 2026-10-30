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
// The contact, resume and call back pages (V4-Play-Contact, -Resume, -CallBack): hero with
// the squiggle title, then the form as numbered groups (number, title and copy on the left,
// fields on the right from desktop up), the fixed status slot and the submit row. Success
// swaps the groups for a "done" group with the receipt. Owner: agent C.
import type {CSSProperties, ReactNode} from 'react'
import {
  Button,
  Glow,
  Rail,
  Receipt,
  SectionBg,
  Texture,
  TopGround,
  useViewport,
} from '../design/index.tsx'
import type {Viewport} from '../design/context.ts'
import type {FormValues} from '../contract/forms.ts'
import {
  EyebrowText,
  FieldRows,
  FormStatus,
  HeroTitle,
  PreferEmail,
  SubmitRow,
} from './parts.tsx'
import type {FormDef, Group} from './specs.ts'
import {useFormMachine, type Machine} from './useFormMachine.ts'

const HERO: Record<
  Viewport,
  {pt: number; pb: number; lead: number; rule: number}
> = {
  m: {pt: 112, pb: 32, lead: 16, rule: 48},
  t: {pt: 128, pb: 32, lead: 16, rule: 48},
  d: {pt: 160, pb: 48, lead: 24, rule: 64},
  '4k': {pt: 192, pb: 64, lead: 24, rule: 64},
}
const SECTION_PB: Record<Viewport, number> = {m: 48, t: 64, d: 96, '4k': 128}
const GROUP_PAD: Record<Viewport, number> = {m: 32, t: 32, d: 48, '4k': 64}
const GLOWS: Record<Viewport, [number, number, number, number]> = {
  m: [560, 520, 420, 360],
  t: [840, 720, 640, 520],
  d: [1120, 860, 920, 640],
  '4k': [1485, 1107, 1215, 810],
}
const HATCH: Record<Viewport, [number, number]> = {
  m: [300, 260],
  t: [480, 400],
  d: [600, 480],
  '4k': [720, 560],
}

export interface PageCopy {
  eyebrow?: string
  title: string
  lead?: string
}

export function FormPage({
  def,
  copy,
  initial,
}: {
  def: FormDef
  copy: PageCopy
  initial?: FormValues
}) {
  const vp = useViewport()
  const wide = vp === 'd' || vp === '4k'
  const m = useFormMachine(def, {
    compact: vp === 'm',
    idPrefix: def.key,
    initial,
  })
  const h = HERO[vp]
  const pad = GROUP_PAD[vp]
  const [g1w, g1h, g2w, g2h] = GLOWS[vp]
  const [hw, hh] = HATCH[vp]

  return (
    <>
      <TopGround />
      <section
        className="a2-sec"
        style={{paddingTop: h.pt, paddingBottom: h.pb}}
      >
        <SectionBg>
          <Texture kind="grid" hue={def.hue} mask="42% 38% at 16% 30%" />
        </SectionBg>
        <Rail
          from={def.hue}
          hook={wide ? 40 : undefined}
          top={0}
          nodes={[{top: h.pt + 6}]}
          label={{text: def.commits[0]}}
        />
        <div className="a2-c">
          {copy.eyebrow && (
            <span className="a2-eyebrow" style={{marginBottom: 16}}>
              // <EyebrowText text={copy.eyebrow} />
            </span>
          )}
          <h1 className="a2-d2">
            <HeroTitle title={copy.title} />
          </h1>
          {copy.lead && (
            <p className="a2-lead" style={{marginTop: h.lead, maxWidth: 760}}>
              {copy.lead}
            </p>
          )}
          <div className="a2-fhr" style={{marginTop: h.rule}} />
        </div>
      </section>
      <section
        className="a2-sec"
        style={{paddingTop: 0, paddingBottom: SECTION_PB[vp]}}
      >
        <SectionBg>
          <Glow hue={def.hue} x="86%" y="520px" w={g1w} h={g1h} />
          <Glow hue={def.hue} x="12%" y="70%" w={g2w} h={g2h} alpha={0.075} />
        </SectionBg>
        <SectionBg>
          <Texture
            kind="hatch"
            hue={def.hue}
            mask={`${hw}px ${hh}px at 86% 520px`}
          />
        </SectionBg>
        <Rail
          from={def.hue}
          nodes={[{top: pad + (wide ? 6 : 5), current: true}]}
          label={{text: def.commits[1]}}
        />
        <div className="a2-c">
          {m.state === 'success' ? (
            <div role="status">
              <GroupBlock
                number="done"
                numberColor="var(--a2-mint)"
                title={def.done.title}
                copy={def.done.copy}
                pad={pad}
              >
                <FormReceipt m={m} />
              </GroupBlock>
            </div>
          ) : (
            <form
              noValidate
              style={{borderBottom: '1px solid var(--a2-line)'}}
              onSubmit={e => {
                e.preventDefault()
                void m.submit()
              }}
            >
              <Honeypot m={m} />
              {def.groups.map((g, i) => (
                <GroupBlock
                  key={g.title}
                  number={String(i + 1).padStart(2, '0')}
                  numberColor={`var(--a2-hue-${def.hue})`}
                  title={g.title}
                  copy={g.copy}
                  pad={pad}
                  border={i > 0}
                >
                  <GroupFields m={m} g={g} last={i === def.groups.length - 1} />
                </GroupBlock>
              ))}
            </form>
          )}
        </div>
      </section>
    </>
  )
}

function GroupFields({m, g, last}: {m: Machine; g: Group; last: boolean}) {
  const vp = useViewport()
  const wide = vp === 'd' || vp === '4k'
  return (
    <div>
      <FieldRows m={m} rows={g.rows} />
      {last && (
        <>
          <div style={{height: wide ? 32 : 24}} />
          <FormStatus m={m} />
          <div style={{height: 16}} />
          <SubmitRow m={m} aside={<PreferEmail />} />
        </>
      )}
    </div>
  )
}

/** One numbered group: the label column and the content column (stacked on mobile and tablet). */
function GroupBlock({
  number,
  numberColor,
  title,
  copy,
  pad,
  border,
  children,
}: {
  number: string
  numberColor: string
  title: string
  copy: string
  pad: number
  border?: boolean
  children: ReactNode
}) {
  const vp = useViewport()
  const wide = vp === 'd' || vp === '4k'
  const head = (
    <>
      <span className="a2-mono" style={{fontWeight: 600, color: numberColor}}>
        {number}
      </span>
      <h4 className="a2-h4" style={{marginTop: 8}}>
        {title}
      </h4>
      {copy && (
        <p className="a2-small" style={{marginTop: 4}}>
          {copy}
        </p>
      )}
    </>
  )
  const box: CSSProperties = {
    padding: `${pad}px 0`,
    ...(border ? {borderTop: '1px solid var(--a2-line)'} : {}),
  }
  if (!wide) {
    return (
      <div style={box}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
          <div>{head}</div>
          <div style={{minWidth: 0}}>{children}</div>
        </div>
      </div>
    )
  }
  return (
    <div style={box}>
      <div className="a2-g12" style={{alignItems: 'start'}}>
        <div style={{gridColumn: '1 / span 4', minWidth: 0}}>{head}</div>
        <div style={{gridColumn: '6 / span 7', minWidth: 0}}>{children}</div>
      </div>
    </div>
  )
}

function FormReceipt({m}: {m: Machine}) {
  const r = m.def.receipt
  return (
    <Receipt
      id={`${m.def.key}-receipt`}
      hue={m.def.hue}
      title={r.title}
      copy={r.copy(m.values)}
      items={r.items(m.values)}
      actions={
        <>
          <Button
            kind="secondary"
            label="Read the latest articles"
            iconRight="arrow-right"
            href="/articles"
          />
          <Button
            kind="ghost"
            label="Back home"
            iconLeft="arrow-left"
            href="/"
          />
        </>
      }
      command={`${r.command(m.values)}  201 created`}
    />
  )
}

/** A field people never see: bots fill it, and a filled one sends nothing. */
export function Honeypot({m}: {m: Machine}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: -10000,
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <label>
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={m.honeypot}
          onChange={e => m.setHoneypot(e.target.value)}
        />
      </label>
    </div>
  )
}
