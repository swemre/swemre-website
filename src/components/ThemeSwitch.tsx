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

import {useTheme} from '../hooks/useTheme'
import {cn} from '../utils/cn'
import {coverControl} from '../utils/navTone'
import {Icon} from './Icon'

export function ThemeSwitch() {
  const {mode, toggle} = useTheme()
  const next = mode === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      data-sound={mode === 'dark' ? 'toggle-on' : 'toggle-off'}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        'inline-grid size-9 place-items-center rounded-full border border-border bg-surface text-fg-muted shadow-xs transition-[background-color,color,transform] duration-300 hover:rotate-12 hover:bg-surface-muted hover:text-fg-strong',
        coverControl,
      )}
    >
      <Icon name={mode === 'dark' ? 'sun' : 'moon'} />
    </button>
  )
}
