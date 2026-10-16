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

import {useEffect, useState} from 'react'
import type {SearchSettled} from '../types/type'
import {useService} from './useService'

export function useSearchResults(query: string) {
  const search = useService('search')
  const [settled, setSettled] = useState<SearchSettled | null>(null)

  useEffect(() => {
    let live = true
    void search.search(query).then(results => {
      if (live) setSettled({query, results})
    })
    return () => {
      live = false
    }
  }, [search, query])

  return {
    results: settled?.results ?? [],
    loading: settled?.query !== query,
  }
}
