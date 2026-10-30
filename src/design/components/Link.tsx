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

// One anchor for internal (router) and external links. External links open in a new tab.
import type {AnchorHTMLAttributes, ReactNode} from 'react'
import {Link as RouterLink} from 'react-router-dom'
import {isExternal} from './util.ts'

export type AnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> & {
  href: string
  children?: ReactNode
  /** Force a new tab (default: only for http(s) links). */
  external?: boolean
}

export function Anchor({href, external, children, ...rest}: AnchorProps) {
  if (external || isExternal(href)) {
    const newTab = external ?? /^(https?:)?\/\//.test(href)
    return (
      <a
        href={href}
        {...(newTab ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <RouterLink to={href} {...rest}>
      {children}
    </RouterLink>
  )
}
