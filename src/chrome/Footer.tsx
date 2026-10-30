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

// Footer (V4-Comp-Footer): logo, tagline and socials, the Explore / Contact / Site columns and
// the bar. Desktop and 4K: lead on columns 1-4, links on 7-12. Tablet: three columns and a
// one-row bar. Mobile: two-column links and a stacked bar with "swemre.com".
import type {ReactNode} from 'react'
import {Anchor, Icon, useViewport, type IconName} from '../design/index.tsx'
import type {FooterData, SiteSettings} from '../contract/view.ts'

function Socials({social}: {social: SiteSettings['social']}) {
  const items: [string, string | undefined, IconName][] = [
    ['github', social.github, 'github'],
    ['youtube', social.youtube, 'youtube'],
    ['linkedin', social.linkedin, 'linkedin'],
    ['rss', '/rss.xml', 'rss'],
  ]
  return (
    <>
      {items
        .filter(([, href]) => href)
        .map(([label, href, icon]) => (
          <Anchor
            key={label}
            href={href ?? '#'}
            aria-label={label}
            className="a2-soc"
          >
            <Icon name={icon} />
          </Anchor>
        ))}
    </>
  )
}

function Column({title, links}: FooterData['columns'][number]) {
  return (
    <>
      <span className="a2-micro">{title}</span>
      <div className="a2-fl">
        {links.map(l => (
          <Anchor key={l.href} href={l.href} external={l.external}>
            {l.label}
          </Anchor>
        ))}
      </div>
    </>
  )
}

export function Footer({
  footer,
  social,
  statusUrl,
}: {
  footer: FooterData
  social: SiteSettings['social']
  statusUrl?: string
}) {
  const vp = useViewport()
  const year = new Date().getFullYear()
  const columns = footer.columns.map(c =>
    c.title === 'Site' && statusUrl && !c.links.some(l => l.label === 'Status')
      ? {
          ...c,
          links: [
            ...c.links,
            {label: 'Status', href: statusUrl, external: true},
          ],
        }
      : c,
  )
  const logo = (
    <Anchor className="a2-logo" href="/" aria-label="SWEMRE, home">
      SWEMRE
    </Anchor>
  )
  const brand = <span className="a2-micro">Software brand · © {year}</span>
  const exit = <span className="a2-mono">emre@swemre:~$ exit 0</span>
  let body: ReactNode
  let bar: ReactNode
  if (vp === 'm') {
    body = (
      <div style={{padding: '48px 0'}}>
        <div>
          {logo}
          <p className="a2-small" style={{marginTop: 16}}>
            {footer.tagline}
          </p>
          <div style={{display: 'flex', gap: 8, marginTop: 24}}>
            <Socials social={social} />
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px 16px',
            marginTop: 32,
          }}
        >
          {columns.map(c => (
            <div key={c.title}>
              <Column {...c} />
            </div>
          ))}
        </div>
      </div>
    )
    bar = (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '24px 0',
        }}
      >
        {brand}
        <span className="a2-micro">swemre.com</span>
      </div>
    )
  } else if (vp === 't') {
    body = (
      <div style={{padding: '48px 0'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div>
            {logo}
            <p className="a2-small" style={{marginTop: 16, maxWidth: 420}}>
              {footer.tagline}
            </p>
          </div>
          <div style={{display: 'flex', gap: 8}}>
            <Socials social={social} />
          </div>
        </div>
        <div className="a2-g12" style={{marginTop: 32, columnGap: 24}}>
          {columns.map((c, i) => (
            <div key={c.title} style={{gridColumn: `${1 + i * 4} / span 4`}}>
              <Column {...c} />
            </div>
          ))}
        </div>
      </div>
    )
    bar = (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 0',
        }}
      >
        {brand}
        {exit}
      </div>
    )
  } else {
    body = (
      <div className="a2-g12" style={{padding: '64px 0'}}>
        <div style={{gridColumn: '1 / span 4'}}>
          {logo}
          <p className="a2-small" style={{marginTop: 16, maxWidth: 360}}>
            {footer.tagline}
          </p>
          <div style={{display: 'flex', gap: 8, marginTop: 24}}>
            <Socials social={social} />
          </div>
        </div>
        {columns.map((c, i) => (
          <div key={c.title} style={{gridColumn: `${7 + i * 2} / span 2`}}>
            <Column {...c} />
          </div>
        ))}
      </div>
    )
    bar = (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '32px 0',
        }}
      >
        {brand}
        {exit}
      </div>
    )
  }
  return (
    <footer className="a2-footer" data-cut>
      <div className="a2-c">
        <div className="a2-fhr" />
        {body}
        <div className="a2-hr" />
        {bar}
      </div>
    </footer>
  )
}
