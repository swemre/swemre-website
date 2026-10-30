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

// The two statement sections: the BTW reel ("I write Java, BTW.") and the newsletter promise.
import {Rail} from './kit/Rail.tsx'
import {StatementBg} from './kit/SectionBg.tsx'
import {useV} from './kit/vp.ts'
import {t} from '../../i18n/index.ts'

const REEL = ['Rust', 'TypeScript', 'Java', 'Go', 'Python']
const FADE =
  'linear-gradient(to bottom,transparent 4%,rgba(0,0,0,.1) 20%,rgba(0,0,0,.3) 36%,#000 40.5%,#000 59.5%,rgba(0,0,0,.3) 64%,rgba(0,0,0,.1) 80%,transparent 96%)'
const clip = {
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  textShadow: 'none',
  opacity: 0,
}

export function ReelStatement() {
  const v = useV()
  const [size, line] = v([36, 40], [56, 56], [96, 92], [128, 124])
  const reelW = v(400, 720, 1000, 1200)
  const ruleX = v(-12, -16, -24, -28)
  const rules = v([82, 122], [115, 170], [189, 279], [254, 376])
  const height = line * REEL.length
  return (
    <section
      className="a2-sec is-xl"
      data-cut
      aria-label={t('home.statement.label')}
    >
      <StatementBg left="sky" right="blue" />
      <Rail from="sky" to="blue" node={[191, 263, 352, 560]} label="7a11ca7" />
      <div className="a2-c">
        <div style={{textAlign: 'center'}}>
          <p className="a2-sr">
            {/* The pun stays in English in every language. */}
            <span lang="en">I write Java, BTW.</span> {t('home.statement.sr')}
          </p>
          <div
            className="a2-stmt"
            aria-hidden="true"
            lang="en"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: size,
              lineHeight: `${line}px`,
            }}
          >
            <span>I write</span>
            <span
              style={{
                position: 'relative',
                display: 'inline-block',
                height,
                margin: '0 .02em 0 .26em',
              }}
            >
              <span
                style={{
                  visibility: 'hidden',
                  display: 'inline-block',
                  lineHeight: `${height}px`,
                }}
              >
                Java
              </span>
              <span
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  width: reelW,
                  height,
                  transform: 'translateX(-50%)',
                  WebkitMaskImage: FADE,
                  maskImage: FADE,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {REEL.map(lang => (
                    <span
                      key={lang}
                      style={{
                        display: 'block',
                        height: line,
                        whiteSpace: 'nowrap',
                        color:
                          lang === 'Java' ? undefined : 'var(--a2-reel-dim)',
                      }}
                    >
                      {lang}
                    </span>
                  ))}
                </span>
              </span>
              {rules.map(top => (
                <span
                  key={top}
                  style={{
                    position: 'absolute',
                    left: ruleX,
                    right: ruleX,
                    top,
                    height: 1,
                    background: 'var(--a2-reel-rule)',
                  }}
                />
              ))}
            </span>
            <span>,</span>
            <span style={{position: 'relative', display: 'inline-block'}}>
              <span
                className="a2-gl-a"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  backgroundImage:
                    'linear-gradient(95deg,var(--a2-hue-sky),var(--a2-hue-blue))',
                  ...clip,
                }}
              >
                BTW.
              </span>
              <span
                className="a2-gl-b"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  backgroundImage: 'var(--a2-reel-grad)',
                  ...clip,
                }}
              >
                BTW.
              </span>
              <span className="a2-accent2">BTW.</span>
            </span>
          </div>
          <p
            className="a2-mono"
            aria-hidden="true"
            style={{
              marginTop: 16,
              color: 'var(--a2-text-mono-2)',
              whiteSpace: v('normal', undefined, undefined),
            }}
          >
            <span style={{color: 'var(--a2-hue-sky)'}}>$</span> pick --lang go
            rust ts python java{' '}
            <span style={{color: 'var(--a2-meta-arrow)'}}>→</span>{' '}
            <span style={{color: 'var(--a2-reel-hi)'}}>java</span>
            <span style={{color: 'var(--a2-meta-arrow)'}}>
              {` \u00a0// ${t('home.statement.favorite')}`}
            </span>
            <span className="a2-caret" />
          </p>
        </div>
      </div>
    </section>
  )
}

export function PromiseStatement() {
  const v = useV()
  return (
    <section
      className="a2-sec is-xl"
      data-cut
      aria-label={t('home.promise.label')}
    >
      <StatementBg left="lilac" right="mist" />
      <Rail
        from="lilac"
        to="mist"
        node={[169, 219, 242, 394]}
        label="b1ade00"
      />
      <div className="a2-c">
        <div style={{textAlign: 'center'}}>
          <p
            className="a2-d1"
            style={{
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
          <p
            className="a2-mono"
            style={{marginTop: v(48, 48, 64), color: 'var(--a2-text-mono-2)'}}
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
