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

import {Link} from 'react-router-dom'
import type {Article} from '../../types/type'
import {cn} from '../../utils/cn'
import {formatDate} from '../../utils/formatDate'
import {CoverImage} from '../CoverImage'
import {Icon} from '../Icon'
import {TagLabel} from '../TagLabel'

function Meta({article}: {article: Article}) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-fg-subtle">
      <time dateTime={article.createdAt}>{formatDate(article.createdAt)}</time>
      <span aria-hidden="true">/</span>
      <span className="inline-flex items-center gap-1">
        <Icon name="clock" size={12} /> {article.readingTime} min read
      </span>
    </p>
  )
}

function FeaturedArticle({article, wide}: {article: Article; wide: boolean}) {
  return (
    <article
      className={cn(
        'group/feature relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-xl',
        wide && 'lg:flex-row',
      )}
    >
      <div
        className={cn(
          'relative aspect-[16/9] overflow-hidden border-b border-border-muted bg-inset',
          wide && 'lg:w-7/12 lg:shrink-0 lg:border-r lg:border-b-0',
        )}
      >
        <CoverImage
          src={article.coverUrl}
          alt={article.coverAlt}
          width={article.coverWidth}
          height={article.coverHeight}
          title={article.title}
          className="group-hover/feature:scale-105"
        />
        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-sm bg-cover-ink/70 px-2.5 py-1 font-mono text-2xs font-medium tracking-[0.2em] text-cover-fg uppercase backdrop-blur-md">
          <span className="size-1.5 rounded-xs bg-cover-tint-2" />
          Latest
        </span>
      </div>
      <div
        className={cn(
          'flex flex-1 flex-col p-6 sm:p-8',
          wide && 'lg:justify-center lg:p-10',
        )}
      >
        <Meta article={article} />
        <Link
          to={`/articles/${article.slug}`}
          className="mt-4 text-2xl font-bold tracking-tight text-balance text-fg-strong group-hover/feature:text-primary after:absolute after:inset-0 hover:no-underline sm:text-3xl"
        >
          {article.title}
        </Link>
        <p className="mt-4 max-w-measure text-base leading-7 text-fg-muted">
          {article.summary}
        </p>
        <div
          className={cn(
            'mt-6 flex flex-wrap items-center justify-between gap-4 pt-2 sm:mt-auto',
            wide && 'lg:mt-8',
          )}
        >
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <TagLabel key={tag}>{tag}</TagLabel>
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Read article
            <Icon
              name="arrow-right"
              size={14}
              className="transition-transform duration-300 group-hover/feature:translate-x-1"
            />
          </span>
        </div>
      </div>
    </article>
  )
}

function ArticleListItem({article}: {article: Article}) {
  return (
    <li>
      <article className="group/item relative grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-lg border border-transparent p-3 transition-colors duration-300 hover:border-border hover:bg-surface md:grid-cols-1 md:gap-3 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-5">
        <div className="relative order-last aspect-square w-20 shrink-0 overflow-hidden rounded-md border border-border-muted bg-inset sm:w-28 md:order-first md:aspect-[16/10] md:w-full lg:aspect-[4/3] lg:w-32 xl:w-40">
          <CoverImage
            src={article.coverUrl}
            alt={article.coverAlt}
            width={article.coverWidth}
            height={article.coverHeight}
            title={article.title}
            className="group-hover/item:scale-110 [&_span]:text-xl"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <Meta article={article} />
          <Link
            to={`/articles/${article.slug}`}
            className="mt-2 line-clamp-2 text-base font-semibold tracking-tight text-fg-strong group-hover/item:text-primary after:absolute after:inset-0 hover:no-underline sm:text-lg"
          >
            {article.title}
          </Link>
          <p className="mt-1 hidden text-sm text-fg-muted sm:line-clamp-2 md:hidden lg:line-clamp-2">
            {article.summary}
          </p>
        </div>
      </article>
    </li>
  )
}

export function ArticleShowcase({articles}: {articles: Article[]}) {
  const [featured, ...rest] = articles
  if (!featured) return null
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <div className={rest.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
        <FeaturedArticle article={featured} wide={rest.length === 0} />
      </div>
      {rest.length > 0 && (
        <div className="lg:col-span-5">
          <p className="mb-3 px-3 font-mono text-2xs tracking-[0.2em] text-fg-subtle uppercase">
            More reading
          </p>
          <ul className="grid gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-1 lg:gap-2">
            {rest.map(article => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
