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

import type {Entity, NewEntity} from '../types/type'
import {ArrayService} from './ArrayService'

function readRows<T>(key: string): T[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? (value as T[]) : []
  } catch {
    return []
  }
}

export abstract class LocalStorageService<
  T extends Entity,
> extends ArrayService<T> {
  private readonly key: string

  protected constructor(key: string) {
    super(readRows<T>(key))
    this.key = key
  }

  override async create(data: NewEntity<T>): Promise<T> {
    const row = await super.create(data)
    this.persist()
    return row
  }

  override async update(
    id: string,
    patch: Partial<NewEntity<T>>,
  ): Promise<T | undefined> {
    const row = await super.update(id, patch)
    this.persist()
    return row
  }

  override async remove(id: string): Promise<boolean> {
    const removed = await super.remove(id)
    this.persist()
    return removed
  }

  private persist() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.rows))
    } catch {
      // Storage full or blocked: keep the in-memory copy.
    }
  }
}
