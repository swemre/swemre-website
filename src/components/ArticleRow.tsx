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
import {useArticleInteraction} from '../hooks/useArticleInteraction'
import type {Article} from '../types/type'
import {formatDate} from '../utils/formatDate'
import {Icon} from './Icon'
import {TagLabel} from './TagLabel'

export function ArticleRow({article}: {article: Article}) {
  const interaction = useArticleInteraction(article.id)
  return (
    <li className="flex gap-4 px-6 py-6 transition-colors hover:bg-surface-muted">
      <Icon name="file" size={18} className="mt-1 text-fg-subtle" />
      <div className="min-w-0 flex-1">
        <Link
          to={`/articles/${article.slug}`}
          className="text-xl font-semibold text-primary"
        >
          {article.title}
        </Link>
        <p className="mt-1.5 max-w-measure text-base text-fg-muted">
          {article.summary}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {article.tags.map(tag => (
            <TagLabel key={tag}>{tag}</TagLabel>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
          <span>Published {formatDate(article.createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" size={13} /> {article.readingTime} min read
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="eye" size={13} /> {interaction.views}
          </span>
          {interaction.liked && (
            <span className="inline-flex items-center gap-1 text-danger">
              <Icon name="heart" size={13} filled /> Liked
            </span>
          )}
          {interaction.favorited && (
            <span className="inline-flex items-center gap-1 text-attention">
              <Icon name="bookmark" size={13} filled /> Saved
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
