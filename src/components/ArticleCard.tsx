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
import type {Article} from '../types/type'
import {formatDate} from '../utils/formatDate'
import {Icon} from './Icon'
import {TagLabel} from './TagLabel'

export function ArticleCard({article}: {article: Article}) {
  return (
    <article className="group/card relative flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-xs transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover/card:scale-x-100"
      />
      <p className="flex items-center gap-3 font-mono text-xs text-fg-subtle">
        <span>{formatDate(article.createdAt)}</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <Icon name="clock" size={12} /> {article.readingTime} min
        </span>
      </p>
      <Link
        to={`/articles/${article.slug}`}
        className="mt-4 text-xl font-semibold tracking-tight text-fg-strong group-hover/card:text-primary after:absolute after:inset-0 hover:no-underline"
      >
        {article.title}
      </Link>
      <p className="mt-3 flex-1 text-sm leading-6 text-fg-muted">
        {article.summary}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map(tag => (
            <TagLabel key={tag}>{tag}</TagLabel>
          ))}
        </div>
        <Icon
          name="arrow-right"
          size={16}
          className="text-primary opacity-0 transition-[opacity,transform] duration-300 group-hover/card:translate-x-1 group-hover/card:opacity-100"
        />
      </div>
    </article>
  )
}
