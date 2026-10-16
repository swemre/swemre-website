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

import {useSyncExternalStore} from 'react'
import {articleInteractionStore} from '../services/ArticleInteractionStore'
import type {ArticleInteraction, ArticleInteractionState} from '../types/type'

export const useArticleInteraction = (id: string): ArticleInteraction =>
  useSyncExternalStore(articleInteractionStore.subscribe, () =>
    articleInteractionStore.readOne(id),
  )

export const useAllArticleInteractions = (): ArticleInteractionState =>
  useSyncExternalStore(
    articleInteractionStore.subscribe,
    articleInteractionStore.readAll,
  )
