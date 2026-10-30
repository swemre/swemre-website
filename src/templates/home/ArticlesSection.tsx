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

// "0x01 // writing": the latest four articles, with the loading, empty and error boards.
import type {ArticleSummary, Loadable} from '../../contract/view.ts'
import {Split} from './kit/layout.tsx'
import {Rail} from './kit/Rail.tsx'
import {SectionBg} from './kit/SectionBg.tsx'
import {Skel, StatePanel} from './kit/StatePanel.tsx'
import {ArticleRow, Button, SectionHeader, TextLink} from './kit/ui.ts'
import {useV} from './kit/vp.ts'

function RowSkeleton({first}: {first: boolean}) {
  return (
    <div className="a2-arow" aria-hidden="true">
      <div className="a2-adate" style={{paddingTop: 4}}>
        <Skel w={96} h={12} />
      </div>
      <div>
        <Skel w="64%" h={first ? 28 : 20} />
        <Skel w="94%" h={14} style={{marginTop: 16}} />
        <Skel w="72%" h={14} style={{marginTop: 8}} />
        <div style={{display: 'flex', gap: 16, marginTop: 16}}>
          <Skel w={160} h={12} />
          <Skel w={72} h={12} />
        </div>
      </div>
      <div>
        <Skel w={18} h={18} r={4} />
      </div>
    </div>
  )
}

function Body({state}: {state: Loadable<ArticleSummary[]>}) {
  const v = useV()
  const gap = v(40, 48, 64)
  switch (state.status) {
    case 'loading':
      return (
        <>
          <span className="a2-sr" role="status">
            Loading articles
          </span>
          <div style={{display: 'flex', flexDirection: 'column', gap}}>
            {[0, 1, 2, 3].map(i => (
              <RowSkeleton key={i} first={i === 0} />
            ))}
          </div>
        </>
      )
    case 'empty':
      return (
        <StatePanel
          hue="blue"
          icon="file-text"
          title="No articles yet"
          copy="The first article is still being written. Subscribe or follow the RSS feed to get it the day it is out."
          command="ls ~/articles"
          result="0 results"
          actions={
            <>
              <Button
                label="Follow by RSS"
                kind="secondary"
                iconLeft="rss"
                href="/rss.xml"
              />
              <TextLink label="Subscribe" href="/newsletter" />
            </>
          }
        />
      )
    case 'error':
      return (
        <StatePanel
          icon="cloud-off"
          title="Articles could not be loaded"
          copy="The server did not answer in time. The articles are still there; try again in a moment."
          command="GET /api/public/v2/channels/swemre/articles"
          result="503 Service Unavailable"
          actions={
            <>
              <Button
                label="Try again"
                kind="secondary"
                iconLeft="refresh"
                onClick={state.retry}
              />
              <TextLink label="All articles" href="/articles" />
            </>
          }
        />
      )
    case 'ready':
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap}}>
          {state.data.slice(0, 4).map((a, i) => (
            <ArticleRow key={a.slug} article={a} feature={i === 0} />
          ))}
        </div>
      )
  }
}

export function ArticlesSection({state}: {state: Loadable<ArticleSummary[]>}) {
  return (
    <section className="a2-sec" data-cut aria-labelledby="home-articles">
      <SectionBg
        hue="blue"
        at={[16, 36]}
        second={{at: [82, 12]}}
        texture="dots"
      />
      <Rail from="blue" to="blue" node={[69, 95, 130, 166]} label="c0ffee1" />
      <div className="a2-c">
        <Split
          spans={[1, 4, 6, 7]}
          left={
            <SectionHeader
              id="home-articles"
              number={['01', '0x', '', 'blue']}
              eyebrow="writing"
              title="Latest articles"
              copy="Long-form notes on Java, React and architecture, written after the thing works."
              link={['All articles', '/articles']}
            />
          }
          right={<Body state={state} />}
        />
      </div>
    </section>
  )
}
