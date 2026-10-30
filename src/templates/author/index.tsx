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

// Author page (boards Author, 4K Author; route /authors/emre): the name hero with the call back
// button, the numbered facts (focus, background, availability, stack, currently building,
// writing) and "Articles by Emre", newest first.
import type {MouseEvent} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import type {TemplateProps} from '../../contract/templates.ts'
import type {
  ArticleSummary,
  Author,
  Link as LinkItem,
} from '../../contract/view.ts'
import {useArticles, useAuthor, useTerms} from '../../data/hooks.ts'
import {
  Button,
  Chip,
  Icon,
  Texture as MaskTexture,
  useViewport,
  type IconName,
} from '../../design/index.tsx'
import {Prompt, badgeHue} from '../body/index.ts'
import {Glow, HeroCurve, Sec} from '../parts/deco.tsx'
import {fmtDate, minRead} from '../parts/format.ts'
import {PageError, PageLoading} from '../parts/states.tsx'
import {rgb, usePick} from '../parts/vp.ts'
import {NotFoundTemplate} from '../not-found/index.tsx'
import {t} from '../../i18n/index.ts'

const SHOWN = 4

export function AuthorTemplate({route}: TemplateProps) {
  const slug = route.params.slug ?? ''
  const res = useAuthor(slug)
  if (res.status === 'loading')
    return <PageLoading label={t('state.loading.author')} />
  if (res.status === 'error')
    return (
      <PageError
        what={t('state.what.author')}
        command={`GET /api/public/v2/channels/swemre-website/publications/${slug}`}
        onRetry={res.retry}
      />
    )
  if (res.status === 'empty') return <NotFoundTemplate route={route} />
  return <AuthorView a={res.data} slug={slug} />
}

function linkIcon(l: LinkItem): IconName {
  const s = `${l.label} ${l.href}`.toLowerCase()
  if (s.includes('github')) return 'github'
  if (s.includes('linkedin')) return 'linkedin'
  if (s.includes('rss')) return 'rss'
  if (s.includes('youtube')) return 'youtube'
  return 'external'
}

function ProfileLink({l}: {l: LinkItem}) {
  const inner = (
    <>
      <Icon name={linkIcon(l)} size={16} style={{color: 'var(--a2-soft)'}} />
      <span className="a2-ulink">{l.label}</span>
      <Icon
        name="arrow-up-right"
        size={14}
        style={{color: 'var(--a2-text-lo)'}}
      />
    </>
  )
  return l.external ? (
    <a
      className="a2-link"
      href={l.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{color: 'var(--a2-text-hi)'}}
    >
      {inner}
    </a>
  ) : (
    <a className="a2-link" href={l.href} style={{color: 'var(--a2-text-hi)'}}>
      {inner}
    </a>
  )
}

function Num({n}: {n: number}) {
  return <span className="a2-soft">{String(n).padStart(2, '0')}</span>
}

function Label({n, children}: {n: number; children: string}) {
  return (
    <span className="a2-micro">
      <Num n={n} />
      {'  '}
      {children}
    </span>
  )
}

