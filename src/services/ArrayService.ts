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

import type {Entity, NewEntity, SwemreService} from '../types/type'

export abstract class ArrayService<
  T extends Entity,
> implements SwemreService<T> {
  protected readonly rows: T[]
  private listCache?: Promise<T[]>

  // With cacheList the subclass's findAll runs once per session; callers share the in-flight
  // request and get their own copy of the list. An empty list is not kept, because the API
  // services also answer [] when the API is unreachable.
  protected constructor(rows: T[], cacheList = false) {
    this.rows = rows
    if (!cacheList) return
    const load = this.findAll.bind(this) as () => Promise<T[]>
    this.findAll = () => {
      const pending = (this.listCache ??= load().then(
        list => {
          if (list.length === 0) this.listCache = undefined
          return list
        },
        (error: unknown) => {
          this.listCache = undefined
          throw error
        },
      ))
      return pending.then(list => [...list])
    }
  }

  findAll(): Promise<T[]> {
    return Promise.resolve([...this.rows])
  }

  findById(id: string): Promise<T | undefined> {
    return Promise.resolve(this.rows.find(row => row.id === id))
  }

  create(data: NewEntity<T>): Promise<T> {
    const row = {...data, id: crypto.randomUUID()} as T
    this.rows.push(row)
    return Promise.resolve(row)
  }

  update(id: string, patch: Partial<NewEntity<T>>): Promise<T | undefined> {
    const index = this.rows.findIndex(row => row.id === id)
    if (index < 0) return Promise.resolve(undefined)
    this.rows[index] = {...this.rows[index], ...patch}
    return Promise.resolve(this.rows[index])
  }

  remove(id: string): Promise<boolean> {
    const index = this.rows.findIndex(row => row.id === id)
    if (index < 0) return Promise.resolve(false)
    this.rows.splice(index, 1)
    return Promise.resolve(true)
  }
}
