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

// The current page's address in each language, for the language menus.
import {useLocation} from 'react-router-dom'
import {basename, localeHref, type Locale} from '../i18n/index.ts'

export function useLocaleHref(): (target: Locale) => string {
  const {pathname, search, hash} = useLocation()
  return target => localeHref(target, basename + pathname, search) + hash
}