function AuthorView({a, slug}: {a: Author; slug: string}) {
  const vp = useViewport()
  const pick = usePick()
  const big = vp === 'd' || vp === '4k'
  const articles = useArticles()
  const terms = useTerms()
  // One author writes every article on this site, so the list is the archive, newest first.
  const mine = articles.status === 'ready' ? articles.data : []
  const topics = terms.status === 'ready' ? terms.data : []
  const latest = mine[0]
  const gap = big ? 32 : 24

  // Hero ----------------------------------------------------------------------------------------
  const cta = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'stretch',
        width: vp === 'm' ? undefined : 368,
      }}
    >
      <Button
        kind="primary"
        block
        label={t('menu.callBack')}
        iconLeft="phone"
        href="/call-back"
      />
      <span className="a2-mono" style={{fontSize: 12}}>
        {t('author.cta.before')}
        <Link
          className="a2-mono a2-soft"
          to="/contact"
          style={{whiteSpace: 'nowrap'}}
        >
          {t('author.cta.link')}
        </Link>
        {t('author.cta.after')}
      </span>
    </div>
  )
  const intro = (
    <div>
      {a.headline && (
        <h2 className="a2-h2" style={{maxWidth: 720, textWrap: 'balance'}}>
          {a.headline}
        </h2>
      )}
      {a.links.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px 24px',
            marginTop: gap,
          }}
        >
          {a.links.map(l => (
            <ProfileLink key={l.href} l={l} />
          ))}
        </div>
      )}
    </div>
  )

  // Facts ---------------------------------------------------------------------------------------
  const cellPad = (first: boolean) =>
    big
      ? first
        ? '24px 32px 32px 0px'
        : '24px 32px 32px 32px'
      : vp === 't'
        ? '24px 24px 24px 0px'
        : '24px 16px 24px 0px'
  const cells = [
    a.focus && (
      <div
        key="focus"
        style={{
          padding: cellPad(true),
          display: 'flex',
          flexDirection: 'column',
          ...(vp === 't' ? {gridColumn: '1 / -1'} : {}),
        }}
      >
        <Label n={1}>{t('author.focus')}</Label>
        <div style={{marginTop: gap}}>
          <h2 className="a2-h2" style={{textWrap: 'balance', maxWidth: 520}}>
            {a.focus}
          </h2>
        </div>
      </div>
    ),
    (a.writingSince || a.backgroundNote) && (
      <div
        key="bg"
        style={{
          ...(big
            ? {borderLeft: '1px solid var(--a2-line-2)'}
            : {borderTop: '1px solid var(--a2-line)'}),
          padding: cellPad(false),
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Label n={2}>{t('form.group.background')}</Label>
        <div style={{marginTop: gap}}>
          {a.writingSince && (
            <h3 className="a2-h4">
              {t('author.since', {year: a.writingSince})}
            </h3>
          )}
          {a.backgroundNote && (
            <p className="a2-small" style={{marginTop: 8}}>
              {a.backgroundNote}
            </p>
          )}
        </div>
      </div>
    ),
    a.availability && (
      <div
        key="av"
        style={{
          ...(vp === 'm' ? {} : {borderLeft: '1px solid var(--a2-line-2)'}),
          ...(big ? {} : {borderTop: '1px solid var(--a2-line)'}),
          padding: vp === 't' ? 24 : cellPad(false),
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Label n={3}>{t('author.availability')}</Label>
        <div style={{marginTop: gap}}>
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 16,
              lineHeight: '24px',
              fontWeight: 600,
              color: 'var(--a2-text-hi)',
            }}
          >
            <span
              className="a2-dot a2-blink"
              style={{
                width: 8,
                height: 8,
                color: 'var(--a2-mint)',
                boxShadow: '0 0 0 4px rgb(var(--a2-mint-rgb) / .16)',
              }}
            />
            {a.availability}
          </p>
          {a.availableFrom && (
            <p className="a2-small" style={{marginTop: 8}}>
              {a.availableFrom}
            </p>
          )}
        </div>
      </div>
    ),
  ]
  const row = (n: number, label: string, body: React.ReactNode) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: vp === 'm' ? '1fr' : '4fr 8fr',
        columnGap: pick({m: 16, t: 24, d: 32}),
        rowGap: 8,
        alignItems: 'center',
        padding: `${big ? 32 : 24}px 0`,
        borderTop: '1px solid var(--a2-line)',
      }}
    >
      <Label n={n}>{label}</Label>
      <div>{body}</div>
    </div>
  )
  const project = a.currentProject

  return (
    <div style={{position: 'relative'}}>
      <Sec
        deco={{
          rail: {hue: 'blue', top: pick({m: 0, d: 104})},
          node: {top: {m: 175, t: 191, d: 230, k: 262}},
          label: 'a7h0r01',
          backdrop: <HeroBackdrop />,
        }}
        style={{
          paddingTop: pick({m: 112, t: 128, d: 160, k: 192}),
          paddingBottom: pick({m: 48, t: 64, d: 96, k: 128}),
        }}
      >
        <HeroCurve hue="blue" top={0} />
        <div className="a2-c">
          <span className="a2-eyebrow">
            {'// swemre.com/authors/'}
            <span className="a2-hi">{slug}</span>
          </span>
          <div style={{marginTop: gap}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <span style={{display: 'inline-grid', borderRadius: 999}}>
                {a.avatar ? (
                  <img
                    src={a.avatar.url}
                    alt={a.name}
                    width={48}
                    height={48}
                    style={{
                      flexShrink: 0,
                      width: 48,
                      height: 48,
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
                      width: 48,
                      height: 48,
                      borderRadius: 999,
                      background: 'var(--a2-avatar-grad)',
                      border: '1px solid var(--a2-line-3)',
                    }}
                  />
                )}
              </span>
              {a.role && (
                <span
                  className="a2-micro"
                  style={{letterSpacing: '.24em', color: 'var(--a2-text)'}}
                >
                  {a.role}
                </span>
              )}
            </div>
            <div className="a2-fhr" style={{margin: `${gap}px 0`}} />
            <h1 className="a2-d1">
              {a.name}
              <span style={{color: 'var(--a2-pale)'}}>.</span>
            </h1>
            <div className="a2-fhr" style={{margin: `${gap}px 0`}} />
            {big ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: 64,
                }}
              >
                {intro}
                {cta}
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 48}}>
                {intro}
                {cta}
              </div>
            )}
          </div>
        </div>
      </Sec>

      <Sec
        deco={{
          rail: {from: 'blue', hue: 'sky'},
          node: {top: {m: 75, t: 91, d: 122, k: 154}},
          label: '5ca1ab1',
          bg: (
            <>
              <Glow hue="sky" x="84%" y="50%" a={0.15} />
              <MaskTexture
                kind="grid"
                hue="sky"
                mask={`${pick({m: '300px 260px', t: '480px 400px', d: '600px 480px', k: '720px 560px'})} at 84% 50%`}
              />
            </>
          ),
        }}
      >
        <div className="a2-c">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: big
                ? '6fr 3fr 3fr'
                : vp === 't'
                  ? '1fr 1fr'
                  : '1fr',
              borderTop: '2px solid var(--a2-rule-bold)',
            }}
          >
            {cells}
          </div>
          {a.stack.length > 0 &&
            row(
              4,
              t('projects.stack'),
              <div className="a2-chips" style={{gap: 8}}>
                {a.stack.map(t => (
                  <Chip key={t.slug} label={t.name} href={t.href} />
                ))}
              </div>,
            )}
          {project &&
            row(
              5,
              t('author.building'),
              <>
                <Link
                  to={project.href}
                  className="a2-h3"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    textDecoration: 'underline',
                    textDecorationColor: 'var(--a2-blue)',
                    textUnderlineOffset: 8,
                    textDecorationThickness: 2,
                  }}
                >
                  {project.title}
                  <Icon name="arrow-up-right" size={20} />
                </Link>
                <p className="a2-small" style={{marginTop: 8}}>
                  {firstClause(project.summary)}
                </p>
              </>,
            )}
          {row(
            6,
            t('author.writing'),
            <>
              <p className="a2-cap">
                <b className="a2-hi" style={{fontWeight: 600}}>
                  {mine.length}
                </b>{' '}
                {t('author.articles', {count: mine.length})} ·{' '}
                <b className="a2-hi" style={{fontWeight: 600}}>
                  {topics.length}
                </b>{' '}
                {t('author.topics', {count: topics.length})}
                {latest && (
                  <>
                    {' '}
                    · {t('author.latest')}{' '}
                    <span className="a2-mono a2-hi">
                      {fmtDate(latest.publishedAt)}
                    </span>
                  </>
                )}
              </p>
              {topics.length > 0 && (
                <div className="a2-chips" style={{gap: 8, marginTop: 16}}>
                  {topics.slice(0, 5).map(t => (
                    <Chip
                      key={t.slug}
                      label={t.name}
                      count={t.count}
                      href={t.href}
                    />
                  ))}
                </div>
              )}
            </>,
          )}
          <div className="a2-hr" />
        </div>
      </Sec>

      <Sec
        deco={{
          rail: {from: 'sky', hue: 'blue'},
          node: {top: {m: 97, t: 113, d: 144, k: 176}, end: true},
          label: 'c0ffee1',
          bg: (
            <>
              <Glow hue="blue" x="12%" y="420px" a={0.15} />
              <Glow hue="blue" x="84%" y="70%" a={0.075} size="sm" />
              <MaskTexture
                kind="dots"
                hue="blue"
                mask={`${pick({m: '300px 260px', t: '480px 400px', d: '600px 480px', k: '720px 560px'})} at 12% 420px`}
              />
            </>
          ),
        }}
      >
        <div className="a2-c">
          <Writing name={a.name} slug={slug} items={mine} />
        </div>
      </Sec>
    </div>
  )
}

