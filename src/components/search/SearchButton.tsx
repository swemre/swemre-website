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

import {useSearchDialog} from '../../hooks/useSearchDialog'
import {cn} from '../../utils/cn'
import {coverControl} from '../../utils/navTone'
import {Icon} from '../Icon'
import {Kbd} from '../Kbd'

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.userAgent)

export function SearchButton() {
  const search = useSearchDialog()
  return (
    <button
      type="button"
      onClick={search.open}
      data-sound="none"
      aria-label="Search"
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-sm border border-border bg-surface px-2 text-sm text-fg-subtle shadow-xs transition-colors hover:border-border-strong hover:text-fg-muted md:max-w-search md:min-w-0 md:flex-1',
        coverControl,
      )}
    >
      <Icon name="search" />
      <span className="hidden md:inline">Search…</span>
      <span className="ml-auto hidden gap-0.5 md:inline-flex">
        <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  )
}
