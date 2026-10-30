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

// The ready list: covers grid or text rows, then "Showing 9 of 12 articles / newest first",
// Load more (9 per page) and the RSS link.
import type {ArticleSummary} from '../../contract/view.ts'
import {ArticleCard, ArticleRow} from '../../design/index.tsx'
import {MoreBar, Slash} from '../home/kit/list.tsx'
import {useV} from '../home/kit/vp.ts'
import {PAGE_SIZE, type Sort, type View} from './model.ts'

export function ArticleList({
  items,
  view,
  sort,
  page,
  onPage,
}: {
  items: ArticleSummary[]
  view: View
  sort: Sort
  page: number
  onPage(p: number): void
}) {
  const v = useV()
  const visible = items.slice(0, page * PAGE_SIZE)
  const more = Math.min(PAGE_SIZE, items.length - visible.length)
  return (
    <>
      {view === 'covers' ? (
        <div
          className="a2-cols"
          style={{
            gridTemplateColumns: `repeat(${v(1, 2, 3)},minmax(0,1fr))`,
            columnGap: v(16, 24, 32),
            rowGap: v(48, 48, 64),
          }}
        >
          {visible.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      ) : (
        <div className="a2-rows">
          {visible.map(a => (
            <ArticleRow key={a.slug} article={a} variant="list" />
          ))}
        </div>
      )}
      <MoreBar
        status={
          <>
            Showing {visible.length} of {items.length}{' '}
            {items.length === 1 ? 'article' : 'articles'} <Slash />{' '}
            {sort === 'oldest' ? 'oldest first' : 'newest first'}
          </>
        }
        more={more}
        onMore={() => onPage(page + 1)}
        rss="/rss.xml"
      />
    </>
  )
}
