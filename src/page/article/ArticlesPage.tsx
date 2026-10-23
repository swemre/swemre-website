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

import {useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {ArticleRow} from '../../components/ArticleRow'
import {Icon} from '../../components/Icon'
import {LoadError} from '../../components/LoadError'
import {SidebarNav} from '../../components/SidebarNav'
import {useAllArticleInteractions} from '../../hooks/useArticleInteraction'
import {useDocumentTitle} from '../../hooks/useDocumentTitle'
import {useFindAll} from '../../hooks/useFindAll'
import {useService} from '../../hooks/useService'
import {ListTemplate} from '../../templates/ListTemplate'
import {buttonClass} from '../../utils/buttonClass'
import {cn} from '../../utils/cn'
import {projectNavItem} from '../../utils/navItems'

export default function ArticlesPage() {
  useDocumentTitle('Articles')
  const articles = useFindAll(useService('article'))
  const projects = useFindAll(useService('project'))
  const interactions = useAllArticleInteractions()
  const [params, setParams] = useSearchParams()
  const [onlySaved, setOnlySaved] = useState(false)
  const activeTag = params.get('tag')

  const all = articles.data ?? []
  const tagCounts = new Map<string, number>()
  for (const article of all) {
    for (const tag of article.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])

  const shown = all.filter(
    article =>
      (!activeTag || article.tags.includes(activeTag)) &&
      (!onlySaved || interactions[article.id]?.favorited),
  )

  const setTag = (tag: string | null) =>
    setParams(tag ? {tag} : {}, {replace: true})

  const tagButton = (label: string, tag: string | null, count: number) => (
    <button
      key={label}
      type="button"
      onClick={() => setTag(tag)}
      aria-pressed={activeTag === tag}
      className={cn(
        'flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors',
        activeTag === tag
          ? 'bg-primary-muted font-medium text-primary'
          : 'text-fg-muted hover:bg-surface-muted hover:text-fg-strong',
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Icon name={tag ? 'tag' : 'book'} size={14} />
        {label}
      </span>
      <span className="rounded-full bg-surface-muted px-2 text-xs text-fg-muted">
        {count}
      </span>
    </button>
  )

  const tagChip = (label: string, tag: string | null, count: number) => (
    <button
      key={label}
      type="button"
      onClick={() => setTag(tag)}
      aria-pressed={activeTag === tag}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-sm border px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
        activeTag === tag
          ? 'border-primary/40 bg-primary-muted font-medium text-primary'
          : 'border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg-strong',
      )}
    >
      {label}
      <span className="text-xs text-fg-subtle">{count}</span>
    </button>
  )

  const projectItems = (projects.data ?? []).map(p => projectNavItem(p))

  return (
    <ListTemplate
      title="Articles"
      lede="Notes on building for the web."
      toolbar={
        <button
          type="button"
          aria-pressed={onlySaved}
          onClick={() => setOnlySaved(value => !value)}
          className={buttonClass(
            'secondary',
            'sm',
            cn(onlySaved && 'border-attention text-attention'),
          )}
        >
          <Icon name="bookmark" filled={onlySaved} size={14} />
          Saved only
        </button>
      }
      sidebarFromLg
      sidebar={
        <div className="space-y-6">
          <nav aria-label="Filter by topic">
            <p className="mb-2 flex items-center gap-2 px-3 text-2xs font-semibold tracking-wider text-fg-subtle uppercase">
              <Icon name="tag" size={14} className="text-fg-subtle" />
              Topics
            </p>
            <div className="space-y-0.5">
              {tagButton('All articles', null, all.length)}
              {tags.map(([tag, count]) => tagButton(tag, tag, count))}
            </div>
          </nav>
          <SidebarNav
            sections={[
              {
                title: 'Projects',
                icon: 'repo',
                moreTo: '/projects',
                items: projectItems,
              },
            ]}
          />
        </div>
      }
    >
      {tags.length > 0 && (
        <nav
          aria-label="Filter by topic"
          className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden"
        >
          {tagChip('All', null, all.length)}
          {tags.map(([tag, count]) => tagChip(tag, tag, count))}
        </nav>
      )}
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center gap-2 border-b border-border-muted px-6 py-3.5 text-sm">
          <span className="font-semibold text-fg-strong">
            {articles.error === undefined
              ? `${shown.length} ${shown.length === 1 ? 'article' : 'articles'}`
              : 'Articles'}
          </span>
          {activeTag && (
            <button
              type="button"
              onClick={() => setTag(null)}
              className="inline-flex items-center gap-1 text-fg-muted hover:text-primary"
            >
              in <span className="font-medium text-primary">{activeTag}</span>
              <Icon name="x" size={12} />
            </button>
          )}
        </div>
        {articles.loading && (
          <p className="px-5 py-8 text-sm text-fg-muted">Loading…</p>
        )}
        {articles.error !== undefined && (
          <LoadError onRetry={articles.retry} className="m-5" />
        )}
        {!articles.loading && !articles.error && shown.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-fg-muted">
            {onlySaved ? 'No saved articles yet.' : 'No articles match.'}
          </p>
        )}
        <ul className="divide-y divide-border-muted">
          {shown.map(article => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </ul>
      </div>
    </ListTemplate>
  )
}
