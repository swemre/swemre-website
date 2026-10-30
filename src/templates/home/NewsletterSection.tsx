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

// "04L // newsletter": what the letter is, the three promises and the example email.
import {Split} from './kit/layout.tsx'
import {Rail} from './kit/Rail.tsx'
import {SectionBg} from './kit/SectionBg.tsx'
import {Anchor, Icon, SectionHeader, TextLink, type IconName} from './kit/ui.ts'
import {useCompact} from './kit/vp.ts'
import {t} from '../../i18n/index.ts'

const PROMISES: [IconName, string, string][] = [
  [
    'check',
    t('newsletter.promise.private'),
    t('newsletter.promise.private.copy'),
  ],
  ['mail', t('newsletter.promise.twoWay'), t('newsletter.promise.twoWay.copy')],
  [
    'message',
    t('newsletter.promise.human'),
    t('newsletter.promise.human.copy'),
  ],
]

function Promises() {
  return (
    <ul
      aria-label={t('newsletter.promises')}
      style={{display: 'flex', flexDirection: 'column', gap: 16}}
    >
      {PROMISES.map(([icon, title, line]) => (
        <li key={title}>
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              lineHeight: '22px',
              fontWeight: 650,
              color: 'var(--a2-text-hi)',
            }}
          >
            <Icon name={icon} size={14} style={{color: 'var(--a2-soft)'}} />
            {title}
          </p>
          <p className="a2-cap" style={{marginTop: 4}}>
            {line}
          </p>
        </li>
      ))}
    </ul>
  )
}

/** The hand-drawn underline under "touch." */
function Underline() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 150 14"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: -4,
        bottom: -10,
        width: 96,
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

/** A picture of a letter: its links are inert text styled as links (Q23). */
function ExampleEmail() {
  const inert = {color: 'var(--a2-text-lo)'}
  return (
    <article
      className="a2-card"
      aria-label={t('home.newsletter.example')}
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        borderColor: 'rgb(var(--a2-hue-mist-rgb) / 0.14)',
        boxShadow:
          'var(--a2-shadow-card),0 0 120px -20px rgb(var(--a2-hue-mist-rgb) / calc(0.12 * var(--a2-glow-k)))',
      }}
    >
      <div
        className="a2-padx"
        style={{
          paddingTop: 32,
          paddingBottom: 16,
          borderBottom: '1px solid var(--a2-line)',
        }}
      >
        <h3 className="a2-h4" style={{fontWeight: 700}}>
          New article: A modular monolith on Spring Boot
        </h3>
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flex: 'none',
              display: 'grid',
              placeItems: 'center',
              width: 34,
              height: 34,
              borderRadius: 999,
              background: 'var(--a2-blue-navy)',
              color: 'var(--a2-on-blue)',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            e
          </span>
          <div
            style={{flexGrow: 1, minWidth: 0, fontSize: 13, lineHeight: '20px'}}
          >
            <p style={{color: 'var(--a2-text-hi)', fontWeight: 600}}>
              {t('newsletter.eml.from.value')}{' '}
              <span style={{fontWeight: 400, color: 'var(--a2-text-lo)'}}>
                &lt;emre@swemre.com&gt;
              </span>
            </p>
            <p style={{color: 'var(--a2-text-lo)'}}>
              {t('home.newsletter.to', {email: 'priya.shah@lumen.dev'})}
            </p>
          </div>
          <span
            className="a2-mono"
            style={{fontSize: 12, whiteSpace: 'nowrap'}}
          >
            {t('newsletter.eml.date.value')}
          </span>
        </div>
      </div>
      <div
        className="a2-pad"
        style={{fontSize: 14, lineHeight: '23px', color: 'var(--a2-text)'}}
      >
        <p>{t('newsletter.eml.hi')}</p>
        <p style={{marginTop: 16}}>
          {t('newsletter.eml.newArticle')}{' '}
          <span style={{fontWeight: 600, color: 'var(--a2-text-hi)'}}>
            {t('newsletter.eml.articleTitle')}
          </span>
          .
        </p>
        <p style={{marginTop: 16, color: 'var(--a2-text-mid)'}}>
          {t('newsletter.eml.body')}
        </p>
        <p style={{marginTop: 16}}>
          <Anchor className="a2-ilink" href="/articles/modular-monolith">
            swemre.com/articles/modular-monolith
          </Anchor>
        </p>
        <p style={{marginTop: 32}}>Emre</p>
      </div>
      <p
        className="a2-padx"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '8px 16px',
          paddingTop: 16,
          paddingBottom: 16,
          borderTop: '1px solid var(--a2-line)',
          fontSize: 12,
          lineHeight: '16px',
          color: 'var(--a2-text-lo)',
        }}
      >
        <span>{t('newsletter.eml.why')}</span>
        <span style={{display: 'flex', gap: 8, whiteSpace: 'nowrap'}}>
          <span className="a2-ulink" style={inert}>
            {t('newsletter.eml.mute')}
          </span>
          <span aria-hidden="true" style={{color: 'var(--a2-text-faint)'}}>
            |
          </span>
          <span className="a2-ulink" style={inert}>
            {t('newsletter.eml.unsubscribe')}
          </span>
          <span aria-hidden="true" style={{color: 'var(--a2-text-faint)'}}>
            |
          </span>
          <span className="a2-ulink" style={inert}>
            {t('newsletter.eml.delete')}
          </span>
        </span>
      </p>
    </article>
  )
}

export function NewsletterSection() {
  const cmp = useCompact()
  return (
    <section className="a2-sec" data-cut aria-labelledby="home-newsletter">
      <SectionBg
        hue="mist"
        at={[66, 50]}
        second={{at: [16, 40]}}
        texture="paper"
      />
      <Rail from="mist" to="mist" node={[69, 95, 130, 166]} label="c3a91f0" />
      <div className="a2-c">
        <Split
          spans={[1, 5, 7, 6]}
          align="center"
          left={
            <SectionHeader
              id="home-newsletter"
              number={['04', '', 'L', 'mist']}
              eyebrow={t('newsletter.eyebrow')}
              title={
                <>
                  {t('home.newsletter.title')}{' '}
                  <span
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      color: 'var(--a2-blue-ink)',
                    }}
                  >
                    {t('home.newsletter.accent')}
                    <Underline />
                  </span>
                </>
              }
              copy={t('home.newsletter.copy')}
              extra={
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: cmp ? 24 : 32,
                  }}
                >
                  <Promises />
                  <div>
                    <TextLink
                      label={t('home.newsletter.page')}
                      href="/newsletter"
                    />
                  </div>
                </div>
              }
            />
          }
          right={<ExampleEmail />}
        />
      </div>
    </section>
  )
}
