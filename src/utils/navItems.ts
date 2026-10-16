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

import type {Article, Project, SidebarNavItem} from '../types/type'

export const projectNavItem = (
  project: Project,
  activeId?: string,
): SidebarNavItem => ({
  key: project.id,
  label: project.title,
  to: `/projects/${project.slug}`,
  active: project.id === activeId,
})

export const articleNavItem = (
  article: Article,
  activeId?: string,
): SidebarNavItem => ({
  key: article.id,
  label: article.title,
  to: `/articles/${article.slug}`,
  active: article.id === activeId,
})
