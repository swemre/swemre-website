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

// Article page (boards Article, 4K Article-1/2): hero with path line, reactions and meta strip;
// the body with the sticky aside (desktop), the TOC button (tablet) or nothing (mobile); "More
// from the workshop" and the FAQ.
import {useRef} from 'react'
import type {TemplateProps} from '../../contract/templates.ts'
import type {Article} from '../../contract/view.ts'
import {useArticle} from '../../data/hooks.ts'
import {Button, Icon, useViewport} from '../../design/index.tsx'
import {BlocksView, headingsOf} from '../body/index.ts'
import {ArticleCover} from '../parts/cover.tsx'
import {Glow, HeroCurve, Sec, Texture, TopGlow} from '../parts/deco.tsx'
import {Faq} from '../parts/faq.tsx'
import {fmtDate, minRead} from '../parts/format.ts'
import {ArrowLink, MetaStrip, PathLine, SectionHead} from '../parts/heads.tsx'
import {Reactions} from '../parts/reactions.tsx'
import {Helpful, PrevNext, RelatedRows} from '../parts/reading.tsx'
import {useActiveHeading, useReadProgress} from '../parts/scroll.ts'
import {PageError, PageLoading} from '../parts/states.tsx'
import {ArticleAside, ArticleTocButton} from '../parts/toc.tsx'
import {useHeroPad, usePick} from '../parts/vp.ts'
import {NotFoundTemplate} from '../not-found/index.tsx'

export function ArticleTemplate({route}: TemplateProps) {
  const slug = route.params.slug ?? ''
  const res = useArticle(slug)
  if (res.status === 'loading')
    return <PageLoading label="Loading the article" />
  if (res.status === 'error')
    return (
      <PageError
        what="The article"
        command={`GET /api/public/v2/channels/swemre-website/publications/${slug}`}
        onRetry={res.retry}
      />
    )
  if (res.status === 'empty')
    return <NotFoundTemplate route={{...route, notFoundKind: 'article'}} />
  return <ArticleView a={res.data} />
}

/** The FAQ heading: the board says "Questions about the template" for template articles. */
function faqTitle(a: Article) {
  return /template/i.test(a.title)
    ? 'Questions about the template'
    : 'Questions about this article'
}

