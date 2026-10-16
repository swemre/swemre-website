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

import {useState, type ReactNode} from 'react'
import {ResumeRequestModal} from '../components/ResumeRequestModal'
import {ResumeModalContext} from './ResumeModalContext'

export function ResumeModalProvider({children}: {children: ReactNode}) {
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return (
    <ResumeModalContext value={{open, close}}>
      {children}
      <ResumeRequestModal open={isOpen} onClose={close} />
    </ResumeModalContext>
  )
}