const BACKDROP = {
  m: {
    g1: ['10%', -260, 320, 360],
    g2: ['56.4%', 260, 260, 300],
    arc: [500, 520],
    mask: 720,
  },
  t: {
    g1: ['18.8%', -320, 520, 480],
    g2: ['60%', 180, 420, 400],
    arc: [600, 700],
    mask: 780,
  },
  d: {
    g1: ['27.8%', -400, 640, 560],
    g2: ['62%', 140, 560, 460],
    arc: [720, 820],
    mask: 860,
  },
  '4k': {
    g1: ['31.8%', -420, 700, 600],
    g2: ['62%', 140, 620, 500],
    arc: [720, 900],
    mask: 860,
  },
} as const

/** The author hero wash: hero gradient, two blurred glows, the arc light and the grid. */
function HeroBackdrop() {
  const vp = useViewport()
  const b = BACKDROP[vp]
  const glow = (
    [left, top, width, height]: readonly [string, number, number, number],
    bg: string,
  ) => (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        borderRadius: 999,
        background: bg,
        filter: 'blur(120px)',
      }}
    />
  )
  const mask = `linear-gradient(to bottom,#000 0,#000 ${b.mask}px,transparent 100%)`
  const grid = 'linear-gradient(to bottom,#000 54px,transparent 580px)'
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: -400,
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
      {glow(b.g1, 'var(--a2-hero-glow-1)')}
      {glow(b.g2, 'var(--a2-hero-glow-2)')}
      <div
        style={{
          position: 'absolute',
          left: -20,
          top: b.arc[0],
          width: 'calc(100% + 40px)',
          height: b.arc[1],
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
          WebkitMaskImage: grid,
          maskImage: grid,
        }}
      />
    </div>
  )
}

