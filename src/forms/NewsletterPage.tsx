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
// The newsletter page (V4-Play-Newsletter): centred hero with the three promises, the example
// letter, the promise statement, and the subscribe section: the form card on the left and the
// request.json / response panel on the right, which shows the body as it will be sent and
// then the real answer of the API. Owner: agent C.
import {useEffect, useRef, type CSSProperties, type ReactNode} from 'react'
import {
  Anchor,
  Button,
  Glow,
  Icon,
  Rail,
  Receipt,
  SectionBg,
  Texture,
  TextLink,
  hueCardStyle,
  useViewport,
  type IconName,
} from '../design/index.tsx'
import type {Viewport} from '../design/index.tsx'
import type {FormValue} from '../contract/api.ts'
import type {FormValues} from '../contract/forms.ts'
import {Honeypot, type PageCopy} from './FormPage.tsx'
import {
  FieldRows,
  FormStatus,
  HeroTitle,
  PromptPill,
  SubmitRow,
} from './parts.tsx'
import {NEWSLETTER, str} from './specs.ts'
import {useFormMachine, type Machine} from './useFormMachine.ts'
import {validate, wireFields} from './validate.ts'
import {t} from '../i18n/index.ts'

const ENDPOINT =
  '/api/public/v2/channels/swemre-website/forms/newsletter/submissions'

type Four<T> = Record<Viewport, T>
const pick = <T,>(vp: Viewport, v: Four<T>) => v[vp]

const SEC_PAD: Four<number> = {m: 48, t: 64, d: 96, '4k': 128}
const XL_PAD: Four<number> = {m: 96, t: 128, d: 128, '4k': 128}
const GLOWS: Four<[number, number, number, number]> = {
  m: [560, 520, 420, 360],
  t: [840, 720, 640, 520],
  d: [1120, 860, 920, 640],
  '4k': [1485, 1107, 1215, 810],
}
const HATCH: Four<[number, number]> = {
  m: [300, 260],
  t: [480, 400],
  d: [600, 480],
  '4k': [720, 560],
}

export function NewsletterPage({
  copy,
  initial,
  submitOnArrival,
}: {
  copy: PageCopy
  initial?: FormValues
  submitOnArrival?: boolean
}) {
  return (
    <>
      <Hero copy={copy} />
      <Inbox />
      <Statement />
      <Subscribe initial={initial} submitOnArrival={submitOnArrival} />
    </>
  )
}

/* ---------- hero ---------- */

const HERO = {
  pt: {m: 112, t: 128, d: 160, '4k': 192} as Four<number>,
  mask: {m: 740, t: 600, d: 860, '4k': 980} as Four<number>,
  glow1: {
    m: [320, 360, -260],
    t: [520, 480, -320],
    d: [640, 560, -400],
    '4k': [700, 600, -420],
  } as Four<[number, number, number]>,
  glow2: {
    m: ['220px', 140, 260, 300],
    t: ['60%', 180, 420, 400],
    d: ['62%', 140, 560, 460],
    '4k': ['62%', 140, 620, 500],
  } as Four<[string, number, number, number]>,
  arc: {m: [520, 520], t: [420, 700], d: [720, 820], '4k': [900, 900]} as Four<
    [number, number]
  >,
}

function HeroGround() {
  const vp = useViewport()
  const [w1, h1, t1] = HERO.glow1[vp]
  const [l2, t2, w2, h2] = HERO.glow2[vp]
  const [arcTop, arcH] = HERO.arc[vp]
  const mask = `linear-gradient(to bottom,#000 0,#000 ${HERO.mask[vp]}px,transparent 100%)`
  const blob = (s: CSSProperties): CSSProperties => ({
    position: 'absolute',
    borderRadius: 999,
    filter: 'blur(120px)',
    ...s,
  })
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: -240,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'var(--a2-hero-grad)',
        }}
      />
      <div
        style={blob({
          left: `calc(50% - ${w1 / 2}px)`,
          top: t1,
          width: w1,
          height: h1,
          background: 'var(--a2-hero-glow-1)',
        })}
      />
      <div
        style={blob({
          left: l2,
          top: t2,
          width: w2,
          height: h2,
          background: 'var(--a2-hero-glow-2)',
        })}
      />
      <div
        style={{
          position: 'absolute',
          left: -20,
          top: arcTop,
          width: 'calc(100% + 40px)',
          height: arcH,
          borderRadius: '50%',
          backgroundImage:
            'radial-gradient(ellipse 50% 40% at 50% 0%,var(--a2-arc-light),transparent 70%)',
          boxShadow: '0 -30px 80px -20px var(--a2-arc-light-2)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 'var(--a2-grid-op)',
          backgroundImage:
            'linear-gradient(to right,var(--a2-grid-line) 1px,transparent 1px),linear-gradient(var(--a2-grid-line) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
          WebkitMaskImage:
            'linear-gradient(to bottom,#000 54px,transparent 580px)',
          maskImage: 'linear-gradient(to bottom,#000 54px,transparent 580px)',
        }}
      />
    </div>
  )
}

