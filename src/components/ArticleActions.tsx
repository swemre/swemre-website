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

import {useArticleInteraction} from '../hooks/useArticleInteraction'
import {articleInteractionStore} from '../services/ArticleInteractionStore'
import {buttonClass} from '../utils/buttonClass'
import {cn} from '../utils/cn'
import {Icon} from './Icon'

export function ArticleActions({id}: {id: string}) {
  const {liked, favorited, views} = useArticleInteraction(id)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={liked}
        onClick={() => articleInteractionStore.toggleLike(id)}
        className={buttonClass(
          'secondary',
          'sm',
          cn(liked && 'border-danger text-danger hover:border-danger'),
        )}
      >
        <Icon name="heart" filled={liked} size={14} />
        {liked ? 'Liked' : 'Like'}
      </button>
      <button
        type="button"
        aria-pressed={favorited}
        onClick={() => articleInteractionStore.toggleFavorite(id)}
        className={buttonClass(
          'secondary',
          'sm',
          cn(
            favorited &&
              'border-attention text-attention hover:border-attention',
          ),
        )}
      >
        <Icon name="bookmark" filled={favorited} size={14} />
        {favorited ? 'Saved' : 'Save'}
      </button>
      <span className="ml-1 inline-flex items-center gap-1.5 text-sm text-fg-muted">
        <Icon name="eye" size={14} />
        {views} {views === 1 ? 'view' : 'views'}
      </span>
    </div>
  )
}
