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

// MegaMenu (V4-Comp-MegaMenu, boards Mega-articles / Mega-projects): desktop and 4K only. A sheet
// under the bar with the section intro and links, four featured tiles and the topic chips (or the
// "Also" links). The scrim is a solid fill; the page under it never moves.
import {
  Anchor,
  Chip,
  Icon,
  Skel,
  TextLink,
  formatDate,
  glyphFor,
  articleHue,
  hueRgb,
  projectGlyph,
  projectHue,
  useViewport,
} from '../design/index.tsx'
import type {
  ArticleSummary,
  Loadable,
  MegaMenuData,
  ProjectSummary,
} from '../contract/view.ts'
import {isArticle} from '../contract/view.ts'
import {MEGA_COPY} from './fallback.ts'
import type {MegaKey} from './context.ts'
import {t} from '../i18n/index.ts'

const dot = {
  width: 5,
  height: 5,
  borderRadius: 9,
  background: 'var(--a2-meta-arrow)',
}

function ArticleTile({a, index}: {a: ArticleSummary; index: number}) {
  const hue = articleHue(a, index)
  return (
    <Anchor href={a.href} style={{display: 'block'}}>
      <div
        className="p2-cover a2-island"
        role="img"
        aria-label={t('cover.label', {title: a.title})}
        style={{
          borderColor: hueRgb(hue, 0.26),
          background: `radial-gradient(120% 140% at 82% 24%,${hueRgb(hue, 0.34)},transparent 60%),var(--a2-cover-grad)`,
        }}
      >
        <div className="gr" />
        <div className="dots">
          <span />
          <span />
          <span />
        </div>
        <div
          className="glyph"
          style={{
            right: 'auto',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            fontSize: 28,
            lineHeight: '28px',
            textShadow: `0 0 28px ${hueRgb(hue, 'calc(0.75 * var(--a2-glow-text-k))')}`,
          }}
        >
          {glyphFor(a.codeCover)}
        </div>
      </div>
      <span
        className="a2-mono"
        style={{display: 'block', marginTop: 24, whiteSpace: 'nowrap'}}
      >
        {formatDate(a.publishedAt)}
        {a.readingTime && (
          <>
            {' '}
            <span style={{color: 'var(--a2-text-dim)'}}>/</span> {a.readingTime}{' '}
            min
          </>
        )}
      </span>
      <span
        className="a2-h4"
        style={{
          marginTop: 8,
          fontSize: 16,
          lineHeight: '24px',
          textWrap: 'balance',
          display: 'block',
        }}
      >
        {a.title}
      </span>
    </Anchor>
  )
}

