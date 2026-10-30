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

// Home hero: branch pill, name, lead, the two calls to action, the arc, the three facts and the
// status bar.
import type {CSSProperties} from 'react'
import type {SiteSettings, Song} from '../../contract/view.ts'
import {useViewport} from '../../design/index.tsx'
import {Arc} from './Arc.tsx'
import {Button, Icon} from './kit/ui.ts'
import {useV} from './kit/vp.ts'
import {t} from '../../i18n/index.ts'

const COPY = {
  eyebrow: t('settings.tagline'),
  lead: t('home.hero.lead'),
  facts: [
    ['SwePress', t('home.hero.nowBuilding')],
    [t('home.hero.latestValue'), t('home.hero.latestArticle')],
    [t('home.hero.cadence'), t('footer.newsletter')],
  ],
}

function HeroBackground() {
  const v = useV()
  const [w1, h1] = v([320, 360], [520, 480], [640, 560], [700, 600])
  const [w2, h2] = v([260, 300], [420, 400], [560, 460], [620, 500])
  const fade = v(720, 840, 860, 1040)
  const mask = `linear-gradient(to bottom,#000 0,#000 ${fade}px,transparent 100%)`
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        bottom: v(-320, -440, -440),
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
        style={{
          position: 'absolute',
          left: `calc(50% - ${w1 / 2}px)`,
          top: v(-260, -320, -400, -420),
          width: w1,
          height: h1,
          borderRadius: 999,
          background: 'var(--a2-hero-glow-1)',
          filter: 'blur(120px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: v('56.4%', '60%', '62%'),
          top: v(260, 180, 140),
          width: w2,
          height: h2,
          borderRadius: 999,
          background: 'var(--a2-hero-glow-2)',
          filter: 'blur(120px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -20,
          right: -20,
          top: v(500, 660, 720, 900),
          height: v(520, 700, 820, 900),
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

function BranchPill({label}: {label: string}) {
  return (
    <p
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 16,
        height: 34,
        padding: '0 16px',
        borderRadius: 999,
        border: '1px solid var(--a2-pill-line)',
        background: 'var(--a2-pill-bg)',
        boxShadow: 'var(--a2-pill-inset),var(--a2-shadow-pill)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          paddingRight: 16,
          borderRight: '1px solid var(--a2-pill-sep)',
          color: 'var(--a2-pale)',
        }}
      >
        <Icon name="git-branch" size={14} />
        main
      </span>
      <span
        style={{
          letterSpacing: '.24em',
          textTransform: 'uppercase',
          color: 'var(--a2-hero-label)',
        }}
      >
        {label}
      </span>
    </p>
  )
}

function HeroFacts({facts}: {facts: string[][]}) {
  const v = useV()
  const dd: CSSProperties = {
    fontSize: v(16, 20, 24),
    lineHeight: v('22px', '28px', '32px'),
    fontWeight: 750,
    letterSpacing: '-.02em',
    color: 'var(--a2-pale)',
    textShadow:
      '0 0 24px rgb(var(--a2-pale-rgb) / calc(.35 * var(--a2-glow-text-k)))',
  }
  return (
    <dl
      style={{display: 'flex', justifyContent: 'center', flexDirection: 'row'}}
    >
      {facts.map(([value, label]) => (
        <div
          key={label}
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 8,
            width: v<string | number>('33.3%', 240, 260),
            textAlign: 'center',
          }}
        >
          <dt className="a2-micro" style={{color: 'var(--a2-hero-dt)'}}>
            {label}
          </dt>
          <dd style={dd}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

const dot: CSSProperties = {
  width: 3,
  height: 3,
  borderRadius: 999,
  background: 'var(--a2-status-dot)',
}
const part: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  color: 'var(--a2-meta)',
}

/** Four static bars before the song pick (no player: plain text, Q1). */
export function SongBars({size = 11}: {size?: 11 | 14}) {
  const heights = size === 11 ? [6, 11, 8, 4] : [7, 14, 10, 5]
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: 2,
        height: size,
      }}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 1,
            background: 'var(--a2-hue-lilac)',
          }}
        />
      ))}
    </span>
  )
}

