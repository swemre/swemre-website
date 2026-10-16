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
import {serviceRegistry} from '../services/serviceRegistry'
import type {ServiceMap} from '../types/type'
import {ServiceContext} from './ServiceContext'

export function ServiceProvider({
  services = serviceRegistry,
  children,
}: {
  services?: ServiceMap
  children: ReactNode
}) {
  return <ServiceContext value={services}>{children}</ServiceContext>
}
