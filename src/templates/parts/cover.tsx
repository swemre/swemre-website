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

// Article covers: the large code cover (.p2-cover) of the article page and the small one of the
// "Recent articles" cards.
import type {ReactNode} from 'react'
import type {ArticleSummary, Hue} from '../../contract/view.ts'
import {useViewport} from '../../design/index.tsx'
import {rgb} from './vp.ts'
import {t} from '../../i18n/index.ts'

const KEYWORDS =
  /\b(class|interface|record|enum|public|private|protected|static|final|void|return|new|import|package|extends|implements|const|let|var|function|export|default|async|await|if|else|for|while|fun|val|def)\b/

/** Light syntax colouring for the cover snippet: annotations, keywords, strings, comments. */
function colour(line: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = new RegExp(
    `(@\\w+)|(\\/\\/.*$)|("[^"]*"|'[^']*')|${KEYWORDS.source}`,
    'g',
  )
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index))
    const cls = m[1] ? 'p2-an' : m[2] ? 'p2-cm' : m[3] ? 'p2-st' : 'p2-kw'
    out.push(
      <b key={m.index} className={cls}>
        {m[0]}
      </b>,
    )
    last = m.index + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

export function ArticleCover({article}: {article: ArticleSummary}) {
  const vp = useViewport()
  const hue: Hue = article.hue
  const cc = article.codeCover
  const glyph = vp === 'm' ? 56 : 96
  const repo = cc?.repo
  const caption = article.coverCaption
  let cover: ReactNode
  if (article.coverStyle === 'image' && article.cover) {
    cover = (
      <img
        className="p2-cover"
        src={article.cover.url}
        alt={article.cover.alt}
        style={{width: '100%', objectFit: 'cover', display: 'block'}}
      />
    )
  } else if (cc) {
    cover = (
      <div
        className="p2-cover a2-island"
        role="img"
        aria-label={t('cover.label', {title: article.title})}
        style={{
          borderColor: rgb(hue, 0.26),
          background: `radial-gradient(120% 140% at 82% 24%,${rgb(hue, 0.34)},transparent 60%),var(--a2-cover-grad)`,
        }}
      >
        <div className="gr" />
        <div className="dots">
          <span />
          <span />
          <span />
        </div>
        <div className="code">
          {cc.code.split('\n').map((line, i, all) => (
            <span key={i}>
              <i>{i + 1}</i>
              {colour(line)}
              {i < all.length - 1 && '\n'}
            </span>
          ))}
        </div>
        {cc.glyph && (
          <div
            className="glyph"
            style={{
              fontSize: glyph,
              lineHeight: `${glyph}px`,
              textShadow: `0 0 28px ${rgb(hue, 'calc(0.75 * var(--a2-glow-text-k))')}`,
            }}
          >
            {cc.glyph}
          </div>
        )}
        {cc.filename && <div className="file">{cc.filename}</div>}
      </div>
    )
  } else {
    return null
  }
  return (
    <figure style={{marginTop: 0}}>
      {cover}
      {(caption || repo) && (
        <figcaption
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 16,
          }}
        >
          <span className="a2-cap">{caption}</span>
          {repo && <span className="a2-mono">{repo}</span>}
        </figcaption>
      )}
    </figure>
  )
}

/** The small cover of a "Recent articles" card (128 x 88 on desktop, 96 x 72 below). */
export function MiniCover({article}: {article: ArticleSummary}) {
  const vp = useViewport()
  const hue = article.hue
  const small = vp === 'm' || vp === 't'
  const dot = {
    width: 5,
    height: 5,
    borderRadius: 9,
    background: 'var(--a2-cover-dot)',
  }
  return (
    <div style={{width: small ? 96 : 128, flex: 'none'}}>
      <div
        className="a2-cover a2-island"
        role="img"
        aria-label={t('cover.for', {title: article.title})}
        style={{
          height: small ? 72 : 88,
          borderRadius: 8,
          background: `radial-gradient(120% 140% at 80% 20%,${rgb(hue, 0.35)},transparent 60%),var(--a2-cover-grad)`,
          borderColor: rgb(hue, 0.28),
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right,var(--a2-cover-grid) 1px,transparent 1px),linear-gradient(var(--a2-cover-grid) 1px,transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 10,
            display: 'flex',
            gap: 4,
          }}
        >
          <span style={dot} />
          <span style={dot} />
          <span style={dot} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 24,
            width: 28,
            height: 2,
            borderRadius: 2,
            background: `var(--a2-hue-${hue})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 30,
            width: 18,
            height: 2,
            borderRadius: 2,
            background: 'var(--a2-cover-line)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--a2-text-glyph)',
            textShadow: `0 0 24px ${rgb(hue, 0.7)}`,
          }}
        >
          {article.codeCover?.glyph ?? '{ }'}
        </div>
      </div>
    </div>
  )
}
