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

// Newsletter status (boards Newsletter-confirmed / -unsubscribed): the token from the email link
// is confirmed or unsubscribed with C's helpers. Confirmed shows the subscription card and the
// three latest articles; unsubscribed is a full-window status page. An invalid or expired token
// shows the Single-Page-not-found layout with "This link has expired." and Subscribe again.
// /newsletter/thanks is the thank-you page after the home page's Subscribe: no token, it asks the
// reader to confirm from their inbox and shows the latest articles.
import type {ReactNode} from 'react'
import {useLocation} from 'react-router-dom'
import type {TemplateProps} from '../../contract/templates.ts'
import {useArticles, useSettings} from '../../data/hooks.ts'
import {NEWSLETTER_TOPICS} from '../../forms/specs.ts'
import {
  Anchor,
  ArticleRow,
  Button,
  Icon,
  LoadingStatus,
  Texture as MaskTexture,
  useViewport,
  type IconName,
} from '../../design/index.tsx'
import type {Subscriber} from '../../forms/index.tsx'
import {FactList} from '../body/index.ts'
import {Glow, Sec} from '../parts/deco.tsx'
import {ArrowLink} from '../parts/heads.tsx'
import {CodeMark, StatusHero, StatusLink} from '../parts/status.tsx'
import {rgb, usePick} from '../parts/vp.ts'
import {useTokenOutcome, type Kind} from './token.ts'
import {t} from '../../i18n/index.ts'

export function NewsletterStatusTemplate({route}: TemplateProps) {
  if (route.path.endsWith('thanks')) return <Thanks />
  return <TokenStatus route={route} />
}

function TokenStatus({route}: TemplateProps) {
  const kind: Kind = route.path.endsWith('unsubscribed')
    ? 'unsubscribed'
    : 'confirmed'
  const {outcome, retry} = useTokenOutcome(kind, route.params.token)
  if (!outcome) return <Working kind={kind} />
  if (!outcome.ok)
    return outcome.reason === 'expired' ? (
      <Expired path={route.path} />
    ) : (
      <Failed
        status={outcome.status}
        requestId={outcome.requestId}
        onRetry={retry}
      />
    )
  if (kind === 'confirmed' && 'email' in outcome.value)
    return <Confirmed sub={outcome.value} />
  return <Unsubscribed />
}

function Tile({
  icon,
  bg,
  color,
  glow,
}: {
  icon: IconName
  bg: string
  color: string
  glow?: string
}) {
  return (
    <div style={{height: 80, display: 'flex', alignItems: 'center'}}>
      <span
        className="a2-itile is-40"
        style={{background: bg, color, boxShadow: glow}}
        aria-hidden="true"
      >
        <Icon name={icon} size={20} />
      </span>
    </div>
  )
}

function Working({kind}: {kind: Kind}) {
  return (
    <StatusHero
      hue={kind === 'confirmed' ? 'aqua' : 'mist'}
      railLabel={kind === 'confirmed' ? 'c0nf1rm' : '0ff1ine'}
      mark={
        <Tile
          icon="spinner"
          bg="rgb(var(--a2-hue-mist-rgb) / 0.16)"
          color="var(--a2-hue-mist)"
        />
      }
      markLabel={t('footer.newsletter')}
      eyebrow={t('newsletter.eyebrow')}
      detail={
        kind === 'confirmed'
          ? t('status.detail.confirming')
          : t('status.detail.unsubscribing')
      }
      title={
        kind === 'confirmed'
          ? t('status.confirming')
          : t('status.unsubscribing')
      }
      lead={<LoadingStatus label={t('status.checking')} />}
      actions={null}
    />
  )
}

function Expired({path}: {path: string}) {
  return (
    <StatusHero
      hue="blue"
      railLabel="404p0l1"
      mark={
        <CodeMark
          code="404"
          color="var(--a2-soft)"
          glow="var(--a2-hue-blue-rgb)"
        />
      }
      markLabel={t('notFound.mark')}
      markColor="var(--a2-soft)"
      eyebrow={t('error.eyebrow', {code: 404})}
      detail={`swemre.com${path}`}
      title={t('status.expired.title')}
      lead={t('status.expired.lead')}
      actions={
        <>
          <Button
            kind="primary"
            label={t('status.subscribeAgain')}
            iconLeft="mail"
            href="/newsletter"
          />
          <StatusLink to="/">{t('nav.home')}</StatusLink>
          <StatusLink to="/articles">{t('nav.articles')}</StatusLink>
        </>
      }
    />
  )
}

