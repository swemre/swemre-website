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

import {useEffect} from 'react'
import {matchPath, Outlet, useLocation} from 'react-router-dom'
import {Dock} from '../components/Dock'
import {ErrorBoundary} from '../components/ErrorBoundary'
import {ErrorPage} from '../components/ErrorPage'
import {Footer} from '../components/Footer'
import {Navbar} from '../components/Navbar'
import {SkipLink} from '../components/SkipLink'
import {recordPageView} from '../services/analytics'
import {cn} from '../utils/cn'

const overlayRoutes = [
  '/',
  '/articles',
  '/articles/:slug',
  '/projects',
  '/projects/:slug',
]

export function SiteLayout() {
  const {pathname} = useLocation()
  const overCover = overlayRoutes.some(route => matchPath(route, pathname))

  useEffect(() => {
    void recordPageView(pathname)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <Navbar overCover={overCover} />
      <div
        className={cn('flex min-h-0 flex-1 flex-col', !overCover && 'pt-nav')}
      >
        <ErrorBoundary
          scope="page"
          fallback={<ErrorPage />}
          resetKey={pathname}
        >
          <Outlet />
        </ErrorBoundary>
      </div>
      <Footer />
      <ErrorBoundary scope="dock" fallback={null}>
        <Dock />
      </ErrorBoundary>
    </div>
  )
}