function ProjectTile({p, index}: {p: ProjectSummary; index: number}) {
  const hue = projectHue(p, index)
  const bar = (p.repoUrl ?? p.url ?? p.href)
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
  return (
    <Anchor href={p.href} style={{display: 'block'}}>
      <div
        className="p2-cover a2-island"
        style={{
          aspectRatio: 'auto',
          height: 144,
          borderColor: hueRgb(hue, 0.26),
          background: `radial-gradient(120% 140% at 80% 20%,${hueRgb(hue, 0.34)},transparent 60%),var(--a2-cover-grad)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 24,
            padding: '0 8px',
            background: 'var(--a2-code-bar)',
            borderBottom: '1px solid var(--a2-line-blue)',
          }}
        >
          <span style={dot} />
          <span style={dot} />
          <span style={dot} />
          <span
            className="a2-mono"
            style={{
              fontSize: 12,
              lineHeight: '16px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {bar}
          </span>
        </div>
        <div className="gr" style={{top: 24}} />
        <div
          className="glyph"
          style={{
            right: 'auto',
            left: '50%',
            top: 84,
            transform: 'translate(-50%,-50%)',
            fontSize: 28,
            lineHeight: '28px',
            textShadow: `0 0 24px ${hueRgb(hue, 'calc(0.8 * var(--a2-glow-text-k))')}`,
          }}
        >
          {projectGlyph(p)}
        </div>
      </div>
      <span
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
          marginTop: 24,
        }}
      >
        <span className="a2-h4" style={{fontSize: 16, lineHeight: '24px'}}>
          {p.title}
        </span>
        {p.year && <span className="a2-mono">{p.year}</span>}
      </span>
      <span className="a2-cap" style={{display: 'block', marginTop: 8}}>
        {p.stack.map(s => s.name).join(' · ')}
      </span>
    </Anchor>
  )
}

function TileSkeleton({tall}: {tall: boolean}) {
  return (
    <div aria-hidden="true">
      <Skel
        w="100%"
        h={tall ? 144 : 'auto'}
        r={10}
        style={tall ? undefined : {aspectRatio: '16/9'}}
      />
      <Skel w={120} h={12} style={{marginTop: 24}} />
      <Skel w="80%" h={16} style={{marginTop: 12}} />
    </div>
  )
}

export function MegaMenu({
  kind,
  data,
  onClose,
}: {
  kind: MegaKey
  data: Loadable<MegaMenuData>
  onClose(): void
}) {
  const vp = useViewport()
  const copy = MEGA_COPY[kind]
  const ready = data.status === 'ready' ? data.data : null
  const side =
    kind === 'articles' ? (
      <>
        <TextLink label={copy.all.label} href={copy.all.href} />
        <Anchor
          href="/articles?saved=1"
          className="a2-small"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--a2-text)',
          }}
        >
          <Icon name="bookmark" />
          {t('mega.saved')}
        </Anchor>
        <Anchor
          href="/rss.xml"
          className="a2-small"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--a2-text)',
          }}
        >
          <Icon name="rss" />
          {t('footer.rss')}
        </Anchor>
      </>
    ) : (
      <>
        <TextLink label={copy.all.label} href={copy.all.href} />
        <Anchor
          href="https://github.com/swemre"
          className="a2-small"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--a2-text)',
          }}
        >
          <Icon name="github" />
          github.com/swemre
        </Anchor>
      </>
    )
  const featured = ready?.featured.slice(0, 4) ?? []
  return (
    <>
      <div
        className="p2-mscrim"
        aria-hidden="true"
        onClick={onClose}
        onMouseEnter={onClose}
      />
      <div
        className="p2-mega"
        id={`a2-mega-${kind}`}
        role="region"
        aria-label={t('mega.label', {title: copy.title})}
        onMouseLeave={onClose}
      >
        <div
          className="a2-c"
          style={{padding: vp === '4k' ? '128px 0 64px' : '128px 0 48px'}}
        >
          <div className="a2-g12">
            <div
              style={{
                gridColumn: '1 / span 3',
                paddingRight: 32,
                borderRight: '1px solid var(--a2-line-blue)',
              }}
            >
              <span className="a2-eyebrow">// {copy.eyebrow}</span>
              <h3 className="a2-h3" style={{marginTop: 16}}>
                {copy.title}
              </h3>
              <p className="a2-small" style={{marginTop: 8}}>
                {copy.copy}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  marginTop: 32,
                }}
              >
                {side}
              </div>
            </div>
            <div style={{gridColumn: '4 / span 9', paddingLeft: 32}}>
              <div
                className="a2-cols"
                style={{
                  gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
                  columnGap: 32,
                  rowGap: 32,
                }}
                aria-busy={!ready || undefined}
              >
                {ready
                  ? featured.map((f, i) =>
                      isArticle(f) ? (
                        <ArticleTile key={f.slug} a={f} index={i} />
                      ) : (
                        <ProjectTile key={f.slug} p={f} index={i} />
                      ),
                    )
                  : [0, 1, 2, 3].map(i => (
                      <TileSkeleton key={i} tall={kind === 'projects'} />
                    ))}
              </div>
              <div className="a2-hr" style={{margin: '32px 0'}} />
              {kind === 'articles' ? (
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <span className="a2-micro">{t('mega.topics')}</span>
                  <div className="a2-chips" style={{gap: 8}}>
                    {ready
                      ? ready.topics
                          .slice(0, 8)
                          .map(t => (
                            <Chip
                              key={t.slug}
                              label={t.name}
                              count={t.count}
                              href={t.href}
                            />
                          ))
                      : [56, 104, 72, 84, 96, 108, 56, 128].map((w, i) => (
                          <Skel key={i} w={w} h={32} />
                        ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '8px 24px',
                    fontSize: 14,
                  }}
                >
                  <span className="a2-micro">{t('mega.also')}</span>
                  {ready?.links.map(l => (
                    <Anchor key={l.href} className="a2-ulink" href={l.href}>
                      {l.label}
                    </Anchor>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
