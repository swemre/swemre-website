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

// Copy to the clipboard with the "Copied" feedback (Q8): the label reads "Copied" for 2 s, the
// control keeps its width, and a polite live region announces it.
import type {CSSProperties, ReactNode} from 'react'
import {lockStyle, useCopied, useWidthLock} from './clipboard.ts'
import {Icon} from '../../design/index.tsx'
import {t} from '../../i18n/index.ts'

export function LiveNote({text}: {text: string}) {
  return (
    <span className="a2-sr" role="status" aria-live="polite">
      {text}
    </span>
  )
}

/**
 * A labelled copy control. While "Copied" shows, the width is locked to the width the control
 * had with its normal label and the content is centred, so nothing around it moves.
 */
export function CopyButton({
  text,
  label = t('copy.copy'),
  className,
  style,
  iconSize = 13,
  children,
}: {
  text: string
  label?: string
  className?: string
  style?: CSSProperties
  iconSize?: number
  children?: ReactNode
}) {
  const [copied, copy] = useCopied()
  const [width, lock] = useWidthLock()
  const onClick = (e: React.MouseEvent) => {
    lock(e)
    copy(text)
  }
  return (
    <button
      type="button"
      className={className}
      style={{cursor: 'pointer', ...style, ...lockStyle(copied, width)}}
      onClick={onClick}
    >
      <Icon name={copied ? 'check' : 'copy'} size={iconSize} />
      {copied ? t('copy.copied') : (children ?? label)}
      <LiveNote text={copied ? t('copy.copiedNote') : ''} />
    </button>
  )
}
