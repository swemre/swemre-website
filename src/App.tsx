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

import {Link, Route, Routes} from 'react-router-dom'
import {ChatProvider} from './context/ChatProvider'
import {PlayerProvider} from './context/PlayerProvider'
import {ResumeModalProvider} from './context/ResumeModalProvider'
import {SearchDialogProvider} from './context/SearchDialogProvider'
import {SoundProvider} from './context/SoundProvider'
import ArticlePage from './page/article/ArticlePage'
import ArticlesPage from './page/article/ArticlesPage'
import HomePage from './page/home/HomePage'
import ProjectPage from './page/projects/ProjectPage'
import ProjectsPage from './page/projects/ProjectsPage'
import SpecialPage from './page/sp/SpecialPage'
import {SiteLayout} from './templates/SiteLayout'

function NotFound() {
  return (
    <main className="mx-auto w-full max-w-page px-8 py-16">
      <p className="font-mono text-sm text-fg-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-fg-strong">
        Page not found
      </h1>
      <Link to="/" className="mt-4 inline-block text-primary">
        Back to home
      </Link>
    </main>
  )
}

export default function App() {
  return (
    <SoundProvider>
      <PlayerProvider>
        <ChatProvider>
          <SearchDialogProvider>
            <ResumeModalProvider>
              <Routes>
                <Route element={<SiteLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/articles" element={<ArticlesPage />} />
                  <Route path="/articles/:slug" element={<ArticlePage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:slug" element={<ProjectPage />} />
                  <Route path="/sp/:slug" element={<SpecialPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </ResumeModalProvider>
          </SearchDialogProvider>
        </ChatProvider>
      </PlayerProvider>
    </SoundProvider>
  )
}
