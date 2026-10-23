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

import type {ReactNode} from 'react'
import {ArticleActions} from '../components/ArticleActions'
import {DocHeader} from '../components/DocHeader'
import {HeaderBand} from '../components/HeaderBand'
import {Icon} from '../components/Icon'
import {PagerLink} from '../components/PagerLink'
import {TagLabel} from '../components/TagLabel'
import type {Article} from '../types/type'
import {formatDate} from '../utils/formatDate'
import {DocsLayout} from './DocsLayout'

export function ArticleTemplate({
  article,
  sidebar,
  previous,
  next,
  children,
}: {
  article: Article
  sidebar: ReactNode
  previous?: Article
  next?: Article
  children: ReactNode
}) {
  return (
    <>
      <HeaderBand />
      <DocsLayout
        sidebar={sidebar}
        before={
          <DocHeader
            crumbs={[
              {label: 'Articles', to: '/articles'},
              {label: article.title},
            ]}
            badges={article.tags.map(tag => (
              <TagLabel key={tag}>{tag}</TagLabel>
            ))}
            title={article.title}
            summary={article.summary}
            cover={{
              src: article.coverUrl,
              alt: article.coverAlt,
              width: article.coverWidth,
              height: article.coverHeight,
            }}
            meta={
              <>
                <span className="inline-flex items-center gap-2">
                  <span className="inline-grid size-7 place-items-center rounded-sm bg-primary-solid text-xs font-semibold text-fg-on-emphasis">
                    {article.author.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium text-fg-strong">
                    {article.author}
                  </span>
                </span>
                <span>{formatDate(article.createdAt)}</span>
                <span className="inline-flex items-center gap-1">
                  <Icon name="clock" size={14} /> {article.readingTime} min read
                </span>
              </>
            }
            actions={<ArticleActions id={article.id} />}
          />
        }
        after={
          <>
            <section className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface-muted px-6 py-5">
              <p className="text-sm font-medium text-fg-strong">
                Was this article helpful?
              </p>
              <ArticleActions id={article.id} />
            </section>
            {(previous || next) && (
              <nav
                aria-label="More articles"
                className="mt-6 grid gap-4 sm:grid-cols-2"
              >
                {previous && (
                  <PagerLink
                    to={`/articles/${previous.slug}`}
                    title={previous.title}
                    direction="previous"
                  />
                )}
                {next && (
                  <PagerLink
                    to={`/articles/${next.slug}`}
                    title={next.title}
                    direction="next"
                  />
                )}
              </nav>
            )}
          </>
        }
      >
        {children}
      </DocsLayout>
    </>
  )
}
