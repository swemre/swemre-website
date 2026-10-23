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

import {useChat} from '../../hooks/useChat'
import {Icon} from '../Icon'
import {OwnerAvatar} from './OwnerAvatar'

export function ChatLauncher() {
  const chat = useChat()
  return (
    <button
      type="button"
      onClick={chat.toggle}
      data-sound={chat.isOpen ? 'cancel' : 'open'}
      aria-label={chat.isOpen ? 'Close chat' : 'Chat with Emre'}
      aria-expanded={chat.isOpen}
      className="group pointer-events-auto relative inline-grid size-12 place-items-center rounded-md shadow-lg transition-transform hover:scale-105"
    >
      {chat.isOpen ? (
        <span className="inline-grid size-12 place-items-center rounded-md bg-primary-solid text-cover-fg">
          <Icon name="x" size={18} />
        </span>
      ) : (
        <OwnerAvatar presence={chat.presence} size="lg" shape="md" />
      )}
      {!chat.isOpen && (
        <span className="pointer-events-none absolute right-full mr-3 hidden rounded-sm bg-fg-strong px-2.5 py-1 text-xs font-medium whitespace-nowrap text-canvas shadow-md group-hover:block">
          Chat with Emre ·{' '}
          {chat.presence === 'unreachable' ? 'not reachable' : chat.presence}
        </span>
      )}
    </button>
  )
}