const PROMISES: {icon: IconName; title: string; copy: string}[] = [
  {
    icon: 'check',
    title: t('newsletter.promise.private'),
    copy: t('newsletter.promise.private.copy'),
  },
  {
    icon: 'mail',
    title: t('newsletter.promise.twoWay'),
    copy: t('newsletter.promise.twoWay.copy'),
  },
  {
    icon: 'message',
    title: t('newsletter.promise.human'),
    copy: t('newsletter.promise.human.copy'),
  },
]

function Hero({copy}: {copy: PageCopy}) {
  const vp = useViewport()
  const wide = vp === 'd' || vp === '4k'
  const compact = vp === 'm' || vp === 't'
  const pt = HERO.pt[vp]
  const eyebrow =
    copy.eyebrow?.replace(/^\/\/\s*/, '') ?? t('newsletter.eyebrow')
  return (
    <section
      className="a2-sec"
      aria-label={t('footer.newsletter')}
      style={{paddingTop: pt, paddingBottom: SEC_PAD[vp]}}
    >
      <HeroGround />
      <Rail
        from="blue"
        hook={wide ? 0 : undefined}
        nodes={[{top: pt + (wide ? 42 : 19)}]}
        label={{text: NEWSLETTER.commits[0]}}
      />
      <div className="a2-c">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <span className="a2-eyebrow" style={{marginBottom: 16}}>
            // {eyebrow}
          </span>
          <h1 className="a2-d1" style={{textWrap: 'balance'}}>
            <HeroTitle title={copy.title} accent />
          </h1>
          {copy.lead && (
            <p
              className="a2-lead"
              style={{
                marginTop: compact ? 24 : 32,
                maxWidth: 640,
                textWrap: 'balance',
              }}
            >
              {copy.lead}
            </p>
          )}
          <div style={{marginTop: compact ? 24 : 32}}>
            <PromptPill command="subscribe --email" />
          </div>
        </div>
        <div
          className="a2-fhr"
          style={{
            margin: pick(vp, {
              m: '48px 0 48px',
              t: '48px 0 48px',
              d: '64px 0 64px',
              '4k': '96px 0 64px',
            }),
          }}
        />
        <ul
          aria-label={t('newsletter.promises')}
          style={{
            display: 'grid',
            gridTemplateColumns: vp === 'm' ? '1fr' : 'repeat(3,minmax(0,1fr))',
            gap: vp === 'm' ? 16 : 0,
            maxWidth: vp === 'm' ? 'none' : 960,
            margin: '0 auto',
            listStyle: 'none',
            padding: 0,
          }}
        >
          {PROMISES.map((p, i) => (
            <li
              key={p.title}
              style={{
                padding: vp === 'm' ? 0 : vp === 't' ? '0 24px' : '0 32px',
                textAlign: 'center',
                ...(i > 0 && vp !== 'm'
                  ? {borderLeft: '1px solid var(--a2-line-2)'}
                  : {}),
              }}
            >
              <p
                className="a2-mono"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--a2-soft)',
                  fontWeight: 500,
                }}
              >
                <Icon name={p.icon} size={14} />
                {p.title}
              </p>
              <p
                className="a2-small"
                style={{marginTop: 8, color: 'var(--a2-text)'}}
              >
                {p.copy}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- example letter ---------- */

function TabBar({
  label,
  icon,
  accent,
}: {
  label: string
  icon: IconName
  accent: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        height: 40,
        borderBottom: '1px solid var(--a2-line)',
        background: 'var(--a2-code-bar)',
      }}
    >
      <span
        className="a2-mono"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          height: 40,
          padding: '0 16px',
          borderRight: '1px solid var(--a2-line)',
          background: 'var(--a2-card-solid)',
          color: 'var(--a2-text-hi)',
          boxShadow: `inset 0 2px 0 ${accent}`,
        }}
      >
        <Icon name={icon} size={14} style={{color: accent, flexShrink: 0}} />
        {label}
      </span>
    </div>
  )
}

