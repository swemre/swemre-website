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

// "Recent articles" (// back to reading): three flat cards with the small code cover.
import {Link} from 'react-router-dom'
import type {ArticleSummary} from '../../contract/view.ts'
import {useArticles} from '../../data/hooks.ts'
import {useViewport} from '../../design/index.tsx'
import {MiniCover} from './cover.tsx'
import {fmtDate, minRead} from './format.ts'
import {ArrowLink, SectionHead} from './heads.tsx'
import {usePick} from './vp.ts'

export function RecentCards({items}: {items: ArticleSummary[]}) {
  const vp = useViewport()
  const pick = usePick()
  return (
    <div
      className="a2-cols"
      style={{
        gridTemplateColumns: `repeat(${pick({m: 1, t: 2, d: 3})},minmax(0,1fr))`,
        gap: pick({m: 16, t: 24, d: 32}),
      }}
    >
      {items.map(a => (
        <Link
          key={a.slug}
          to={a.href}
          className="a2-card is-flat"
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            padding: vp === 'd' || vp === '4k' ? 32 : 24,
          }}
        >
          <MiniCover article={a} />
          <div style={{minWidth: 0}}>
            <span className="a2-mono" style={{fontSize: 12}}>
              {[fmtDate(a.publishedAt), minRead(a.readingTime)]
                .filter(Boolean)
                .join(' / ')}
            </span>
            <h3 className="a2-h4" style={{marginTop: 8}}>
              {a.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  )
}

/** The whole block: section head and the three newest articles (nothing while loading). */
export function RecentArticles({exclude}: {exclude?: string}) {
  const res = useArticles({limit: 4})
  if (res.status !== 'ready') return null
  const items = res.data.filter(a => a.slug !== exclude).slice(0, 3)
  if (!items.length) return null
  return (
    <>
      <SectionHead
        eyebrow="back to reading"
        title="Recent articles"
        gap={16}
        action={<ArrowLink to="/articles">All articles</ArrowLink>}
      />
      <RecentCards items={items} />
    </>
  )
}