function Failed({
  status,
  requestId,
  onRetry,
}: {
  status: number
  requestId?: string
  onRetry: () => void
}) {
  const code = status >= 500 ? String(status) : '500'
  return (
    <StatusHero
      hue="blue"
      railLabel="5e7e500"
      mark={
        <CodeMark
          code={code}
          color="var(--a2-err-text)"
          glow="var(--a2-err-rgb)"
        />
      }
      markLabel={t('error.mark')}
      markColor="var(--a2-err-text)"
      eyebrow={t('error.eyebrow', {code})}
      detail={requestId ? t('error.requestId', {id: requestId}) : undefined}
      title={t('status.failed.title')}
      lead={t('status.failed.lead')}
      actions={
        <>
          <Button
            kind="primary"
            label={t('form.retry')}
            iconLeft="refresh"
            onClick={onRetry}
          />
          <StatusLink to="/">{t('nav.home')}</StatusLink>
        </>
      }
    />
  )
}

function Unsubscribed() {
  return (
    <StatusHero
      hue="mist"
      railLabel="0ff1ine"
      mark={
        <Tile
          icon="mail"
          bg="rgb(var(--a2-hue-mist-rgb) / 0.16)"
          color="var(--a2-hue-mist)"
        />
      }
      markLabel={t('footer.newsletter')}
      eyebrow={t('newsletter.eyebrow')}
      detail={t('status.detail.unsubscribed')}
      title={t('status.unsubscribed.title')}
      lead={t('status.unsubscribed.lead')}
      actions={
        <>
          <Button
            kind="primary"
            label={t('status.subscribeAgain')}
            iconLeft="mail"
            href="/newsletter"
          />
          <StatusLink to="/">{t('nav.home')}</StatusLink>
          <StatusLink to="/articles">{t('nav.articles')}</StatusLink>
        </>
      }
      after={
        <p className="a2-cap" style={{marginTop: 32}}>
          {t('status.mistake.before')}
          <Anchor className="a2-ilink" href="/newsletter">
            {t('status.subscribeAgain')}
          </Anchor>
          {t('status.mistake.after')}
        </p>
      }
    />
  )
}

const firstName = (name?: string) => name?.trim().split(/\s+/)[0]

/** After Subscribe on the home page; the state carries what was sent (absent on a direct visit). */
function Thanks() {
  const sent = useLocation().state as {name?: string; email?: string} | null
  const name = firstName(sent?.name)
  return (
    <div style={{position: 'relative'}}>
      <StatusHero
        hue="aqua"
        railLabel="7hank5"
        fill={false}
        mark={
          <Tile
            icon="mail"
            bg="rgb(var(--a2-mint-rgb) / .12)"
            color="var(--a2-mint)"
            glow="0 0 24px rgb(var(--a2-mint-rgb) / calc(.25 * var(--a2-glow-k)))"
          />
        }
        markLabel={t('status.thanks.mark')}
        eyebrow={t('newsletter.eyebrow')}
        detail={t('status.detail.thanks')}
        title={
          <>
            {t('status.thanks.title')}{' '}
            <span className="a2-accent">{t('status.thanks.accent')}</span>
          </>
        }
        lead={t(name ? 'status.thanks.leadNamed' : 'status.thanks.lead', {
          name: name ?? '',
          email: sent?.email ?? t('status.thanks.inbox'),
        })}
        actions={
          <>
            <Button
              kind="primary"
              label={t('form.readLatest')}
              iconRight="arrow-right"
              href="/articles"
            />
            <StatusLink to="/">{t('nav.home')}</StatusLink>
          </>
        }
        after={
          <p className="a2-cap" style={{marginTop: 32}}>
            {t('status.noEmail.before')}
            <Anchor className="a2-ilink" href="/newsletter">
              {t('status.noEmail.link')}
            </Anchor>
            {t('status.noEmail.after')}
          </p>
        }
      />
      <LatestSec />
    </div>
  )
}

