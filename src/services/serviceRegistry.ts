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

import type {ServiceMap} from '../types/type'
import {ArticleService} from './ArticleService'
import {ChatService} from './ChatService'
import {ContactFormService} from './ContactFormService'
import {ProjectService} from './ProjectService'
import {SongService} from './SongService'
import {SpecialPageService} from './SpecialPageService'
import {createSearchService} from './searchSources'

const entityServices = {
  article: new ArticleService(),
  chat: new ChatService(),
  contactForm: new ContactFormService(),
  project: new ProjectService(),
  song: new SongService(),
  specialPage: new SpecialPageService(),
}

export const serviceRegistry: ServiceMap = {
  ...entityServices,
  search: createSearchService(entityServices),
}
