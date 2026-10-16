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

import {useChat} from '../hooks/useChat'
import {ChatLauncher} from './chat/ChatLauncher'
import {ChatPanel} from './chat/ChatPanel'
import {SoundToggle} from './SoundToggle'
import {SpotifyPanel} from './SpotifyPanel'

export function Dock() {
  const chat = useChat()
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3">
      {chat.isOpen && <ChatPanel />}
      <SpotifyPanel forceCollapsed={chat.isOpen} />
      <div className="flex items-center gap-3">
        <SoundToggle />
        <ChatLauncher />
      </div>
    </div>
  )
}
