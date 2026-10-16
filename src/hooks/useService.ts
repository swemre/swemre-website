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
import {ServiceContext} from '../context/ServiceContext'
import type {ServiceMap} from '../types/type'

export function useService<K extends keyof ServiceMap>(name: K): ServiceMap[K] {
  return useContext(ServiceContext)[name]
}
