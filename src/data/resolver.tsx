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
// URL -> ResolvedRoute -> template, inside the site shell. Owner: agent C.
//   /                       -> publication "home"
//   /articles/topic/:term   -> publication "topic" (template topic, params.term)
//   /:a                     -> publication :a
//   /:a/:b                  -> publication :b, then its canonical path must equal the URL
//   deeper, or unknown      -> not-found (notFoundKind from the first segment)
//   /sp/:slug               -> redirect to /policies/:slug; API 301s (e.g. /about) are followed
//                              by fetch and end on the canonical path of the target
//   API 503 / unreachable   -> unavailable (logo bar, no footer); other API 5xx -> error (requestId)
import {
  Component,
  createElement,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {Navigate, useLocation, useNavigationType} from 'react-router-dom'
import {SiteShell} from '../chrome/index.tsx'
import {FallbackNotice} from '../chrome/FallbackNotice.tsx'
import {SITE_URL} from './env.ts'
import type {ResolvedRoute} from '../contract/templates.ts'
import {ErrorTemplate} from '../templates/error/index.tsx'
import {loadTemplate, loadedTemplate} from './templates.ts'
import {
  FULL,
  failure,
  requestId,
  resolvePath,
  type Resolution,
} from './resolve.ts'
import {LOCALES, locale, localeHref, t, type Locale} from '../i18n/index.ts'

function setHead(route: ResolvedRoute) {
  const pub = route.publication
  const title = pub
    ? (pub.seoTitle ?? pub.title)
    : route.template === 'not-found'
      ? t('notFound.mark')
      : ''
  document.title = !title
    ? 'SWEMRE'
    : title.includes('SWEMRE')
      ? title
      : `${title} · SWEMRE`
  const desc = pub?.seoDescription ?? pub?.excerpt
  const meta = document.querySelector('meta[name="description"]')
  if (meta && desc) meta.setAttribute('content', desc)
  // hreflang: only the languages this publication really has (slugs are shared across them).
  for (const el of document.querySelectorAll('link[rel="alternate"][hreflang]'))
    el.remove()
  for (const v of pub?.languageVersions ?? []) {
    if (!LOCALES.includes(v.locale as Locale)) continue
    const link = document.createElement('link')
    link.rel = 'alternate'
    link.hreflang = v.locale
    link.href = SITE_URL + localeHref(v.locale as Locale, route.path)
    document.head.append(link)
  }
}

export function RouteResolver() {
  const location = useLocation()
  const navType = useNavigationType()
  const [resolved, setResolved] = useState<{path: string; result: Resolution}>()

  useEffect(() => {
    let alive = true
    resolvePath(location.pathname)
      .then(async result => {
        // The template's chunk loads before the route shows (the old page stays meanwhile).
        if ('route' in result) await loadTemplate(result.route.template)
        return result
      })
      .then(
        result => alive && setResolved({path: location.pathname, result}),
        (e: unknown) =>
          alive &&
          setResolved({
            path: location.pathname,
            result: failure(location.pathname, e),
          }),
      )
    return () => {
      alive = false
    }
  }, [location.pathname])

  const current =
    resolved?.path === location.pathname ? resolved.result : undefined
  // Back and forward keep their position: SiteShell restores it, so only new pages go to the top.
  useEffect(() => {
    if (current && 'route' in current && !location.hash && navType !== 'POP')
      window.scrollTo(0, 0)
  }, [current, location.hash, navType])

  if (current && 'redirect' in current) {
    return (
      <Navigate
        replace
        to={{
          pathname: current.redirect,
          search: location.search,
          hash: location.hash,
        }}
      />
    )
  }
  // While a new path resolves, the previous page stays on screen (no blank flash).
  const shown =
    current ??
    (resolved && 'route' in resolved.result ? resolved.result : undefined)
  if (!shown || !('route' in shown))
    return <SiteShell chrome={FULL}>{null}</SiteShell>

  const route: ResolvedRoute = {
    ...shown.route,
    params: {
      ...Object.fromEntries(new URLSearchParams(location.search)),
      ...shown.params,
    },
  }
  return <RouteView route={route} />
}

function RouteView({route}: {route: ResolvedRoute}) {
  useEffect(() => setHead(route), [route.path, route.publication]) // eslint-disable-line react-hooks/exhaustive-deps
  // A table lookup, not a component made in render: the loader caches one component per key.
  const template = loadedTemplate(route.template) ?? ErrorTemplate
  const shown = route.publication?.locale ?? locale
  return (
    <SiteShell chrome={route.chrome}>
      <ErrorBoundary key={route.path} path={route.path}>
        {/* No lang wrapper on a fallback: the template mixes the page's text with this
            language's labels, and a wrapper would uppercase those labels by English rules. */}
        {createElement(template, {route})}
      </ErrorBoundary>
      <FallbackNotice key={`fallback:${route.path}`} shown={shown} />
    </SiteShell>
  )
}

/** A render crash shows the 500 board in place of the page; the shell stays. */
export class ErrorBoundary extends Component<
  {path: string; children: ReactNode},
  {requestId?: string}
> {
  state: {requestId?: string} = {}

  static getDerivedStateFromError() {
    return {requestId: requestId()}
  }

  componentDidCatch(error: unknown) {
    console.error('[swemre] render error', error)
  }

  render() {
    if (!this.state.requestId) return this.props.children
    return (
      <ErrorTemplate
        route={{
          template: 'error',
          path: this.props.path,
          params: {requestId: this.state.requestId},
          chrome: FULL,
        }}
      />
    )
  }
}
