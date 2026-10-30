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

// Like, Save and Share for an article, stored per browser (Q4). Saved slugs live under
// 'swemre:saved' (read by the /articles?saved=1 filter), likes under 'swemre:liked'. The hero icon
// buttons and the "Was this article helpful?" card share the same state.
import type {CSSProperties} from 'react'
import {Icon, type IconName} from '../../design/index.tsx'
import {lockStyle, useWidthLock} from './clipboard.ts'
import {LiveNote} from './copy.tsx'
import {LIKED_KEY, SAVED_KEY, useShare, useToggle} from './store.ts'
import {t} from '../../i18n/index.ts'

const pressedStyle: CSSProperties = {
  color: 'var(--a2-pale)',
  borderColor: 'var(--a2-link)',
  background: 'var(--a2-chip-active)',
}

/** The three reaction buttons; `labelled` draws them with text (the end-of-article card). */
export function Reactions({
  slug,
  title,
  labelled,
}: {
  slug: string
  title: string
  labelled?: boolean
}) {
  const [liked, toggleLike] = useToggle(LIKED_KEY, slug)
  const [saved, toggleSave] = useToggle(SAVED_KEY, slug)
  const [copied, share] = useShare(title)
  const [width, lock] = useWidthLock()
  const cls = `a2-btn is-secondary${labelled ? '' : ' is-icononly'}`
  const size = labelled ? 16 : 18
  const toggle = (
    name: IconName,
    label: string,
    on: boolean,
    onClick: () => void,
  ) => (
    <button
      className={cls}
      type="button"
      aria-label={labelled ? undefined : label}
      aria-pressed={on}
      style={on ? pressedStyle : undefined}
      onClick={onClick}
    >
      <Icon name={name} size={size} />
      {labelled && <span>{label}</span>}
    </button>
  )
  return (
    <>
      {toggle('star', t('reactions.like'), liked, toggleLike)}
      {toggle('bookmark', t('reactions.save'), saved, toggleSave)}
      <button
        className={cls}
        type="button"
        aria-label={labelled ? undefined : t('reactions.share')}
        style={lockStyle(copied, width)}
        onClick={e => {
          lock(e)
          share()
        }}
      >
        <Icon name={copied ? 'check' : 'send'} size={size} />
        {labelled && (
          <span>{copied ? t('copy.copied') : t('reactions.share')}</span>
        )}
      </button>
      <LiveNote text={copied ? t('copy.linkCopied') : ''} />
    </>
  )
}
