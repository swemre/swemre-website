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

import {useEffect, useRef, type ReactNode} from 'react'
import {useSound} from '../hooks/useSound'
import {cn} from '../utils/cn'
import {Icon} from './Icon'

export function Modal({
  open,
  onClose,
  label,
  placement = 'center',
  wide = false,
  showClose = true,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  placement?: 'center' | 'top'
  wide?: boolean
  showClose?: boolean
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const {play} = useSound()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      play('open')
    }
    if (!open && dialog.open) dialog.close()
  }, [open, play])

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={event => {
        // A click on the backdrop targets the dialog element itself.
        if (event.target === ref.current) {
          play('cancel')
          onClose()
        }
      }}
      className={cn(
        'rounded-md bg-overlay text-fg shadow-overlay backdrop:bg-scrim backdrop:backdrop-blur-xs open:animate-pop',
        wide ? 'w-palette' : 'w-dialog',
        placement === 'top' ? 'mx-auto mt-dialog-top mb-auto' : 'm-auto',
        className,
      )}
    >
      {showClose && (
        <button
          type="button"
          aria-label="Close"
          data-sound="cancel"
          onClick={onClose}
          className="absolute top-3 right-3 inline-grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-surface-muted hover:text-fg-strong"
        >
          <Icon name="x" />
        </button>
      )}
      {open && children}
    </dialog>
  )
}
