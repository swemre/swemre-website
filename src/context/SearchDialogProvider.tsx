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

import {useEffect, useState, type ReactNode} from 'react'
import {SearchDialog} from '../components/search/SearchDialog'
import {SearchDialogContext} from './SearchDialogContext'

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

export function SearchDialogProvider({children}: {children: ReactNode}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut =
        (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) ||
        (event.key === '/' && !isTyping(event.target))
      if (shortcut) {
        event.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return (
    <SearchDialogContext value={{open, close}}>
      {children}
      <SearchDialog open={isOpen} onClose={close} />
    </SearchDialogContext>
  )
}
