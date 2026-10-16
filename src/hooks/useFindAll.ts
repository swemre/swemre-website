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

import {useCallback} from 'react'
import type {AsyncResult, Entity, SwemreService} from '../types/type'
import {useAsyncData} from './useAsyncData'

export function useFindAll<T extends Entity>(
  service: SwemreService<T>,
): AsyncResult<T[]> {
  const loader = useCallback(() => service.findAll(), [service])
  return useAsyncData(loader)
}
