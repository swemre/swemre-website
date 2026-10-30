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
      markLabel="Newsletter"
      eyebrow="newsletter"
      detail={kind === 'confirmed' ? 'confirming' : 'unsubscribing'}
      title={
        kind === 'confirmed' ? 'Confirming your address…' : 'Unsubscribing…'
      }
      lead={<LoadingStatus label="Checking the link from your email" />}
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
      markLabel="Not found"
      markColor="var(--a2-soft)"
      eyebrow="error 404"
      detail={`swemre.com${path}`}
      title="This link has expired."
      lead="Newsletter links work once and stop working after a while. Subscribe again to get a fresh one."
      actions={
        <>
          <Button
            kind="primary"
            label="Subscribe again"
            iconLeft="mail"
            href="/newsletter"
          />
          <StatusLink to="/">Home</StatusLink>
          <StatusLink to="/articles">Articles</StatusLink>
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
      markLabel="Server error"
      markColor="var(--a2-err-text)"
      eyebrow={`error ${code}`}
      detail={requestId ? `request id ${requestId}` : undefined}
      title="That did not go through."
      lead="The server did not answer. Your link still works; try again in a moment."
      actions={
        <>
          <Button
            kind="primary"
            label="Try again"
            iconLeft="refresh"
            onClick={onRetry}
          />
          <StatusLink to="/">Home</StatusLink>
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
      markLabel="Newsletter"
      eyebrow="newsletter"
      detail="unsubscribed"
      title="You are unsubscribed."
      lead="You will not get any more emails from swemre.com. Changed your mind? You can subscribe again any time."
      actions={
        <>
          <Button
            kind="primary"
            label="Subscribe again"
            iconLeft="mail"
            href="/newsletter"
          />
          <StatusLink to="/">Home</StatusLink>
          <StatusLink to="/articles">Articles</StatusLink>
        </>
      }
      after={
        <p className="a2-cap" style={{marginTop: 32}}>
          Unsubscribed by mistake?{' '}
          <a className="a2-ilink" href="/newsletter">
            Subscribe again
          </a>{' '}
          puts you back with one click, no form needed.
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
        markLabel="Thank you"
        eyebrow="newsletter"
        detail="thanks"
        title={
          <>
            Thanks for <span className="a2-accent">subscribing.</span>
          </>
        }
        lead={`${name ? `${name}, one` : 'One'} last step: I sent a confirmation link to ${sent?.email ?? 'your inbox'}. Click it and the next letter is on its way.`}
        actions={
          <>
            <Button
              kind="primary"
              label="Read the latest articles"
              iconRight="arrow-right"
              href="/articles"
            />
            <StatusLink to="/">Home</StatusLink>
          </>
        }
        after={
          <p className="a2-cap" style={{marginTop: 32}}>
            No email after a few minutes? Check your spam folder, or{' '}
            <a className="a2-ilink" href="/newsletter">
              subscribe again
            </a>
            .
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
    {label: 'Email', value: sub.email},
    ...(topics ? [{label: 'Topics', value: topics}] : []),
    {
      label: 'Frequency',
      value: s?.newsletterCadence ?? 'At most twice a month',
    },
    {label: 'Sent from', value: s?.contactEmail ?? 'emre@swemre.com'},
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
        markLabel="Confirmed"
        eyebrow="newsletter"
        detail="confirmed"
        title={
          <>
            You’re <span className="a2-accent">subscribed.</span>
          </>
        }
        lead={`${name ? `Thanks, ${name}. ` : ''}Your address is confirmed. The next letter goes out when a new article is ready, and every one has a one-click unsubscribe.`}
        actions={
          <>
            <Button
              kind="primary"
              label="Read the latest articles"
              iconRight="arrow-right"
              href="/articles"
            />
            <StatusLink to="/">Home</StatusLink>
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
        <span className="a2-eyebrow">{'// latest'}</span>
        <h2 className="a2-h2" style={{marginTop: 16}}>
          While you wait for the next one
        </h2>
      </div>
      <p className="a2-body">The three most recent articles, newest first.</p>
      <div>
        <ArrowLink to="/articles">All articles</ArrowLink>
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
