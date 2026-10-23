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

import {siteEnv} from '../config/env.ts'
import type {
  PagedContent,
  PostListQuery,
  PublicApi,
  PublicPost,
  SiteEnv,
  SubmittedForm,
} from '../types/type'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Every path of the public API the website and its build scripts use is built here, so moving
// to the channel API (PRS-000443) changes this file only
export function createPublicApi(env: SiteEnv): PublicApi {
  const root = `/public/v1/workspaces/${encodeURIComponent(env.workspaceKey)}`

  async function request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T | undefined> {
    const headers: Record<string, string> = {Accept: 'application/json'}
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (env.readKey) headers['X-Read-Key'] = env.readKey
    const response = await fetch(`${env.apiBase}${root}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: method === 'GET' ? AbortSignal.timeout(env.timeoutMs) : undefined,
    })

    if (response.status === 404 || response.status === 204) return undefined

    const text = await response.text()
    const json: unknown = text ? JSON.parse(text) : undefined
    if (!response.ok) {
      const message =
        json && typeof json === 'object' && 'message' in json
          ? String((json as {message: unknown}).message)
          : response.statusText
      throw new ApiError(response.status, message)
    }
    return json as T
  }

  const listQuery = (type: string, query: PostListQuery) => {
    const params = new URLSearchParams({type, size: String(query.size ?? 100)})
    if (query.sortBy) params.set('sort-by', query.sortBy)
    if (query.direction) params.set('direction', query.direction)
    return params.toString()
  }

  return {
    async listPosts(type, query = {}) {
      const page = await request<PagedContent<PublicPost>>(
        'GET',
        `/posts?${listQuery(type, query)}`,
      )
      return page?.content ?? []
    },

    getPost(type, slug) {
      return request<PublicPost>(
        'GET',
        `/posts/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`,
      )
    },

    // A 404 means the form does not exist, so no confirmation is a failure
    async submitForm(form, fields) {
      const submitted = await request<SubmittedForm>(
        'POST',
        `/forms/${encodeURIComponent(form)}/submissions`,
        {fields},
      )
      if (!submitted) {
        throw new ApiError(404, `Form ${form} did not confirm the submission`)
      }
      return submitted
    },

    async presence() {
      const status = await request<{online: boolean}>('GET', '/presence')
      return status?.online === true
    },

    async sendChatMessage<T>(publicToken: string | undefined, text: string) {
      const remote = await request<T>(
        'POST',
        publicToken
          ? `/conversations/${encodeURIComponent(publicToken)}/message`
          : '/conversations',
        {text},
      )
      if (!remote) throw new ApiError(404, 'conversation was not found')
      return remote
    },

    getConversation<T>(publicToken: string) {
      return request<T>(
        'GET',
        `/conversations/${encodeURIComponent(publicToken)}`,
      )
    },

    conversationSocketUrl(publicToken) {
      return `${env.apiBase.replace(/^http/, 'ws')}${root}/conversations/${encodeURIComponent(publicToken)}/ws`
    },

    async recordPageView(view) {
      await request('POST', '/page-views', view)
    },
  }
}

export const publicApi: PublicApi = createPublicApi(siteEnv)
