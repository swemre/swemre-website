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

import {useContext} from 'react'
import {SearchDialogContext} from '../context/SearchDialogContext'
import type {SearchDialogContextValue} from '../types/type'

export function useSearchDialog(): SearchDialogContextValue {
  const value = useContext(SearchDialogContext)
  if (!value) {
    throw new Error('useSearchDialog requires <SearchDialogProvider>')
  }
  return value
}
