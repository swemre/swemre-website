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
import {ResumeModalContext} from '../context/ResumeModalContext'
import type {ResumeModalContextValue} from '../types/type'

export function useResumeModal(): ResumeModalContextValue {
  const value = useContext(ResumeModalContext)
  if (!value) throw new Error('useResumeModal requires <ResumeModalProvider>')
  return value
}
