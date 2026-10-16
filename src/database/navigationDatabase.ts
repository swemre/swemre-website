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

import type {NavigationItem} from '../types/type'

export const navigationDatabase: NavigationItem[] = [
  {id: 'home', title: 'Home', summary: 'Overview and contact', to: '/'},
  {
    id: 'articles',
    title: 'Articles',
    summary: 'All articles',
    to: '/articles',
    tags: ['blog', 'writing'],
  },
  {
    id: 'projects',
    title: 'Projects',
    summary: 'Things I have built',
    to: '/projects',
    tags: ['portfolio', 'work'],
  },
]
