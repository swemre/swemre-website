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

// Article covers: the code cover (p2-cover: dots, four highlighted lines, glyph, file name), the
// blueprint glyph cover (a2-cover, V4-Comp-ArticleCard) and the image cover. Covers are dark
// islands in both themes. Mobile and tablet centre the glyph and drop the code.
import type {CSSProperties, ReactNode} from 'react'
import type {CodeCover as CodeCoverData, Media} from '../../contract/view.ts'
import {useViewport} from '../context.ts'
import {cx, glyphFor, hueRgb, type Hue} from './util.ts'
import {t} from '../../i18n/index.ts'

const KEYWORDS = new Set(
  'class interface record enum static public private protected final void return new import package const let var function export type extends implements async await fun val def root'.split(
    ' ',
  ),
)
const TYPE_AFTER = new Set([
  'interface',
  'record',
  'enum',
  'type',
  'extends',
  'implements',
])

/** A tiny highlighter for the four cover lines: keywords, types, strings, annotations, comments. */
function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = []
  const re =
    /(\/\/.*$)|("[^"]*"|'[^']*'|#[0-9a-fA-F]{3,8}\b)|(@\w+)|(<\/?)([A-Z]\w*)|([A-Za-z_]\w*)/g
  let last = 0
  let prev = ''
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index))
    const [all, cm, st, an, lt, tag, word] = m
    if (cm)
      out.push(
        <b key={k++} className="p2-cm">
          {cm}
        </b>,
      )
    else if (st)
      out.push(
        <b key={k++} className="p2-st">
          {st}
        </b>,
      )
    else if (an)
      out.push(
        <b key={k++} className="p2-an">
          {an}
        </b>,
      )
    else if (tag)
      out.push(
        lt,
        <b key={k++} className="p2-ty">
          {tag}
        </b>,
      )
    else if (word && KEYWORDS.has(word))
      out.push(
        <b key={k++} className="p2-kw">
          {word}
        </b>,
      )
    else if (word && TYPE_AFTER.has(prev))
      out.push(
        <b key={k++} className="p2-ty">
          {word}
        </b>,
      )
    else out.push(all)
    if (word) prev = word
    last = m.index + all.length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

type CoverData = CodeCoverData & {hue?: Hue; glyph?: string}

export function CodeCover({
  cover,
  hue,
  title,
  style,
}: {
  cover: CoverData
  hue: Hue
  title: string
  style?: CSSProperties
}) {
  const vp = useViewport()
  const full = vp === 'd' || vp === '4k'
  const size = vp === '4k' ? 48 : full ? 36 : 40
  const lines = cover.code.split('\n').slice(0, 4)
  return (
    <div
      className="p2-cover a2-island"
      role="img"
      aria-label={t('cover.label', {title})}
      style={{
        borderColor: hueRgb(hue, 0.26),
        background: `radial-gradient(120% 140% at 82% 24%,${hueRgb(hue, 0.34)},transparent 60%),var(--a2-cover-grad)`,
        ...style,
      }}
    >
      <div className="gr" />
      <div className="dots">
        <span />
        <span />
        <span />
      </div>
      {full && (
        <div className="code">
          {lines.map((l, i) => (
            <span key={i}>
              <i>{i + 1}</i>
              {highlight(l)}
              {i < lines.length - 1 && '\n'}
            </span>
          ))}
        </div>
      )}
      <div
        className="glyph"
        style={{
          ...(full
            ? {}
            : {right: 'auto', left: '50%', transform: 'translate(-50%,-50%)'}),
          fontSize: size,
          lineHeight: `${size}px`,
          textShadow: `0 0 28px ${hueRgb(hue, 'calc(0.75 * var(--a2-glow-text-k))')}`,
        }}
      >
        {glyphFor(cover)}
      </div>
      {full && cover.filename && <div className="file">{cover.filename}</div>}
    </div>
  )
}

/** The image cover: same frame as the code cover. */
export function ImageCover({media, hue}: {media: Media; hue: Hue}) {
  return (
    <div
      className="p2-cover a2-island"
      style={{borderColor: hueRgb(hue, 0.26)}}
    >
      <img
        src={media.url}
        alt={media.alt}
        width={media.width}
        height={media.height}
        loading="lazy"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  )
}

/** The blueprint glyph cover of the component sheet (a2-cover: grid, dots, two bars, glyph). */
export function GlyphCover({
  glyph,
  hue,
  title,
  height,
  className,
}: {
  glyph: string
  hue: Hue
  title: string
  height: number
  className?: string
}) {
  const fs = height >= 240 ? 33 : height >= 216 ? 30 : 28
  const dot: CSSProperties = {
    width: 5,
    height: 5,
    borderRadius: 9,
    background: 'var(--a2-cover-dot)',
  }
  return (
    <div
      className={cx('a2-cover a2-island', className)}
      role="img"
      aria-label={t('cover.for', {title})}
      style={{
        height,
        borderRadius: 10,
        background: `radial-gradient(120% 140% at 80% 20%,${hueRgb(hue, 0.35)},transparent 60%),var(--a2-cover-grad)`,
        borderColor: hueRgb(hue, 0.28),
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
          fontFamily: 'var(--font-mono)',
          fontSize: fs,
          fontWeight: 700,
          color: 'var(--a2-text-glyph)',
          textShadow: `0 0 24px ${hueRgb(hue, 0.7)}`,
        }}
      >
        {glyph}
      </div>
    </div>
  )
}
