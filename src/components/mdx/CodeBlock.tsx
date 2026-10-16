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

import {useRef, useState, type ComponentProps} from 'react'
import {cn} from '../../utils/cn'
import {Icon} from '../Icon'

export function CodeBlock({className, ...props}: ComponentProps<'pre'>) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard
      .writeText(ref.current?.textContent ?? '')
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
  }

  return (
    <div className="group relative my-5">
      <pre
        ref={ref}
        {...props}
        className={cn(
          className,
          'overflow-x-auto rounded-md border border-border-muted bg-inset p-4 font-mono text-sm leading-6 [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-sm',
        )}
      />
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="absolute top-2 right-2 inline-grid size-8 place-items-center rounded-sm border border-border bg-surface text-fg-muted opacity-0 shadow-xs transition-opacity group-hover:opacity-100 hover:text-fg-strong focus-visible:opacity-100"
      >
        <Icon
          name={copied ? 'check' : 'copy'}
          size={14}
          className={copied ? 'text-success' : undefined}
        />
      </button>
    </div>
  )
}
