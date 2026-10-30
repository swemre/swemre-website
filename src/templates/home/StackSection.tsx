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

// "// my stack": who I build with, the eight tools and the stack log ticker.
import type {Hue, SiteSettings} from '../../contract/view.ts'
import {useAuthor} from '../../data/hooks.ts'
import {useViewport} from '../../design/index.tsx'
import {Prompt, Split} from './kit/layout.tsx'
import {Rail} from './kit/Rail.tsx'
import {SectionBg} from './kit/SectionBg.tsx'
import {Anchor, Icon, type IconName} from './kit/ui.ts'
import {useV} from './kit/vp.ts'
import {t} from '../../i18n/index.ts'

const STACK: {
  name: string
  line: string
  key: string
  hash: string
  hue: Hue
}[] = [
  {
    name: 'Claude Code',
    line: t('home.stack.claude'),
    key: 'claude',
    hash: '9c1a7e2',
    hue: 'sky',
  },
  {
    name: 'Java 25',
    line: t('home.stack.java'),
    key: 'java',
    hash: '0b5e55d',
    hue: 'blue',
  },
  {
    name: 'Spring Boot 4',
    line: t('home.stack.springboot'),
    key: 'spring-boot',
    hash: '3f2d81a',
    hue: 'peri',
  },
  {
    name: 'PostgreSQL',
    line: t('home.stack.postgresql'),
    key: 'postgresql',
    hash: '7e44c09',
    hue: 'lilac',
  },
  {
    name: 'React',
    line: t('home.stack.react'),
    key: 'react',
    hash: 'a1d3f5b',
    hue: 'mist',
  },
  {
    name: 'TypeScript',
    line: t('home.stack.typescript'),
    key: 'typescript',
    hash: '5c0de42',
    hue: 'aqua',
  },
  {
    name: 'Docker',
    line: t('home.stack.docker'),
    key: 'docker',
    hash: 'd0c4e11',
    hue: 'sky',
  },
  {
    name: 'Traefik',
    line: t('home.stack.traefik'),
    key: 'traefik',
    hash: 'e7af1c3',
    hue: 'blue',
  },
]

function LinkCard({
  icon,
  label,
  handle,
  href,
}: {
  icon: IconName
  label: string
  handle: string
  href: string
}) {
  return (
    <Anchor className="a2-linkcard" href={href} external>
      <span className="a2-itile">
        <Icon name={icon} size={16} />
      </span>
      <span>{label}</span>
      <span
        className="a2-mono"
        style={{fontSize: 12, color: 'rgb(var(--a2-hue-sky-rgb) / 0.85)'}}
      >
        {handle}
      </span>
      <span
        style={{
          marginLeft: 'auto',
          display: 'inline-flex',
          color: 'var(--a2-hue-sky)',
        }}
      >
        <Icon name="arrow-up-right" size={14} />
      </span>
    </Anchor>
  )
}

function Intro({settings}: {settings?: SiteSettings}) {
  const v = useV()
  const author = useAuthor('emre')
  const avatar = author.status === 'ready' ? author.data.avatar : undefined
  return (
    <>
      <Prompt command="ls ~/stack" />
      <span className="a2-eyebrow" style={{marginTop: 16}}>
        {`// ${t('home.stack.eyebrow')}`}
      </span>
      <h2
        id="home-stack"
        className="a2-h2"
        style={{marginTop: 16, textWrap: 'balance'}}
      >
        {t('home.stack.title')}
      </h2>
      <div style={{marginTop: v(24, 24, 32)}}>
        <p style={{display: 'flex', alignItems: 'center', gap: 16}}>
          {avatar ? (
            <img
              src={avatar.url}
              alt=""
              width={32}
              height={32}
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
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
                width: 32,
                height: 32,
                borderRadius: 999,
                background: 'var(--a2-avatar-grad)',
                border: '1px solid var(--a2-line-3)',
              }}
            />
          )}
          <span className="a2-small">{t('home.stack.me')}</span>
        </p>
      </div>
      <div
        style={{
          marginTop: v(24, 24, 32),
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: v<string | number>('none', 360, 360),
        }}
      >
        <LinkCard
          icon="github"
          label="GitHub"
          handle="swemre"
          href={settings?.social.github ?? 'https://github.com/swemre'}
        />
        <LinkCard
          icon="youtube"
          label="YouTube"
          handle="@swemrews"
          href={settings?.social.youtube ?? 'https://www.youtube.com/@swemrews'}
        />
      </div>
    </>
  )
}

