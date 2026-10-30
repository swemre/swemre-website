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

// The other language and the current page's address in it, for the language switches.
import {useLocation} from 'react-router-dom'
import {LOCALES, basename, locale, localeHref} from '../i18n/index.ts'

/** The other language, for a two-language site. */
export const otherLocale = LOCALES.find(l => l !== locale) ?? locale

/** The current page's address in the other language. */
export function useOtherLocaleHref(): string {
  const {pathname, search, hash} = useLocation()
  return localeHref(otherLocale, basename + pathname, search) + hash
}
