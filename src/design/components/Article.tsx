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

// ArticleCard (V4-Comp-ArticleCard and the Articles "With covers" grid) and ArticleRow
// (V4-Comp-ArticleRow on the home page, and the "Text only" rows of the Articles page).
import type {ArticleSummary, Hue} from '../../contract/view.ts'
import {useViewport} from '../context.ts'
import {Anchor} from './Link.tsx'
import {Icon} from './Icon.tsx'
import {CodeCover, GlyphCover, ImageCover} from './Cover.tsx'
import {BadgeList, Tags} from './Text.tsx'
import {articleHue, formatDate, glyphFor} from './util.ts'
import {t} from '../../i18n/index.ts'

function readTime(a: ArticleSummary): string | undefined {
  return a.readingTime
    ? t('article.minRead', {count: a.readingTime})
    : undefined
}

export interface ArticleCardProps {
  article: ArticleSummary
  /** cover: image (or the blueprint glyph cover without an image); code: the code cover;
   * text: no cover. Defaults to the article's coverStyle. */
  variant?: 'cover' | 'code' | 'text'
  /** Position in the list: picks the cover hue until the content carries one. */
  index?: number
  hue?: Hue
}

export function ArticleCard({
  article: a,
  variant,
  index = 0,
  hue,
}: ArticleCardProps) {
  const vp = useViewport()
  const v =
    variant ??
    (a.coverStyle === 'code'
      ? 'code'
      : a.coverStyle === 'image'
        ? 'cover'
        : 'text')
  const h = hue ?? articleHue(a, index)
  const time = readTime(a)
  let cover = null
  if (v === 'code' && a.codeCover)
    cover = <CodeCover cover={a.codeCover} hue={h} title={a.title} />
  else if (v === 'cover' && a.cover)
    cover = <ImageCover media={a.cover} hue={h} />
  else if (v !== 'text')
    cover = (
      <GlyphCover
        glyph={glyphFor(a.codeCover)}
        hue={h}
        title={a.title}
        height={{m: 200, t: 200, d: 216, '4k': 240}[vp]}
      />
    )
  return (
    <Anchor href={a.href} style={{display: 'flex', flexDirection: 'column'}}>
      {cover}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: cover ? 24 : 0,
        }}
      >
        <span className="a2-mono">
          {formatDate(a.publishedAt)}
          {time && (
            <>
              {' '}
              <span style={{color: 'var(--a2-text-dim)'}}>/</span> {time}
            </>
          )}
        </span>
      </span>
      <h3 className="a2-h4" style={{marginTop: 8, textWrap: 'balance'}}>
        {a.title}
      </h3>
      <p className="a2-small" style={{marginTop: 8}}>
        {a.summary}
      </p>
      {a.tags.length > 0 && (
        <BadgeList tags={a.tags.map(t => t.name)} style={{marginTop: 16}} />
      )}
    </Anchor>
  )
}

export interface ArticleRowProps {
  article: ArticleSummary
  /** home: the home page rows (feature = first row, h3 and a lit arrow); list: the Articles
   * "Text only" rows. */
  variant?: 'home' | 'list'
  feature?: boolean
  /** Lit arrow without the feature title size (hover specimen on the sheet). */
  highlighted?: boolean
  /** false hides the tag badges (project page "Related articles"). */
  tags?: boolean
}

export function ArticleRow({
  article: a,
  variant = 'home',
  feature,
  highlighted,
  tags: showTags = true,
}: ArticleRowProps) {
  const vp = useViewport()
  const time = readTime(a)
  const tags = showTags ? a.tags.map(t => t.name) : []
  if (variant === 'list')
    return (
      <Anchor
        href={a.href}
        className="a2-arow p2-row"
        style={{alignItems: 'start'}}
      >
        <span
          className="a2-adate"
          style={
            vp === 'm'
              ? {display: 'flex', flexDirection: 'row', gap: 16}
              : {display: 'flex', flexDirection: 'column', gap: 4}
          }
        >
          <span className="a2-mono">{formatDate(a.publishedAt)}</span>
          {time && (
            <span
              className="a2-mono"
              style={{display: 'inline-flex', alignItems: 'center', gap: 8}}
            >
              <Icon name="clock" size={12} />
              {time}
            </span>
          )}
        </span>
        <span style={{minWidth: 0}}>
          <h3 className="a2-h4">{a.title}</h3>
          <p className="a2-small" style={{marginTop: 8, maxWidth: 720}}>
            {a.summary}
          </p>
          {tags.length > 0 && <BadgeList tags={tags} style={{marginTop: 16}} />}
        </span>
        <span style={{color: 'var(--a2-text-lo)', paddingTop: 2}}>
          <Icon name="arrow-right" size={18} />
        </span>
      </Anchor>
    )
  const Title = feature ? 'h3' : 'h4'
  return (
    <Anchor href={a.href} className="a2-arow">
      <span className="a2-mono a2-adate">{formatDate(a.publishedAt)}</span>
      <span style={{minWidth: 0}}>
        <Title
          className={feature ? 'a2-h3' : 'a2-h4'}
          style={feature ? {textWrap: 'balance'} : undefined}
        >
          {a.title}
        </Title>
        <p className="a2-body" style={{marginTop: 16, maxWidth: 640}}>
          {a.summary}
        </p>
        <span
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            marginTop: 16,
          }}
        >
          {tags.length > 0 && <Tags tags={tags} />}
          {time && <span className="a2-mono">{time}</span>}
        </span>
      </span>
      <span
        style={{
          alignSelf: 'start',
          marginTop: 6,
          color:
            feature || highlighted ? 'var(--a2-link)' : 'var(--a2-text-lo)',
        }}
      >
        <Icon name="arrow-right" size={18} />
      </span>
    </Anchor>
  )
}