function StackList() {
  const v = useV()
  return (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${v(2, 4, 4)},minmax(0,1fr))`,
        columnGap: v(16, 24, 32),
        rowGap: v(32, 32, 48),
      }}
    >
      {STACK.map(s => (
        <li
          key={s.name}
          style={{display: 'flex', flexDirection: 'column', gap: 8}}
        >
          <span className="a2-h4">{s.name}</span>
          <span className="a2-small">{s.line}</span>
        </li>
      ))}
    </ul>
  )
}

const hashColor = (hue: Hue) => `rgb(var(--a2-hue-${hue}-rgb) / 0.75)`

/** The stack log: an endless ticker on tablet and up, three static lines on mobile. */
function StackLog() {
  const vp = useViewport()
  const v = useV()
  if (vp === 'm') {
    const fade = 'linear-gradient(90deg,#000 70%,transparent)'
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 8}}
        aria-label={t('home.stack.log')}
      >
        <p className="a2-mono">
          <span className="a2-mint">$</span> stream-status sprint-97XFQ{' '}
          <span
            className="a2-blink"
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 8,
              height: 14,
              verticalAlign: -2,
              background: 'var(--a2-text-lo)',
            }}
          />
        </p>
        {STACK.slice(0, 3).map(s => (
          <p
            key={s.key}
            className="a2-mono"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              WebkitMaskImage: fade,
              maskImage: fade,
            }}
          >
            <span style={{color: hashColor(s.hue)}}>{s.hash}</span> {s.key}:{' '}
            <span className="a2-txt">{s.line}</span>
          </p>
        ))}
      </div>
    )
  }
  const [l, r] = v([0, 0], [96, 120], [160, 200], [200, 240])
  const mask = `linear-gradient(90deg,transparent 0,#000 ${l}px,#000 calc(100% - ${r}px),transparent 100%)`
  const items = [...STACK, ...STACK]
  return (
    <div style={{position: 'relative', paddingTop: 16}}>
      <div
        className="a2-fhr"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          background: 'var(--a2-ticker-bg)',
        }}
      />
      <div
        aria-label={t('home.stack.log')}
        className="a2-mono"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 20,
          overflow: 'hidden',
          fontSize: 12,
        }}
      >
        <span style={{flex: 'none', paddingRight: 16}}>
          <span className="a2-mint">$</span>{' '}
          {vp === 't'
            ? 'stream-status sprint-97XFQ'
            : 'stream-status:agent-pipeline:sprint-97XFQ'}
        </span>
        <div
          style={{
            flexGrow: 1,
            overflow: 'hidden',
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              whiteSpace: 'nowrap',
              paddingLeft: 48,
              opacity: 0.85,
              animation: 'a2-tick 90s linear infinite',
            }}
          >
            {items.map((s, i) => (
              <span
                key={i}
                aria-hidden={i >= STACK.length || undefined}
                style={{display: 'inline-flex', gap: 16, paddingRight: 48}}
              >
                <span style={{color: hashColor(s.hue)}}>{s.hash}</span>
                <span className="a2-mid">{s.key}:</span>
                <span>{s.line}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function StackSection({settings}: {settings?: SiteSettings}) {
  const v = useV()
  return (
    <section className="a2-sec" data-cut aria-labelledby="home-stack">
      <SectionBg hue="sky" at={[20, 56]} texture="grid" />
      <Rail
        from="blue"
        to="sky"
        node={[53, 69, 100, 132]}
        label="0b5e55d"
        hook
      />
      <div className="a2-c">
        <Split
          spans={[1, 4, 6, 7]}
          left={<Intro settings={settings} />}
          right={<StackList />}
        />
        <div style={{marginTop: v(48, 48, 64, 96)}}>
          <StackLog />
        </div>
      </div>
    </section>
  )
}
