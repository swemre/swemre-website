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

// The end of an article: "Was this article helpful?", previous / next, and the "More from the
// workshop" list of articles and projects.
import {Link} from 'react-router-dom'
import {
  isArticle,
  type ArticleSummary,
  type ProjectSummary,
} from '../../contract/view.ts'
import {Icon, useViewport} from '../../design/index.tsx'
import {fmtDate, minRead} from './format.ts'
import {Reactions} from './reactions.tsx'
import {rgb} from './vp.ts'
import {t} from '../../i18n/index.ts'

export function Helpful({slug, title}: {slug: string; title: string}) {
  const vp = useViewport()
  return (
    <div style={{marginTop: 48}}>
      <div
        className="a2-card"
        style={{
          borderColor: rgb('blue', 0.16),
          boxShadow: `var(--a2-shadow-card),0 0 120px -20px ${rgb('blue', 'calc(0.12 * var(--a2-glow-k))')}`,
        }}
      >
        <div
          style={
            vp === 'm'
              ? {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 16,
                }
              : {
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }
          }
        >
          <p className="a2-h4">{t('reading.helpful')}</p>
          <div
            style={{
              ...(vp === 'm' ? {} : {marginLeft: 'auto'}),
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <Reactions slug={slug} title={title} labelled />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PrevNext({
  prev,
  next,
}: {
  prev?: ArticleSummary
  next?: ArticleSummary
}) {
  const vp = useViewport()
  if (!prev && !next) return null
  const title = {
    display: 'block',
    marginTop: 8,
    fontSize: 16,
    lineHeight: '24px',
  } as const
  return (
    <nav
      aria-label={t('reading.more')}
      style={{
        marginTop: 48,
        paddingTop: 32,
        borderTop: '1px solid var(--a2-line)',
        display: 'grid',
        gridTemplateColumns: vp === 'm' ? '1fr' : '1fr 1fr',
        gap: 32,
      }}
    >
      {prev ? (
        <Link to={prev.href} style={{display: 'block'}} rel="prev">
          <span
            className="a2-micro"
            style={{display: 'inline-flex', alignItems: 'center', gap: 8}}
          >
            {t('reading.previous')}
          </span>
          <span className="a2-h4" style={{...title, color: 'var(--a2-text)'}}>
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          to={next.href}
          style={{display: 'block', textAlign: vp === 'm' ? 'left' : 'right'}}
          rel="next"
        >
          <span className="a2-micro" style={{color: 'var(--a2-soft)'}}>
            {t('reading.next')}
          </span>
          <span className="a2-h4" style={title}>
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  )
}

type Item = ArticleSummary | ProjectSummary

function meta(it: Item): [string, string] {
  if (isArticle(it)) return [fmtDate(it.publishedAt), minRead(it.readingTime)]
  return [it.language ?? '', it.tagline ?? it.summary]
}

/** "More from the workshop": numbered rows; the first project is drawn lifted, with OPEN ↗. */
export function RelatedRows({items}: {items: Item[]}) {
  const vp = useViewport()
  const featured = items.findIndex(it => !isArticle(it))
  if (vp === 'm') {
    return (
      <>
        {items.map(it => {
          const [a, b] = meta(it)
          return (
            <Link
              key={it.href}
              to={it.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '20px 0',
                borderTop: '1px solid var(--a2-line)',
              }}
            >
              <span className="a2-micro">
                {isArticle(it) ? t('reading.article') : t('reading.project')}
              </span>
              <span className="a2-h4">{it.title}</span>
              <span className="a2-mono">
                {[a, b].filter(Boolean).join(' · ')}
              </span>
            </Link>
          )
        })}
        <div style={{borderTop: '1px solid var(--a2-line)'}} />
      </>
    )
  }
  const tablet = vp === 't'
  return (
    <>
      {items.map((it, i) => {
        const [a, b] = meta(it)
        const lift = i === featured
        const pad = tablet ? 24 : 32
        return (
          <Link
            key={it.href}
            to={it.href}
            style={{
              display: 'grid',
              gridTemplateColumns: tablet
                ? '96px minmax(0,1fr) 24px'
                : '96px minmax(0,1fr) auto 240px 24px',
              columnGap: tablet ? 24 : 32,
              alignItems: 'center',
              padding: `${pad}px 0`,
              borderStyle: 'solid',
              borderColor: 'var(--a2-line)',
              borderWidth: '1px 0 0',
              ...(lift
                ? {
                    background: 'var(--a2-card-bg)',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: rgb('peri', 0.2),
                    borderRadius: 12,
                    margin: '0 -24px',
                    padding: `${pad}px 24px`,
                    boxShadow: `0 0 64px -20px ${rgb('peri', 'calc(0.25 * var(--a2-glow-k))')}`,
                  }
                : {}),
            }}
          >
            <span className="a2-mono">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="a2-micro">
                {isArticle(it) ? t('reading.article') : t('reading.project')}
              </span>
              <span className="a2-h4" style={{display: 'block', marginTop: 8}}>
                {it.title}
              </span>
              {tablet && (
                <span
                  className="a2-mono"
                  style={{display: 'block', marginTop: 8}}
                >
                  {[a, b].filter(Boolean).join(' · ')}
                </span>
              )}
            </span>
            {!tablet &&
              (lift ? (
                <span
                  className="p2-glyph a2-island"
                  style={{
                    width: 176,
                    height: 64,
                    fontSize: 12,
                    letterSpacing: '.16em',
                    transform: 'rotate(-4deg)',
                    boxShadow: `var(--a2-shadow-stamp),0 0 32px -6px ${rgb('peri', 'calc(0.55 * var(--a2-glow-k))')}`,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `repeating-radial-gradient(circle at 80% 50%,${rgb('peri', 0.2)} 0,${rgb('peri', 0.2)} 1px,transparent 1px,transparent 8px)`,
                    }}
                  />
                  <span style={{position: 'relative'}}>
                    {t('reading.open')}
                  </span>
                </span>
              ) : (
                <span />
              ))}
            {!tablet && (
              <span style={{textAlign: 'right'}}>
                <span
                  className="a2-cap"
                  style={{display: 'block', color: 'var(--a2-text)'}}
                >
                  {a}
                </span>
                <span className="a2-mono">{b}</span>
              </span>
            )}
            <span
              style={{color: lift ? 'var(--a2-link)' : 'var(--a2-text-lo)'}}
            >
              <Icon name="arrow-right" size={18} />
            </span>
          </Link>
        )
      })}
      <div style={{borderTop: '1px solid var(--a2-line)'}} />
    </>
  )
}