function Island({children, fill}: {children: ReactNode; fill?: boolean}) {
  return (
    <div
      style={{
        background:
          'var(--a2-island-bg, color-mix(in srgb, var(--a2-code-bg) calc((1 - var(--a2-glow-text-k)) * 100%), transparent))',
        borderRadius: 12,
        ...(fill ? {height: '100%'} : {}),
      }}
    >
      <div className="a2-island" style={{height: '100%'}}>
        {children}
      </div>
    </div>
  )
}

function Inbox() {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const s = big ? 32 : 24
  const [g1w, g1h, g2w, g2h] = GLOWS[vp]
  const pad = SEC_PAD[vp]
  const row: CSSProperties = {color: 'var(--a2-soft)'}
  const dd: CSSProperties = {
    color: 'var(--a2-text)',
    minWidth: 0,
    overflowWrap: 'anywhere',
  }
  return (
    <section className="a2-sec">
      <SectionBg>
        <Glow hue="mist" x="50%" y="62%" w={g1w} h={g1h} />
        <Glow hue="mist" x="20%" y="30%" w={g2w} h={g2h} alpha={0.075} />
        <Texture kind="paper" hue="mist" mask="42% 38% at 50% 62%" />
      </SectionBg>
      <Rail
        from="blue"
        to="mist"
        nodes={[{top: pad + (big ? 34 : 21)}]}
        label={{text: 'e3a11ed'}}
      />
      <div className="a2-c">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <span className="a2-eyebrow">// {t('newsletter.inbox.eyebrow')}</span>
          <h2 className="a2-h2" style={{marginTop: 16}}>
            {t('newsletter.inbox.title')}
          </h2>
          <p className="a2-body" style={{marginTop: s, maxWidth: 480}}>
            {t('newsletter.inbox.copy')}
          </p>
          <p className="a2-mono" style={{whiteSpace: 'nowrap', marginTop: s}}>
            <span className="a2-mint">emre@swemre</span>
            <span>:</span>
            <span className="a2-soft">~</span>
            <span>$ </span>
            <span className="a2-txt">open example.eml</span>
            <span className="a2-caret" aria-hidden="true" />
          </p>
          <div style={{marginTop: s}}>
            <TextLink label={t('form.readLatest')} href="/articles" />
          </div>
        </div>
        <div
          style={{
            maxWidth: vp === 'm' ? 'none' : 904,
            margin: `${big ? 64 : 48}px auto 0`,
            textAlign: 'left',
          }}
        >
          <Island>
            <div
              className="a2-card"
              style={{...hueCardStyle('mist'), padding: 0, overflow: 'hidden'}}
            >
              <TabBar label="example.eml" icon="mail" accent="var(--a2-soft)" />
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: s,
                  borderBottom: '1px solid var(--a2-line)',
                }}
              >
                {vp !== 'm' && (
                  <span
                    aria-hidden="true"
                    style={{
                      flex: 'none',
                      display: 'grid',
                      placeItems: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: 'var(--a2-blue-navy)',
                      color: 'var(--a2-on-blue)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    e
                  </span>
                )}
                <dl
                  className="a2-mono"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `${vp === 'm' ? 72 : 96}px minmax(0,1fr)`,
                    rowGap: 8,
                    columnGap: 16,
                    flex: 1,
                    minWidth: 0,
                    margin: 0,
                  }}
                >
                  <dt style={row}>{t('newsletter.eml.subject')}</dt>
                  <dd style={{...dd, margin: 0}}>
                    <span style={{color: 'var(--a2-text-hi)', fontWeight: 700}}>
                      {t('newsletter.eml.subject.value')}
                    </span>
                  </dd>
                  <dt style={row}>{t('newsletter.eml.from')}</dt>
                  <dd style={{...dd, margin: 0}}>
                    {t('newsletter.eml.from.value')} &lt;emre@swemre.com&gt;
                  </dd>
                  <dt style={row}>{t('newsletter.eml.to')}</dt>
                  <dd style={{...dd, margin: 0}}>priya.shah@lumen.dev</dd>
                  <dt style={row}>{t('newsletter.eml.date')}</dt>
                  <dd style={{...dd, margin: 0}}>
                    {t('newsletter.eml.date.value')}
                  </dd>
                </dl>
              </div>
              <div
                style={{
                  padding: s,
                  fontSize: 15,
                  lineHeight: '24px',
                  color: 'var(--a2-text)',
                }}
              >
                <p>{t('newsletter.eml.hi')}</p>
                <p style={{marginTop: 8}}>
                  {t('newsletter.eml.newArticle')}{' '}
                  <span style={{fontWeight: 600, color: 'var(--a2-text-hi)'}}>
                    {t('newsletter.eml.articleTitle')}
                  </span>
                  .
                </p>
                <p style={{marginTop: 8, color: 'var(--a2-text-mid)'}}>
                  {t('newsletter.eml.body')}
                </p>
                <p style={{marginTop: 16}}>
                  <Anchor
                    className="a2-ilink"
                    href="/articles/modular-monolith"
                  >
                    swemre.com/articles/modular-monolith
                  </Anchor>
                </p>
                <p style={{marginTop: 24}}>Emre</p>
              </div>
              <p
                className="a2-cap"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: '8px 16px',
                  padding: `16px ${s}px`,
                  borderTop: '1px solid var(--a2-line)',
                }}
              >
                <span>{t('newsletter.eml.why')}</span>
                <span style={{display: 'flex', gap: 8}}>
                  {[
                    t('newsletter.eml.mute'),
                    t('newsletter.eml.unsubscribe'),
                    t('newsletter.eml.delete'),
                  ].map((l, i) => (
                    <span key={l} style={{display: 'contents'}}>
                      {i > 0 && (
                        <span
                          aria-hidden="true"
                          style={{color: 'var(--a2-text-dim)'}}
                        >
                          |
                        </span>
                      )}
                      <Anchor
                        className="a2-ulink"
                        href="/newsletter/unsubscribed?email=priya.shah%40lumen.dev"
                      >
                        {l}
                      </Anchor>
                    </span>
                  ))}
                </span>
              </p>
            </div>
          </Island>
        </div>
      </div>
    </section>
  )
}

