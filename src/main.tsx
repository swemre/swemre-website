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

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import './design/styles/index.css'
import {App} from './App.tsx'
import {basename, htmlLang} from './i18n/index.ts'
import {SITE_URL} from './data/env.ts'

// The API only accepts the site's own origin, so www.<site> moves to the site address
const site = new URL(SITE_URL)
if (location.hostname === `www.${site.hostname}`) {
  const {pathname, search, hash} = location
  location.replace(`${site.origin}${pathname}${search}${hash}`)
} else {
  // The language is the URL prefix (/tr/...); the router works below it.
  document.documentElement.lang = htmlLang
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}
