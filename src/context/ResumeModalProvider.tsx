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
import {Modal} from '../components/Modal'
import {ResumeRequestModal} from '../components/ResumeRequestModal'
import {CallbackRequestForm} from '../forms/CallbackRequestForm'
import {MessageForm} from '../forms/MessageForm'
import {ResumeModalContext} from './ResumeModalContext'

export function ResumeModalProvider({children}: {children: ReactNode}) {
  const [shown, setShown] = useState<'resume' | 'callback' | 'message' | null>(
    null,
  )
  const open = () => setShown('resume')
  const openCallback = () => setShown('callback')
  const openMessage = () => setShown('message')
  const close = () => setShown(null)

  return (
    <ResumeModalContext value={{open, openCallback, openMessage, close}}>
      {children}
      <ResumeRequestModal open={shown === 'resume'} onClose={close} />
      <Modal
        open={shown === 'callback'}
        onClose={close}
        label="Request a call back"
      >
        <CallbackRequestForm onDone={close} />
      </Modal>
      <Modal open={shown === 'message'} onClose={close} label="Send a message">
        <MessageForm onDone={close} />
      </Modal>
    </ResumeModalContext>
  )
}
