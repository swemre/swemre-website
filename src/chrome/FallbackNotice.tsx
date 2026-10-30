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

// Shown when the page's publication is not in the page's language (it fell back to English):
// a small note at the bottom of the window that the visitor can close.
import {useState, type CSSProperties} from 'react'
import {Icon} from '../design/index.tsx'
import {locale, t, type TextKey} from '../i18n/index.ts'

const box: CSSProperties = {
  position: 'fixed',
  left: '50%',
  bottom: 16,
  transform: 'translateX(-50%)',
  zIndex: 40,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  maxWidth: 'calc(100vw - 32px)',
  padding: '10px 12px 10px 16px',
  borderRadius: 8,
  background: 'var(--a2-panel-grad)',
  border: '1px solid var(--a2-panel-line)',
  boxShadow: 'var(--a2-shadow-panel)',
  color: 'var(--a2-text-hi)',
  fontSize: 14,
  lineHeight: '20px',
}

export function FallbackNotice({shown}: {shown: string}) {
  const [closed, setClosed] = useState(false)
  if (closed || shown === locale) return null
  // The shown language's name in the page's language ("İngilizce" on a Turkish page).
  const name = t(`language.name.${shown}` as TextKey)
  return (
    <div role="note" style={box}>
      <Icon name="globe" />
      <span>{t('fallback.notice', {language: name})}</span>
      <button
        type="button"
        className="a2-nctl is-icon"
        aria-label={t('fallback.close')}
        onClick={() => setClosed(true)}
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  )
}
