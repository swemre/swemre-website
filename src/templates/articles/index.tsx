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

// /articles (boards Articles, -text, -loading, -text-loading, -empty, -error). All list state is
// in the URL: view=text, topic=<slug>, sort=oldest, page=<n>, more=1 (all topic chips), saved=1.
import type {TermRef} from '../../contract/view.ts'
import type {TemplateProps} from '../../contract/templates.ts'
import {useArticles, useTerms, useTopic} from '../../data/hooks.ts'
import {Skeleton} from '../../design/index.tsx'
import {ListHeader} from '../home/kit/ListHeader.tsx'
import {ArticleList} from './ArticleList.tsx'
import {SAVED_KEY, sortArticles, type Sort, type View} from './model.ts'
import {ArticleStates} from './ArticleStates.tsx'
import {FilterBar} from './FilterBar.tsx'
import {readList, useLastLoad, useQuery} from '../home/kit/url.ts'
import {ListSection, ViewToggle} from '../home/kit/list.tsx'
import {useV} from '../home/kit/vp.ts'

const fallbackName = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase())

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- same props as every template
export function ArticlesTemplate(_props: TemplateProps) {
  const v = useV()
  const q = useQuery()
  const view: View = q.get('view') === 'text' ? 'text' : 'covers'
  const sort: Sort = q.get('sort') === 'oldest' ? 'oldest' : 'newest'
  const topic = q.get('topic')
  const saved = q.get('saved') === '1'
  const page = Math.max(1, Number(q.get('page')) || 1)
  const all = useArticles()
  const terms = useTerms()
  const topicData = useTopic(topic)
  const lastLoad = useLastLoad('articles', all.status === 'ready')

  const topics: TermRef[] = terms.status === 'ready' ? terms.data : []
  const list = all.status === 'ready' ? all.data : []
  const savedSlugs = saved ? readList(SAVED_KEY) : []
  const filtered = list.filter(a =>
    saved
      ? savedSlugs.includes(a.slug)
      : !topic || a.tags.some(t => t.slug === topic),
  )
  const topicTerm =
    topics.find(t => t.slug === topic) ??
    (topicData.status === 'ready' ? topicData.data.term : undefined)
  const topicName = topic ? (topicTerm?.name ?? fallbackName(topic)) : ''

  const status =
    all.status === 'ready' && filtered.length === 0 ? 'empty' : all.status
  const filter = {topic, topicName, saved, more: q.get('more') === '1'}

  const header = (
    <ListHeader
      eyebrow="writing"
      title="Articles"
      lead="Notes on building for the web: Java services, React front ends and the architecture behind my projects."
      commit="a1b2c3d"
      right={
        <ViewToggle
          label="View"
          value={view}
          disabled={all.status === 'loading' || all.status === 'error'}
          onChange={nv => q.set({view: nv === 'text' ? 'text' : undefined})}
          options={[
            {
              value: 'covers',
              label: 'With covers',
              icon: 'image',
              count: filtered.length,
            },
            {
              value: 'text',
              label: 'Text only',
              icon: 'text',
              count: filtered.length,
            },
          ]}
        />
      }
      below={
        <FilterBar
          status={all.status}
          topics={topics}
          total={list.length}
          count={filtered.length}
          filter={filter}
          sort={sort}
          lastLoad={lastLoad}
          onTopic={slug =>
            q.set({topic: slug, saved: undefined, page: undefined})
          }
          onSaved={on => q.set({saved: on, topic: undefined, page: undefined})}
          onMore={on => q.set({more: on})}
          onSort={s =>
            q.set({sort: s === 'oldest' ? s : undefined, page: undefined})
          }
        />
      }
    />
  )

  if (status === 'loading')
    return (
      <>
        {header}
        <ListSection label="loading">
          <span className="a2-sr" role="status">
            Loading articles
          </span>
          {view === 'covers' ? (
            <div
              className="a2-cols"
              aria-hidden="true"
              style={{
                gridTemplateColumns: `repeat(${v(1, 2, 3)},minmax(0,1fr))`,
                columnGap: v(16, 24, 32),
                rowGap: v(48, 48, 64),
              }}
            >
              <Skeleton pattern="card" count={6} />
            </div>
          ) : (
            <div className="a2-rows" aria-hidden="true">
              <Skeleton pattern="row" count={6} />
            </div>
          )}
        </ListSection>
      </>
    )
  if (status === 'ready')
    return (
      <>
        {header}
        <ListSection label="9f3e2a1" ready>
          <ArticleList
            items={sortArticles(filtered, sort)}
            view={view}
            sort={sort}
            page={page}
            onPage={p => q.set({page: p})}
          />
        </ListSection>
      </>
    )
  return (
    <>
      {header}
      <ArticleStates
        kind={status}
        retry={all.status === 'error' ? all.retry : undefined}
        filter={filter}
        related={
          (topicData.status === 'ready' && topicData.data.related) ||
          topics.filter(t => t.slug !== topic).slice(0, 3)
        }
        onShowAll={() =>
          q.set({topic: undefined, saved: undefined, page: undefined})
        }
        onTopic={slug =>
          q.set({topic: slug, saved: undefined, page: undefined})
        }
      />
    </>
  )
}
