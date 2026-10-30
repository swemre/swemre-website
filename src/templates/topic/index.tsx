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

// /articles/topic/:term (board Topic-java): the topic's articles, the projects built with it and
// the other topics. Loading, empty and error reuse the Articles states. URL state: sort=oldest.
import {useNavigate} from 'react-router-dom'
import type {TemplateProps} from '../../contract/templates.ts'
import type {Topic} from '../../contract/view.ts'
import {useTopic} from '../../data/hooks.ts'
import {
  ArticleCard,
  Button,
  Chip,
  ProjectCard,
  Rail,
  SectionHeader,
  Skeleton,
} from '../../design/index.tsx'
import {ArticleStates} from '../articles/ArticleStates.tsx'
import {SORTS, sortArticles, type Sort} from '../articles/model.ts'
import {Split} from '../home/kit/layout.tsx'
import {ListHeader} from '../home/kit/ListHeader.tsx'
import {ListSection, Slash, SortButton} from '../home/kit/list.tsx'
import {Rail as HookRail} from '../home/kit/Rail.tsx'
import {SectionBg} from '../home/kit/SectionBg.tsx'
import {useQuery} from '../home/kit/url.ts'
import {useCompact, useV} from '../home/kit/vp.ts'
import {t} from '../../i18n/index.ts'
import {tRich} from '../../i18n/rich.tsx'

const titleCase = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase())

export function TopicTemplate({route}: TemplateProps) {
  const slug = route.params.term ?? ''
  const state = useTopic(slug)
  const q = useQuery()
  const navigate = useNavigate()
  const v = useV()
  const cmp = useCompact()
  const sort: Sort = q.get('sort') === 'oldest' ? 'oldest' : 'newest'
  const topic = state.status === 'ready' ? state.data : undefined
  const name = topic?.term.name ?? titleCase(slug)
  const count = topic?.articles.length ?? 0

  const countLine = (
    <span className="a2-cap">
      {tRich(
        'topic.countLine',
        {name},
        {
          count: (
            <span className="a2-hi" style={{fontWeight: 600}}>
              {t('articles.count', {count})}
            </span>
          ),
        },
      )}{' '}
      <Slash />{' '}
      {sort === 'oldest'
        ? t('articles.sort.oldest.short')
        : t('articles.sort.newest.short')}
    </span>
  )
  const header = (
    <ListHeader
      crumbs={[
        {label: t('topic.crumb.articles'), href: '/articles'},
        {label: t('topic.crumb.topic')},
        {label: slug},
      ]}
      eyebrow={t('topic.crumb.topic')}
      title={name}
      lead={topic?.term.description}
      commit="7a11ca7"
      right={
        <Button
          label={t('topic.follow', {name})}
          kind="secondary"
          iconLeft="rss"
          block={v(true, false, false)}
          href={`/rss.xml?topic=${slug}`}
        />
      }
      below={
        state.status === 'ready' && count > 0 ? (
          <div
            style={
              cmp && v(true, false, false)
                ? {display: 'flex', flexDirection: 'column', gap: 16}
                : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 32,
                  }
            }
          >
            {countLine}
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <SortButton
                value={sort}
                options={SORTS}
                onChange={s => q.set({sort: s === 'oldest' ? s : undefined})}
              />
            </div>
          </div>
        ) : undefined
      }
    />
  )

  if (state.status === 'loading')
    return (
      <>
        {header}
        <ListSection label="loading">
          <span className="a2-sr" role="status">
            {t('articles.loading')}
          </span>
          <div
            className="a2-cols"
            aria-hidden="true"
            style={{
              gridTemplateColumns: `repeat(${v(1, 2, 3)},minmax(0,1fr))`,
              columnGap: v(16, 24, 32),
              rowGap: v(48, 48, 64),
            }}
          >
            <Skeleton pattern="card" count={3} />
          </div>
        </ListSection>
      </>
    )
  if (!topic || count === 0)
    return (
      <>
        {header}
        <ArticleStates
          kind={state.status === 'error' ? 'error' : 'empty'}
          retry={state.status === 'error' ? state.retry : undefined}
          filter={{topic: slug, topicName: name, saved: false, more: false}}
          related={topic?.related ?? topic?.others.slice(0, 3) ?? []}
          onShowAll={() => void navigate('/articles')}
          onTopic={s => void navigate(`/articles/topic/${s}`)}
        />
      </>
    )
  return (
    <>
      {header}
      <section className="a2-sec" data-cut style={{paddingTop: 0}}>
        <SectionBg hue="blue" at={[84, 16]} texture="dots" alpha={0.12} />
        <Rail from="blue" />
        <div className="a2-c">
          <div
            className="a2-cols"
            style={{
              gridTemplateColumns: `repeat(${v(1, 2, 3)},minmax(0,1fr))`,
              columnGap: v(16, 24, 32),
              rowGap: v(48, 48, 64),
            }}
          >
            {sortArticles(topic.articles, sort).map((a, i) => (
              <ArticleCard key={a.slug} article={a} index={i} />
            ))}
          </div>
        </div>
      </section>
      {topic.projects.length > 0 && <Projects topic={topic} />}
      <Others topic={topic} afterProjects={topic.projects.length > 0} />
    </>
  )
}

