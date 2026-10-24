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
  ChatApiMessage,
  PostListQuery,
  Publication,
  PublicPage,
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

// A v2 publication (docs/public-api-v2.md in swemre-website-api) in the v1 post shape the
// services read: cover, excerpt and body move into fields, a media `alt` becomes `altText`
const fromPublication = (item: Publication): PublicPost => {
  const fields: Record<string, unknown> = {...item.fields}
  if (item.cover) fields.cover = {...item.cover, altText: item.cover.alt}
  if (item.excerpt && fields.summary === undefined) {
    fields.summary = item.excerpt
  }
  if (item.body !== undefined) fields.body = item.body
  return {
    id: item.id,
    typeKey: item.contentType,
    slug: item.slug,
    title: item.title,
    author: item.author ?? '',
    fields,
    terms: (item.terms ?? []).map(term => ({
      id: term.id,
      taxonomy: term.kind,
      name: term.name,
      slug: term.slug,
    })),
    publishedAt: item.publishedAt,
    lastUpdatedAt: item.updatedAt ?? item.publishedAt,
    locale: item.locale,
    languageVersions: item.languageVersions ?? [],
  }
}

const sortPosts = (posts: PublicPost[], query: PostListQuery) => {
  if (!query.sortBy) return posts
  const key = query.sortBy
  const sign = query.direction === 'DESC' ? -1 : 1
  return [...posts].sort(
    (a, b) => sign * String(a[key]).localeCompare(String(b[key])),
  )
}

// Public API v2 chat (docs/public-api-v2.md in swemre-website-api)
interface V2Message {
  id: string
  sender: 'VISITOR' | 'MEMBER'
  text: string
  createdAt: string
}

interface V2Conversation {
  id: string
  visitorToken: string
  messages: V2Message[]
}

const fromV2Message = (item: V2Message): ChatApiMessage => ({
  id: item.id,
  author: item.sender === 'MEMBER' ? 'OWNER' : 'VISITOR',
  text: item.text,
  sentAt: item.createdAt,
})

const splitToken = (token: string) => {
  const dot = token.indexOf('.')
  return {id: token.slice(0, dot), visitorToken: token.slice(dot + 1)}
}

// Every path of the public API the website and its build scripts use is built here: the
// channel API (v2) of the website's channel, which reads only what was published to it
export function createPublicApi(env: SiteEnv): PublicApi {
  const v2 = `/public/v2/channels/${encodeURIComponent(env.channelKey)}`

  async function request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    extraHeaders: Record<string, string> = {},
  ): Promise<T | undefined> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...extraHeaders,
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (env.readKey) {
      headers['X-Read-Key'] = env.readKey
    }
    const response = await fetch(`${env.apiBase}${path}`, {
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

  const size = (query: PostListQuery) => String(query.size ?? 100)

  return {
    async listPosts(type, query = {}) {
      const params = new URLSearchParams({
        'content-type': type,
        locale: env.locale,
        size: size(query),
      })
      if (query.term) params.set('term', query.term)
      const page = await request<PublicPage<Publication>>(
        'GET',
        `${v2}/publications?${params}`,
      )
      return sortPosts((page?.items ?? []).map(fromPublication), query)
    },

    async getPost(type, slug) {
      const item = await request<Publication>(
        'GET',
        `${v2}/publications/${encodeURIComponent(slug)}?${new URLSearchParams({locale: env.locale})}`,
      )
      return item?.contentType === type ? fromPublication(item) : undefined
    },

    // A 404 means the form does not exist, so no confirmation is a failure
    async submitForm(form, fields) {
      const submitted = await request<SubmittedForm>(
        'POST',
        `${v2}/forms/${encodeURIComponent(form)}/submissions`,
        {fields},
      )
      if (!submitted) {
        throw new ApiError(404, `Form ${form} did not confirm the submission`)
      }
      return submitted
    },

    async presence() {
      const status = await request<{online: boolean}>('GET', `${v2}/presence`)
      return status?.online === true
    },

    async sendChatMessage(publicToken, message) {
      if (!publicToken) {
        const started = await request<V2Conversation>(
          'POST',
          `${v2}/conversations`,
          {text: message},
        )
        if (!started) throw new ApiError(404, 'chat is not available')
        return {
          token: `${started.id}.${started.visitorToken}`,
          messages: started.messages.map(fromV2Message),
        }
      }
      const {id, visitorToken} = splitToken(publicToken)
      const sent = await request<V2Message>(
        'POST',
        `${v2}/conversations/${encodeURIComponent(id)}/messages`,
        {text: message},
        {'X-Visitor-Token': visitorToken},
      )
      if (!sent) throw new ApiError(404, 'conversation was not found')
      return (
        (await this.getConversation(publicToken)) ?? {
          token: publicToken,
          messages: [fromV2Message(sent)],
        }
      )
    },

    async getConversation(publicToken) {
      const {id, visitorToken} = splitToken(publicToken)
      const messages = await request<V2Message[]>(
        'GET',
        `${v2}/conversations/${encodeURIComponent(id)}/messages`,
        undefined,
        {'X-Visitor-Token': visitorToken},
      )
      return (
        messages && {
          token: publicToken,
          messages: messages.map(fromV2Message),
        }
      )
    },

    // The channel API has no socket yet, so the chat polls
    conversationSocketUrl() {
      return undefined
    },

    async recordPageView(view) {
      await request('POST', `${v2}/page-views`, view)
    },
  }
}

export const publicApi: PublicApi = createPublicApi(siteEnv)
