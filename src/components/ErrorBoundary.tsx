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

import {Component, type ErrorInfo} from 'react'
import type {ErrorBoundaryProps, ErrorBoundaryState} from '../types/type'

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {failed: false, resetKey: this.props.resetKey}

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return {failed: true}
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    if (props.resetKey === state.resetKey) return null
    return {failed: false, resetKey: props.resetKey}
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(`swemre-website: ${this.props.scope} failed`, error, info)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