function Projects({topic}: {topic: Topic}) {
  const v = useV()
  return (
    <section className="a2-sec" data-cut aria-labelledby="topic-projects">
      <SectionBg hue="peri" at={[20, 50]} texture="scan" />
      <HookRail
        from="blue"
        to="peri"
        node={[69, 95, 130, 166]}
        label="5ca1ab1"
      />
      <div className="a2-c">
        <Split
          spans={[1, 4, 6, 7]}
          left={
            <SectionHeader
              id="topic-projects"
              number={['02', '', '', 'peri']}
              eyebrow={t('mega.projects.eyebrow')}
              title={t('topic.projects.title', {name: topic.term.name})}
              copy={t('topic.projects.copy')}
              link={[t('nav.allProjects'), '/projects']}
            />
          }
          right={
            <div
              className="a2-cols"
              style={{
                gridTemplateColumns: `repeat(${v(1, 2, 2)},minmax(0,1fr))`,
                columnGap: v(16, 24, 32),
                rowGap: v(16, 24, 32),
              }}
            >
              {topic.projects.map((p, i) => (
                <ProjectCard
                  key={p.slug}
                  project={p}
                  variant="grid"
                  index={i}
                />
              ))}
            </div>
          }
        />
      </div>
    </section>
  )
}

function Others({
  topic,
  afterProjects,
}: {
  topic: Topic
  afterProjects: boolean
}) {
  const v = useV()
  const from = afterProjects ? 'peri' : 'blue'
  return (
    <section className="a2-sec" data-cut aria-labelledby="topic-others">
      <SectionBg hue="lilac" at={[24, 40]} texture="rings" />
      <Rail
        from={from}
        to="lilac"
        bottom={v(48, 64, 96, 128)}
        nodes={[{bottom: v(43, 59, 90, 122), current: true}]}
        label={{text: 'faded01', bottom: v(0, 0, 0, 32)}}
      />
      <div className="a2-c">
        <Split
          spans={[1, 4, 6, 7]}
          left={
            <SectionHeader
              id="topic-others"
              number={['011', '0b', '', 'lilac']}
              eyebrow={t('topic.others.eyebrow')}
              title={t('topic.others.title')}
              copy={t('topic.others.copy')}
            />
          }
          right={
            <div className="a2-chips" style={{gap: 8, maxWidth: 720}}>
              {topic.others.map(t => (
                <Chip
                  key={t.slug}
                  label={t.name}
                  count={t.count}
                  href={`/articles/topic/${t.slug}`}
                />
              ))}
            </div>
          }
        />
      </div>
    </section>
  )
}
