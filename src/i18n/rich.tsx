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

// tRich: a text whose placeholders hold elements (a bold count, a link), so word order stays
// with each language: tRich('projects.summary', {total}, {shown: <b>4</b>}).
import {Fragment, type ReactNode} from 'react'
import {t, type TextKey, type TextParams} from './index.ts'

export function tRich(
  key: TextKey,
  params: TextParams,
  slots: Record<string, ReactNode>,
): ReactNode {
  // Slots stay as {name} through t(), then become elements.
  const keep = Object.fromEntries(Object.keys(slots).map(k => [k, `{${k}}`]))
  const text = t(key, {...keep, ...params})
  return text
    .split(/\{(\w+)\}/)
    .map((part, i) =>
      i % 2 === 1 && part in slots ? (
        <Fragment key={i}>{slots[part]}</Fragment>
      ) : (
        part
      ),
    )
}
