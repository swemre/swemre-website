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

import type {ComponentProps} from 'react'
import {cn} from '../../utils/cn'
import {slugify} from '../../utils/slugify'
import {textContent} from '../../utils/textContent'

export function AnchorHeading({
  as: Tag,
  className,
  children,
  ...props
}: ComponentProps<'h2'> & {as: 'h2' | 'h3'}) {
  const text = textContent(children)
  const id = props.id ?? slugify(text)
  return (
    <Tag
      {...props}
      id={id}
      data-toc-text={text}
      className={cn('group scroll-mt-sticky', className)}
    >
      {children}
      <a
        href={`#${id}`}
        aria-label="Link to this section"
        className="ml-2 font-normal text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary hover:no-underline focus-visible:opacity-100"
      >
        #
      </a>
    </Tag>
  )
}
