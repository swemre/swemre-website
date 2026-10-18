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
import {Footer} from '../components/Footer'
import {Navbar} from '../components/Navbar'
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
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    void recordPageView(pathname)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar overCover={overCover} />
      <div
        className={cn('flex min-h-0 flex-1 flex-col', !overCover && 'pt-nav')}
      >
        <Outlet />
      </div>
      <Footer />
      <Dock />
    </div>
  )
}