/* ---------- statement ---------- */

const STMT: Four<{
  glow: [number, number]
  side: [number, number]
  mono: number
}> = {
  m: {glow: [600, 420], side: [420, 300], mono: 16},
  t: {glow: [900, 560], side: [620, 420], mono: 18},
  d: {glow: [1300, 640], side: [920, 560], mono: 20},
  '4k': {glow: [1700, 760], side: [1215, 702], mono: 20},
}

function Statement() {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const st = STMT[vp]
  const pad = XL_PAD[vp]
  const mono: CSSProperties = {
    fontSize: st.mono,
    lineHeight: '28px',
    color: 'var(--a2-text-lo)',
  }
  return (
    <section className="a2-sec is-xl" aria-label={t('newsletter.promise')}>
      <SectionBg>
        <Glow
          x="50%"
          y="50%"
          w={st.glow[0]}
          h={st.glow[1]}
          color="var(--a2-stmt-glow)"
        />
        <Glow
          hue="mist"
          x="34%"
          y="52%"
          w={st.side[0]}
          h={st.side[1]}
          alpha={0.068}
        />
        <Glow
          hue="lilac"
          x="66%"
          y="46%"
          w={st.side[0]}
          h={st.side[1]}
          alpha={0.068}
        />
      </SectionBg>
      <Rail
        from="mist"
        to="lilac"
        nodes={[{top: pad + (big ? 134 : 95)}]}
        label={{text: 'b1ade00'}}
      />
      <div className="a2-c">
        <div style={{textAlign: 'center'}}>
          <p aria-hidden="true" className="a2-mono" style={mono}>
            /**
          </p>
          <p
            className="a2-d1"
            style={{
              margin: '16px 0',
              color: 'var(--a2-text-hi)',
              textShadow:
                '0 0 80px rgb(var(--a2-hue-mist-rgb) / calc(0.18 * var(--a2-glow-text-k)))',
              textWrap: 'balance',
            }}
          >
            {t('newsletter.statement.1')}
            <br />
            {t('newsletter.statement.2')}
            <br />
            <span className="a2-accent2">{t('newsletter.statement.3')}</span>
          </p>
          <p aria-hidden="true" className="a2-mono" style={mono}>
            */
          </p>
          <p
            className="a2-mono"
            style={{
              marginTop: big ? 32 : 24,
              color: 'var(--a2-text-mono-2)',
            }}
          >
            {t('newsletter.statement.note1')}{' '}
            <span style={{color: 'var(--a2-hue-mist)'}}>·</span>{' '}
            {t('newsletter.statement.note2')}
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------- subscribe ---------- */

function Subscribe({
  initial,
  submitOnArrival,
}: {
  initial?: FormValues
  submitOnArrival?: boolean
}) {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const s = big ? 32 : 24
  const m = useFormMachine(NEWSLETTER, {
    compact: vp === 'm',
    idPrefix: 'newsletter',
    initial,
  })
  useArrivalSubmit(m, submitOnArrival)
  const [g1w, g1h, g2w, g2h] = GLOWS[vp]
  const [hw, hh] = HATCH[vp]
  const pad = SEC_PAD[vp]
  const node = pad + (big ? 34 : 21)

  const formCard =
    m.state === 'success' ? (
      <SubscribeReceipt m={m} />
    ) : (
      <div
        className="a2-card"
        style={{...hueCardStyle('aqua'), padding: 0, overflow: 'hidden'}}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 48,
            padding: `0 ${s}px`,
            borderBottom: '1px solid var(--a2-line)',
            background:
              'color-mix(in srgb,var(--a2-ground-deep) 50%,transparent)',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 24,
              padding: '0 8px',
              borderRadius: 4,
              background: 'var(--a2-blue)',
              color: 'var(--a2-on-blue)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            POST
          </span>
          <span
            className="a2-mono a2-txt"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={ENDPOINT}
          >
            {ENDPOINT}
          </span>
        </div>
        <form
          noValidate
          aria-label={t('newsletter.form.label')}
          onSubmit={e => {
            e.preventDefault()
            void m.submit()
          }}
        >
          <Honeypot m={m} />
          <div style={{padding: s}}>
            <FieldRows
              m={m}
              rows={NEWSLETTER.groups[0].rows.map(r =>
                r.gap === 32 && !big ? {...r, gap: 24} : r,
              )}
            />
            <div className="a2-hr" style={{margin: `${s}px 0`}} />
            <FormStatus m={m} />
            <div style={{height: 16}} />
            <SubmitRow
              m={m}
              aside={
                <span className="a2-mono">Content-Type: application/json</span>
              }
            />
          </div>
        </form>
      </div>
    )

  return (
    <section className="a2-sec">
      <SectionBg>
        <Glow hue="aqua" x="16%" y="62%" w={g1w} h={g1h} />
        <Glow hue="aqua" x="80%" y="30%" w={g2w} h={g2h} alpha={0.075} />
      </SectionBg>
      <SectionBg>
        <Texture kind="hatch" hue="aqua" mask={`${hw}px ${hh}px at 16% 62%`} />
      </SectionBg>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: node + 6,
        }}
      >
        <Rail
          from="lilac"
          to="aqua"
          nodes={[{top: node, current: true}]}
          label={{text: NEWSLETTER.commits[1]}}
        />
      </div>
      <div className="a2-c">
        <div
          id="subscribe"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <span className="a2-num" aria-hidden="true">
            <span className="is-dim">0x</span>
            <span
              style={{
                color: 'var(--a2-hue-aqua)',
                textShadow:
                  '0 0 40px rgb(var(--a2-hue-aqua-rgb) / calc(0.22 * var(--a2-glow-text-k)))',
              }}
            >
              05
            </span>
          </span>
          <span className="a2-eyebrow" style={{marginTop: s}}>
            // {t('newsletter.subscribe.eyebrow')}
          </span>
          <h2 className="a2-h2" style={{marginTop: 16, textWrap: 'balance'}}>
            {t('newsletter.subscribe.title')}
          </h2>
          <div style={{marginTop: s}}>
            <PromptPill command="subscribe --email" />
          </div>
        </div>
        <div style={{marginTop: big ? 64 : 48}}>
          {big ? (
            <div className="a2-g12" style={{alignItems: 'stretch'}}>
              <div style={{gridColumn: '1 / span 7', minWidth: 0}}>
                {formCard}
              </div>
              <div style={{gridColumn: '8 / span 5', minWidth: 0}}>
                <ExchangePanel m={m} />
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: vp === 'm' ? 48 : 64,
              }}
            >
              <div>{formCard}</div>
              <div>
                <ExchangePanel m={m} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** Submits once on arrival when the home block carried the values here. */
function useArrivalSubmit(m: Machine, on?: boolean) {
  const done = useRef(false)
  const submit = useRef(m.submit)
  useEffect(() => {
    submit.current = m.submit
  })
  useEffect(() => {
    if (done.current || !on) return
    done.current = true
    void submit.current()
  }, [on])
}

function SubscribeReceipt({m}: {m: Machine}) {
  const r = NEWSLETTER.receipt
  const token =
    typeof m.receipt?.result?.token === 'string' ? m.receipt.result.token : ''
  return (
    <Receipt
      id="newsletter-receipt"
      hue="aqua"
      title={r.title}
      copy={r.copy(m.values)}
      items={r.items(m.values)}
      actions={
        <>
          <Button
            kind="secondary"
            label={t('newsletter.openConfirm')}
            iconLeft="mail"
            href={`/newsletter/confirmed${token ? `?token=${encodeURIComponent(token)}` : ''}`}
          />
          <Button
            kind="ghost"
            label={t('form.backHome')}
            iconLeft="arrow-left"
            href="/"
          />
        </>
      }
      command={`subscribe --email ${str(m.values.email)}  201`}
    />
  )
}

/* ---------- request.json / response ---------- */

function JsonValue({v}: {v: FormValue}) {
  if (v === null || typeof v === 'boolean')
    return <span style={{color: 'var(--a2-hue-lilac)'}}>{String(v)}</span>
  if (Array.isArray(v))
    return (
      <>
        [
        {v.map((x, i) => (
          <span key={i}>
            {i > 0 && ', '}
            <span style={{color: 'var(--a2-mint)'}}>{JSON.stringify(x)}</span>
          </span>
        ))}
        ]
      </>
    )
  return <span style={{color: 'var(--a2-mint)'}}>{JSON.stringify(v)}</span>
}

const line: CSSProperties = {whiteSpace: 'pre', minHeight: 20}
const wrapLine: CSSProperties = {whiteSpace: 'pre-wrap'}
const key = (k: string) => (
  <span style={{color: 'var(--a2-soft)'}}>{JSON.stringify(k)}</span>
)

function ExchangePanel({m}: {m: Machine}) {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const sent = m.exchange?.fields
  const body = sent ?? wireFields(NEWSLETTER, m.values)
  const entries = Object.entries(body)
  const {answer, foot} = responseOf(m)
  return (
    <Island fill>
      <div
        className="a2-card"
        style={{
          ...hueCardStyle('aqua'),
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <TabBar
          label="request.json"
          icon="file-text"
          accent="var(--a2-hue-aqua)"
        />
        <div
          className="a2-mono"
          style={{
            flex: 1,
            padding: big ? 32 : 24,
            color: 'var(--a2-text)',
            overflow: 'hidden',
          }}
        >
          <div style={line}>
            <span className="a2-lo">
              {sent
                ? `// ${t('newsletter.json.sent')}`
                : `// ${t('newsletter.json.willSend')}`}
            </span>
          </div>
          <div style={line} />
          {/* The real body is {"fields": {...}}; the wrapper shares the first and last lines so
              the panel keeps the board's line count. */}
          <div style={line}>
            {'{ '}
            {key('fields')}: {'{'}
          </div>
          {entries.map(([k, v], i) => (
            <div key={k} style={line}>
              {'  '}
              {key(k)}: <JsonValue v={v} />
              {i < entries.length - 1 ? ',' : ''}
            </div>
          ))}
          <div style={line}>{'} }'}</div>
          <div className="a2-hr" style={{margin: '24px 0'}} />
          <div className="a2-lo">// {t('newsletter.json.response')}</div>
          <div
            style={{marginTop: 8, height: 60, overflow: 'hidden'}}
            aria-live="polite"
          >
            {answer}
          </div>
        </div>
        <div
          className="a2-mono"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            height: 40,
            padding: '0 16px',
            borderTop: '1px solid var(--a2-line)',
            fontSize: 12,
          }}
        >
          <span style={{color: foot.color, fontWeight: 600}}>{foot.label}</span>
          <span>{foot.text}</span>
          <span style={{marginLeft: 'auto'}}>json</span>
        </div>
      </div>
    </Island>
  )
}

const ERR = 'var(--a2-err-text)'

function responseOf(m: Machine): {
  answer: ReactNode
  foot: {label: string; text: string; color: string}
} {
  const ex = m.exchange
  if (m.state === 'submitting') {
    return {
      answer: (
        <div style={wrapLine}>
          <span style={{color: 'var(--a2-soft)'}}>POST</span>{' '}
          /forms/newsletter/submissions <span className="a2-lo">…</span>
          <span className="a2-caret" />
        </div>
      ),
      foot: {
        label: 'pending',
        text: t('newsletter.json.sending'),
        color: 'var(--a2-soft)',
      },
    }
  }
  if (m.state === 'success') {
    const status =
      typeof m.receipt?.result?.status === 'string'
        ? m.receipt.result.status
        : 'pending_confirmation'
    return {
      answer: (
        <>
          <div style={wrapLine}>
            <span style={{color: 'var(--a2-mint)'}}>
              {ex?.status ?? 201} {ex?.statusText ?? 'Created'}
            </span>
          </div>
          <div style={wrapLine}>
            {'{ '}
            {key('status')}: <JsonValue v={status} />
            {' }'}
          </div>
        </>
      ),
      foot: {
        label: String(ex?.status ?? 201),
        text: t('newsletter.json.confirmSent'),
        color: 'var(--a2-mint)',
      },
    }
  }
  if (m.state === 'errors') {
    const server = ex?.status === 400
    const errs = server
      ? Object.fromEntries(
          (
            (ex?.body as {errors?: {field: string}[]} | undefined)?.errors ?? []
          ).map(e => [e.field, 'invalid']),
        )
      : Object.fromEntries(
          Object.keys(validate(NEWSLETTER, m.values)).map(k => {
            const v = m.values[k]
            const empty = v === false || v === '' || v === undefined
            return [k, empty ? 'required' : 'invalid']
          }),
        )
    const list = Object.entries(errs)
    return {
      answer: (
        <>
          <div style={wrapLine}>
            <span style={{color: ERR}}>
              {server ? '400 Bad Request' : t('newsletter.json.local')}
            </span>
          </div>
          {list.length > 0 && (
            <div style={wrapLine}>
              {'{ '}
              {list.map(([k, v], i) => (
                <span key={k}>
                  {i > 0 && ', '}
                  {key(k)}: <JsonValue v={v} />
                </span>
              ))}
              {' }'}
            </div>
          )}
        </>
      ),
      foot: {
        label: server ? '400' : 'local',
        text: t('newsletter.json.invalid'),
        color: ERR,
      },
    }
  }
  if (m.state === 'failure') {
    const st = ex?.status ?? 0
    return {
      answer: (
        <>
          <div style={wrapLine}>
            <span style={{color: ERR}}>
              {st
                ? `${st} ${ex?.statusText ?? ''}`.trim()
                : t('newsletter.json.noAnswer')}
            </span>
          </div>
          <div style={wrapLine}>
            <span className="a2-lo">
              // {t('newsletter.json.nothingStored')}
            </span>
          </div>
        </>
      ),
      foot: {
        label: st ? String(st) : 'error',
        text:
          st === 429
            ? t('newsletter.json.limited')
            : st === 403
              ? t('newsletter.json.closed')
              : t('newsletter.json.retrySafe'),
        color: ERR,
      },
    }
  }
  return {
    answer: <div style={wrapLine}>{t('newsletter.json.waiting')}</div>,
    foot: {
      label: 'idle',
      text: t('newsletter.json.idle'),
      color: 'var(--a2-text-lo)',
    },
  }
}
