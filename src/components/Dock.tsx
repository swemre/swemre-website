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

import {useEffect} from 'react'
import {useChat} from '../hooks/useChat'
import {ChatLauncher} from './chat/ChatLauncher'
import {ChatPanel} from './chat/ChatPanel'
import {SoundToggle} from './SoundToggle'
import {SpotifyPanel} from './SpotifyPanel'

const PHONE = '(max-width: 39.99rem)'

// On phones the open chat is a full-screen sheet, so the page behind it must not scroll
function usePhoneScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const phone = window.matchMedia(PHONE)
    const root = document.documentElement
    const apply = () => {
      root.style.overflow = phone.matches ? 'hidden' : ''
    }
    apply()
    phone.addEventListener('change', apply)
    return () => {
      phone.removeEventListener('change', apply)
      root.style.overflow = ''
    }
  }, [locked])
}

export function Dock() {
  const chat = useChat()
  usePhoneScrollLock(chat.isOpen)
  return (
    <>
      <div
        aria-hidden="true"
        className="h-dock-clear bg-canvas-subtle sm:hidden"
      />
      <div className="pointer-events-none fixed right-4 bottom-4 z-40 mb-safe-bottom flex flex-col items-end gap-3">
        {chat.isOpen && <ChatPanel />}
        <SpotifyPanel forceCollapsed={chat.isOpen} />
        <div className="flex items-center gap-3 max-sm:flex-col">
          <SoundToggle />
          <ChatLauncher />
        </div>
      </div>
    </>
  )
}
