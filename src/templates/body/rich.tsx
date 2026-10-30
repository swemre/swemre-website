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

import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import type {InlineText, RichText} from '../../contract/blocks.ts'
import {isInternal} from './text.ts'

/** Inline text runs: bold, italic, code and links (internal links stay in the SPA). */
export function Rich({text}: {text: RichText}) {
  return (
    <>
      {text.map((run, i) => (
        <Run key={i} run={run} />
      ))}
    </>
  )
}

function Run({run}: {run: InlineText}) {
  let node: ReactNode = run.text
  if (run.code) node = <code>{node}</code>
  if (run.italic) node = <em>{node}</em>
  if (run.bold) node = <b>{node}</b>
  if (run.href) {
    return isInternal(run.href) ? (
      <Link className="a2-ilink" to={run.href}>
        {node}
      </Link>
    ) : (
      <a className="a2-ilink" href={run.href}>
        {node}
      </a>
    )
  }
  return node
}