/** "The content management system behind swemre.com: workspaces, ..." -> up to the colon. */
function firstClause(s: string) {
  const i = s.indexOf(':')
  return i > 0 ? `${s.slice(0, i)}.` : s
}

function Writing({
  name,
  slug,
  items,
}: {
  name: string
  slug: string
  items: ArticleSummary[]
}) {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const shown = items.slice(0, SHOWN)
  const count = t('author.count', {shown: shown.length, count: items.length})
  const head = (
    <div>
      <span className="a2-eyebrow" style={{marginBottom: 16}}>
        {`// ${t('mega.articles.eyebrow')}`}
      </span>
      <h2 className="a2-d2">{t('author.articlesBy', {name})}</h2>
      <div
        style={{
          marginTop: big ? 24 : 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Prompt command={`swemre-client page:article --author=${slug}`} />
        <span className="a2-mono">{count}</span>
      </div>
    </div>
  )
  return (
    <>
      {vp === 'm' ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
          {head}
          <span className="a2-cap">{t('articles.sort.newest')}</span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: big ? 32 : 24,
          }}
        >
          {head}
          <span className="a2-cap">{t('articles.sort.newest')}</span>
        </div>
      )}
      <div
        style={{
          marginTop: big ? 64 : 48,
          borderTop: '2px solid var(--a2-rule-bold)',
        }}
      >
        {shown.map((it, i) => (
          <WritingRow key={it.slug} a={it} index={i} />
        ))}
      </div>
      <div
        style={{
          borderTop: '2px solid var(--a2-rule-bold)',
          display: 'flex',
          ...(vp === 'm'
            ? {
                flexDirection: 'column',
                gap: 16,
                alignItems: 'stretch',
                marginTop: 24,
              }
            : {
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 32,
              }),
        }}
      >
        <span className="a2-mono">{t('author.showing', {count})}</span>
        <div
          style={{
            display: 'flex',
            alignItems: vp === 'm' ? 'stretch' : 'center',
            gap: 16,
            flexDirection: vp === 'm' ? 'column' : 'row',
          }}
        >
          <Button
            kind="ghost"
            label={t('footer.rss')}
            iconLeft="rss"
            href="/rss.xml"
          />
          <Button
            kind="secondary"
            label={t('author.archive')}
            iconRight="arrow-right"
            href="/articles"
            block={vp === 'm'}
          />
        </div>
      </div>
    </>
  )
}