function ArticleView({a}: {a: Article}) {
  const vp = useViewport()
  const pick = usePick()
  const big = vp === 'd' || vp === '4k'
  const toc = headingsOf(a.body)
  const active = useActiveHeading(toc.map(t => t.id))
  const articleRef = useRef<HTMLElement>(null)
  const progress = useReadProgress(articleRef)
  const pad = useHeroPad()
  const hasFaq = a.faq.length > 0
  const endRail = {
    bottom: pick({m: 48, t: 64, d: 96, k: 128}),
    node: {m: 43, t: 59, d: 90, k: 122},
  }

  const reactions = (
    <div style={{display: 'flex', gap: 8}}>
      <Reactions slug={a.slug} title={a.title} />
    </div>
  )
  const heading = (
    <>
      <PathLine
        root="articles"
        href="/articles"
        middle={a.category ? `${a.category}/` : ''}
        leaf={`${a.slug}.md`}
      />
      <h1 className="a2-d2" style={{textWrap: 'balance', maxWidth: 800}}>
        {a.title}
      </h1>
      <p
        className="a2-lead"
        style={{marginTop: pick({m: 16, t: 16, d: 24}), maxWidth: 760}}
      >
        {a.summary}
      </p>
    </>
  )
  const meta = (
    <MetaStrip
      items={[
        {
          label: 'Author',
          value: (
            <>
              {a.author.avatar ? (
                <img
                  src={a.author.avatar.url}
                  alt=""
                  width={24}
                  height={24}
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    objectFit: 'cover',
                    background: 'var(--a2-avatar-grad)',
                    border: '1px solid var(--a2-line-3)',
                  }}
                />
              ) : (
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: 'var(--a2-avatar-grad)',
                    border: '1px solid var(--a2-line-3)',
                  }}
                />
              )}
              {a.author.name}
            </>
          ),
        },
        {
          label: 'Published',
          value: <time dateTime={a.publishedAt}>{fmtDate(a.publishedAt)}</time>,
        },
        {
          label: 'Reading time',
          value: (
            <>
              <Icon
                name="clock"
                size={14}
                style={{color: 'var(--a2-text-lo)'}}
              />
              {minRead(a.readingTime)}
            </>
          ),
        },
        {
          label: 'Stack',
          value: a.tags.map(t => (
            <span key={t.slug} className="a2-badge">
              {t.name}
            </span>
          )),
        },
        {
          label: 'Updated',
          value: (
            <>
              <time dateTime={a.updatedAt}>{fmtDate(a.updatedAt)}</time>
              {a.revision !== undefined && (
                <span className="a2-mono">rev {a.revision}</span>
              )}
            </>
          ),
        },
      ]}
    />
  )

  const prose = (
    <div className="p2-prose">
      <ArticleCover article={a} />
      <BlocksView blocks={a.body} />
      <Helpful slug={a.slug} title={a.title} />
      <PrevNext prev={a.prev} next={a.next} />
    </div>
  )

  return (
    <>
      <TopGlow />
      <div style={{position: 'relative'}}>
        <Sec
          deco={{
            rail: {hue: 'blue', top: pick({m: 0, d: 144})},
            node: {top: {m: 115, t: 131, d: 166, k: 198}},
            label: 'a7c1e00',
            bg: <Texture kind="grid" hue="blue" x="16%" y="30%" />,
          }}
          style={pad}
        >
          <HeroCurve hue="blue" top={40} />
          <div className="a2-c">
            {vp === 'm' ? (
              <>
                {heading}
                <div style={{marginTop: 24}}>{reactions}</div>
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: big ? 32 : 24,
                }}
              >
                <div style={{minWidth: 0}}>{heading}</div>
                <div style={{flex: 'none'}}>{reactions}</div>
              </div>
            )}
            <div style={{marginTop: big ? 48 : 32}}>{meta}</div>
            <div className="a2-fhr" style={{marginTop: big ? 64 : 48}} />
          </div>
        </Sec>

        <Sec
          deco={{
            rail: {hue: 'blue'},
            bg: <Glow hue="blue" x="80%" y="30%" a={0.12} />,
          }}
          style={{paddingTop: 0}}
        >
          <div className="a2-c">
            {big ? (
              <div className="a2-g12">
                <aside style={{gridColumn: '1 / span 3'}}>
                  <ArticleAside
                    entries={toc}
                    active={active}
                    progress={progress}
                    minutes={a.readingTime ?? 0}
                    title={a.title}
                  />
                </aside>
                <article
                  ref={articleRef}
                  style={{
                    gridColumn: vp === '4k' ? '5 / span 6' : '5 / span 7',
                    maxWidth: 720,
                    minWidth: 0,
                  }}
                >
                  {prose}
                </article>
              </div>
            ) : vp === 't' ? (
              <div>
                {toc.length > 0 && (
                  <ArticleTocButton entries={toc} active={active} />
                )}
                <article ref={articleRef}>{prose}</article>
              </div>
            ) : (
              <article ref={articleRef}>{prose}</article>
            )}
          </div>
        </Sec>

        {a.related.length > 0 && (
          <Sec
            deco={{
              rail: {hue: 'blue', ...(hasFaq ? {} : {bottom: endRail.bottom})},
              node: hasFaq
                ? {top: {m: 53, t: 69, d: 100, k: 132}}
                : {bottom: endRail.node, end: true},
              label: 'c0ffee1',
              bg: (
                <>
                  <Glow hue="blue" x="82%" y="24%" a={0.15} />
                  <Texture kind="dots" hue="blue" x="82%" y="24%" />
                </>
              ),
            }}
          >
            <div className="a2-c">
              <SectionHead
                eyebrow="keep reading"
                title="More from the workshop"
                action={<ArrowLink to="/articles">All articles</ArrowLink>}
              />
              <RelatedRows items={a.related} />
            </div>
          </Sec>
        )}

        {hasFaq && (
          <Sec
            deco={{
              rail: {from: 'blue', hue: 'sky', bottom: endRail.bottom},
              node: {bottom: endRail.node, end: true},
              label: '0b5e55d',
              bg: (
                <>
                  <Glow hue="sky" x="78%" y="40%" a={0.15} />
                  <Texture kind="grid" hue="sky" x="78%" y="40%" />
                </>
              ),
            }}
          >
            <div className="a2-c">
              <SectionHead
                eyebrow="faq"
                title={a.faqTitle ?? faqTitle(a)}
                action={
                  <Button
                    kind="secondary"
                    label="Send me a question"
                    iconLeft="send"
                    href="/contact"
                  />
                }
              />
              <Faq items={a.faq} />
            </div>
          </Sec>
        )}
      </div>
    </>
  )
}