function Confirmed({sub}: {sub: Subscriber}) {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const settings = useSettings()
  const s = settings.status === 'ready' ? settings.data : undefined
  const topics = sub.topics
    .map(t => NEWSLETTER_TOPICS.find(x => x.value === t)?.label ?? t)
    .join(', ')
  const name = firstName(sub.name)
  const facts = [
    {label: t('form.email'), value: sub.email},
    ...(topics ? [{label: t('form.topics'), value: topics}] : []),
    {
      label: t('form.frequency'),
      value: s?.newsletterCadence ?? t('form.frequency.value'),
    },
    {label: t('form.sentFrom'), value: s?.contactEmail ?? 'emre@swemre.com'},
  ]
  const card = (
    <div
      className="a2-card"
      style={{
        borderColor: rgb('aqua', 0.16),
        boxShadow: `var(--a2-shadow-card),0 0 120px -20px ${rgb('aqua', 'calc(0.12 * var(--a2-glow-k))')}`,
        marginTop: big ? 64 : 48,
        maxWidth: 640,
      }}
    >
      <FactList facts={facts} />
    </div>
  )
  return (
    <div style={{position: 'relative'}}>
      <StatusHero
        hue="aqua"
        railLabel="c0nf1rm"
        fill={false}
        mark={
          <Tile
            icon="check-circle"
            bg="rgb(var(--a2-mint-rgb) / .12)"
            color="var(--a2-mint)"
            glow="0 0 24px rgb(var(--a2-mint-rgb) / calc(.25 * var(--a2-glow-k)))"
          />
        }
        markLabel={t('status.confirmed.mark')}
        eyebrow={t('newsletter.eyebrow')}
        detail={t('status.detail.confirmed')}
        title={
          <>
            {t('status.confirmed.title')}{' '}
            <span className="a2-accent">{t('status.confirmed.accent')}</span>
          </>
        }
        lead={`${name ? t('status.confirmed.thanks', {name}) : ''}${t('status.confirmed.lead')}`}
        actions={
          <>
            <Button
              kind="primary"
              label={t('form.readLatest')}
              iconRight="arrow-right"
              href="/articles"
            />
            <StatusLink to="/">{t('nav.home')}</StatusLink>
          </>
        }
        after={card}
      />
      <LatestSec />
    </div>
  )
}

/** "While you wait for the next one": the three latest articles under the status hero. */
function LatestSec() {
  const vp = useViewport()
  const pick = usePick()
  const big = vp === 'd' || vp === '4k'
  const nodeTop = {m: 73, t: 89, d: 120, k: 152}
  return (
    <Sec
      deco={{
        rail: {
          from: 'aqua',
          hue: 'blue',
          height: pick(nodeTop) + (big ? 6 : 5),
        },
        node: {top: nodeTop, end: true},
        label: 'c0ffee1',
        bg: (
          <>
            <Glow hue="blue" x="16%" y="40%" a={0.15} />
            <Glow hue="blue" x="78%" y="20%" a={0.075} size="sm" />
            <MaskTexture
              kind="dots"
              hue="blue"
              mask={`${pick({m: '300px 260px', t: '480px 400px', d: '600px 480px', k: '720px 560px'})} at 16% 40%`}
            />
          </>
        ),
      }}
    >
      <div className="a2-c">
        <Latest />
      </div>
    </Sec>
  )
}

function Latest() {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const res = useArticles({limit: 3})
  const items = res.status === 'ready' ? res.data : []
  const left: ReactNode = (
    <div style={{display: 'flex', flexDirection: 'column', gap: big ? 32 : 24}}>
      <div>
        <span className="a2-eyebrow">{`// ${t('status.latest.eyebrow')}`}</span>
        <h2 className="a2-h2" style={{marginTop: 16}}>
          {t('status.latest.title')}
        </h2>
      </div>
      <p className="a2-body">{t('status.latest.copy')}</p>
      <div>
        <ArrowLink to="/articles">{t('nav.allArticles')}</ArrowLink>
      </div>
    </div>
  )
  const rows = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: vp === 'm' ? 40 : big ? 64 : 48,
      }}
    >
      {items.map((a, i) => (
        <ArticleRow key={a.slug} article={a} variant="home" feature={i === 0} />
      ))}
    </div>
  )
  if (!big)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: vp === 'm' ? 48 : 64,
        }}
      >
        {left}
        {rows}
      </div>
    )
  return (
    <div className="a2-g12" style={{alignItems: 'start'}}>
      <div style={{gridColumn: '1 / span 4', minWidth: 0}}>{left}</div>
      <div style={{gridColumn: '6 / span 7', minWidth: 0}}>{rows}</div>
    </div>
  )
}