const CONTAINER = {t: 48, d: 96, '4k': 256} as const
const RAIL = {t: 16, d: 48, '4k': 55} as const

function WritingRow({a, index}: {a: ArticleSummary; index: number}) {
  const vp = useViewport()
  const navigate = useNavigate()
  const big = vp === 'd' || vp === '4k'
  const first = index === 0
  const hue = a.hue
  // The whole row opens the article; links and buttons inside keep their own target.
  const open = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a,button')) return
    void navigate(a.href)
  }
  const num = (
    <span
      aria-hidden="true"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: vp === 'm' ? 30 : vp === 't' ? 36 : 40,
        lineHeight: '48px',
        fontWeight: 600,
        letterSpacing: '-.04em',
      }}
    >
      <span style={{color: 'var(--a2-text-dim)'}}>0x</span>
      <span
        style={{
          color: `var(--a2-hue-${hue})`,
          textShadow: `0 0 32px ${rgb(hue, 'calc(0.3 * var(--a2-glow-text-k))')}`,
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
    </span>
  )
  const text = (
    <>
      <h3 className="a2-h4">
        <Link to={a.href}>{a.title}</Link>
      </h3>
      <p className="a2-body" style={{marginTop: 16, maxWidth: 640}}>
        {a.summary}
      </p>
      {a.tags.length > 0 && (
        <div className="a2-chips" style={{gap: 8, marginTop: 16}}>
          {a.tags.map(t => (
            <Chip key={t.slug} label={t.name} href={t.href} />
          ))}
        </div>
      )}
    </>
  )
  const meta = (
    <span
      style={{
        display: 'flex',
        flexDirection: big ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: '8px 16px',
        alignItems: 'flex-start',
      }}
    >
      {first && (
        <span className="a2-badge" style={badgeHue('blue')}>
          latest
        </span>
      )}
      <span className="a2-mono">{fmtDate(a.publishedAt)}</span>
      {a.readingTime ? (
        <span
          className="a2-mono"
          style={{display: 'inline-flex', alignItems: 'center', gap: 8}}
        >
          <Icon name="clock" size={13} />
          {minRead(a.readingTime)}
        </span>
      ) : null}
    </span>
  )
  const rowStyle = {
    position: 'relative' as const,
    borderTop: '1px solid var(--a2-line)',
    cursor: 'pointer',
  }
  if (vp === 'm')
    return (
      <div
        onClick={open}
        style={{
          ...rowStyle,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '40px 0',
        }}
      >
        {num}
        <div>{text}</div>
        {meta}
      </div>
    )
  const node = (
    <span
      className="a2-node"
      aria-hidden="true"
      style={{
        left: RAIL[vp] - CONTAINER[vp] - (vp === 't' ? 5.25 : 6.25),
        top: '50%',
        marginTop: vp === 't' ? -5 : -6,
        ...(first
          ? {
              background: 'var(--a2-soft)',
              boxShadow: `0 0 0 2px var(--a2-soft),0 0 22px ${rgb('blue', 'calc(0.55 * var(--a2-node-glow-k))')}`,
            }
          : {
              boxShadow: `0 0 0 2px var(--a2-soft),0 0 14px ${rgb('blue', 'calc(0.4 * var(--a2-node-glow-k))')}`,
            }),
      }}
    />
  )
  const go = (
    <div style={{paddingTop: 4}}>
      <Button
        kind="secondary"
        iconOnly
        label={t('author.readTitle', {title: a.title})}
        iconLeft="arrow-right"
        href={a.href}
      />
    </div>
  )
  return (
    <div
      onClick={open}
      style={{
        ...rowStyle,
        display: 'grid',
        gridTemplateColumns: big
          ? '152px minmax(0,1fr) 176px 48px'
          : '152px minmax(0,1fr) 48px',
        columnGap: big ? 32 : 24,
        alignItems: 'start',
        padding: `${big ? 64 : 48}px 0`,
      }}
    >
      {node}
      {num}
      <div style={{minWidth: 0, paddingTop: 8}}>
        {text}
        {!big && <div style={{marginTop: 16}}>{meta}</div>}
      </div>
      {big && <div style={{paddingTop: 8}}>{meta}</div>}
      {go}
    </div>
  )
}
