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

import {useSound} from '../hooks/useSound'
import {Icon} from './Icon'

export function SoundToggle() {
  const sound = useSound()
  return (
    <button
      type="button"
      data-sound="none"
      onClick={sound.toggleMuted}
      aria-pressed={sound.muted}
      aria-label="Mute sounds"
      title={sound.muted ? 'Sounds off' : 'Sounds on'}
      className="pointer-events-auto inline-grid size-8 place-items-center rounded-full border border-border/60 bg-overlay/50 text-fg-strong shadow-md backdrop-blur-md transition-colors hover:bg-overlay/80 aria-pressed:text-fg-muted"
    >
      <Icon name={sound.muted ? 'volume-off' : 'volume'} size={15} />
    </button>
  )
}