function StatusBar({song}: {song?: Song}) {
  const vp = useViewport()
  const wide = vp === 'd' || vp === '4k'
  const mask =
    'linear-gradient(90deg,transparent 0,#000 112px,#000 calc(100% - 112px),transparent 100%)'
  const parts = [
    <span key="branch" style={{...part, color: 'var(--a2-meta-hi)'}}>
      <span style={{display: 'inline-flex', color: 'var(--a2-hue-sky)'}}>
        <Icon name="git-branch" size={14} />
      </span>
      main
    </span>,
    <span key="sync" style={part}>
      <Icon name="check" size={13} style={{color: 'var(--a2-mint)'}} />
      {t('home.status.synced')}
    </span>,
    <span key="problems" style={part}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: 'var(--a2-mint)',
        }}
      />
      {t('home.status.problems')}
    </span>,
    ...(wide
      ? [
          <span key="enc" style={part}>
            UTF-8
          </span>,
          <span key="eol" style={part}>
            LF
          </span>,
        ]
      : []),
    <span key="lang" style={part}>
      <span style={{color: 'var(--a2-hue-peri)'}}>{'{}'}</span>Java 25
    </span>,
    ...(song
      ? [
          <span key="song" style={{...part, color: 'var(--a2-meta-hi)'}}>
            <SongBars />
            {song.title}
            <span style={{color: 'var(--a2-meta-lo)'}}>· {song.artist}</span>
          </span>,
        ]
      : []),
  ]
  return (
    <div
      role="group"
      aria-label={t('footer.status')}
      className="a2-mono"
      style={
        wide
          ? {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              height: 16,
              fontSize: 12,
              lineHeight: '16px',
              WebkitMaskImage: mask,
              maskImage: mask,
            }
          : {
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px 16px',
              fontSize: 12,
              lineHeight: '16px',
            }
      }
    >
      {parts.flatMap((p, i) =>
        i ? [<span key={`d${i}`} aria-hidden="true" style={dot} />, p] : [p],
      )}
    </div>
  )
}

export function Hero({settings, song}: {settings?: SiteSettings; song?: Song}) {
  const vp = useViewport()
  const v = useV()
  const mobile = vp === 'm'
  const facts = [
    [settings?.nowBuilding ?? COPY.facts[0][0], COPY.facts[0][1]],
    [settings?.latestArticle ?? COPY.facts[1][0], COPY.facts[1][1]],
    [settings?.newsletterCadence ?? COPY.facts[2][0], COPY.facts[2][1]],
  ]
  const gap = v(24, 24, 32)
  const intro = (
    <div
      className="a2-c"
      style={mobile ? undefined : {flexGrow: 1, paddingTop: v(0, 96, 128, 224)}}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <BranchPill label={settings?.heroEyebrow ?? COPY.eyebrow} />
        <div style={{marginTop: gap}}>
          <h1 className="a2-d1" style={{textWrap: 'balance'}}>
            {t('home.hero.title')}
            <br />
            <span className="a2-accent">Emre</span>
          </h1>
        </div>
        <p
          className="a2-lead"
          style={{marginTop: gap, maxWidth: 760, textWrap: 'balance'}}
        >
          {settings?.heroLead ?? COPY.lead}
        </p>
        <div
          style={{
            display: 'flex',
            ...(mobile
              ? {flexDirection: 'column'}
              : {alignItems: 'center', flexWrap: 'wrap'}),
            gap: 16,
            marginTop: gap,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Button
            label={t('nav.subscribe')}
            iconLeft="mail"
            href="/newsletter"
            block={mobile}
            style={mobile ? undefined : {width: 224}}
          />
          <Button
            label={t('menu.callBack')}
            kind="secondary"
            iconLeft="phone"
            href="/call-back"
            block={mobile}
            style={mobile ? undefined : {width: 224}}
          />
        </div>
      </div>
    </div>
  )
  if (mobile)
    return (
      <section data-cut style={{position: 'relative', paddingTop: 112}}>
        <HeroBackground />
        {intro}
        <div style={{position: 'relative', height: 300, marginTop: 24}}>
          <Arc label="HEAD · 2026" />
          <div style={{position: 'relative', zIndex: 1, padding: '96px 8px 0'}}>
            <HeroFacts facts={facts} />
          </div>
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              marginTop: 32,
              padding: '0 16px',
            }}
          >
            <StatusBar song={song} />
          </div>
        </div>
      </section>
    )
  return (
    <section
      data-cut
      style={{
        position: 'relative',
        height: v(0, 880, 900, 1080),
        padding: '64px 0 16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <HeroBackground />
      <Arc label="HEAD · 2026" />
      {intro}
      <div style={{position: 'relative', zIndex: 1, marginTop: 'auto'}}>
        <HeroFacts facts={facts} />
        <div style={{marginTop: v(0, 32, 24)}}>
          {vp === 't' ? (
            <div className="a2-c">
              <StatusBar song={song} />
            </div>
          ) : (
            <StatusBar song={song} />
          )}
        </div>
      </div>
    </section>
  )
}
