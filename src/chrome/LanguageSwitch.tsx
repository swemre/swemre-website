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

// The language switch: EN and TR side by side, the current one bright. It is a plain link to the
// same page under the other prefix, so the page reloads in that language (texts are per load).
import type {CSSProperties, MouseEventHandler} from 'react'
import {Icon} from '../design/index.tsx'
import {LANGUAGE_NAMES, LOCALES, locale, t} from '../i18n/index.ts'
import {otherLocale, useOtherLocaleHref} from './language.ts'

const dim: CSSProperties = {color: 'var(--a2-text-lo)'}

export function LanguageSwitch({
  className,
  style,
  onMouseEnter,
}: {
  className?: string
  style?: CSSProperties
  onMouseEnter?: MouseEventHandler
}) {
  const href = useOtherLocaleHref()
  return (
    <a
      className={className}
      href={href}
      hrefLang={otherLocale}
      aria-label={t('language.switch.label', {
        current: LANGUAGE_NAMES[locale],
        target: LANGUAGE_NAMES[otherLocale],
      })}
      style={{padding: '0 12px', gap: 6, ...style}}
      onMouseEnter={onMouseEnter}
    >
      <Icon name="globe" />
      {LOCALES.map(l => (
        <span key={l} style={l === locale ? undefined : dim}>
          {l.toUpperCase()}
        </span>
      ))}
    </a>
  )
}
