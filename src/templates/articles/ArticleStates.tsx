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

// The Articles empty and error states (boards Articles-empty, Articles-error). The empty copy is
// generated from the active filter: a topic ("Nothing on Kotlin yet"), the saved list, or no
// articles at all.
import type {TermRef} from '../../contract/view.ts'
import {Button, Chip} from '../../design/index.tsx'
import {ChipRow, ListSection, StateLayout} from '../home/kit/list.tsx'
import {HashIcon, StateNumber, StatePanel} from '../home/kit/StatePanel.tsx'
import type {FilterState} from './model.ts'

export function ArticleStates({
  kind,
  retry,
  filter,
  related,
  onShowAll,
  onTopic,
}: {
  kind: 'empty' | 'error'
  retry?: () => void
  filter: FilterState
  related: TermRef[]
  onShowAll(): void
  onTopic(slug: string): void
}) {
  if (kind === 'error')
    return (
      <ListSection label="error">
        <StateLayout
          number={
            <StateNumber prefix="E" digits="503" error line="Load error" />
          }
        >
          <StatePanel
            icon="cloud-off"
            title="Articles could not be loaded"
            copy="The server did not answer in time. Check your connection and try again; the articles are still there."
            command="GET /api/public/v2/channels/swemre/articles"
            result="503 Service Unavailable"
            actions={
              <>
                <Button label="Try again" iconLeft="refresh" onClick={retry} />
                <Button
                  label="Browse projects"
                  kind="secondary"
                  iconLeft="folder"
                  href="/projects"
                />
              </>
            }
          />
        </StateLayout>
      </ListSection>
    )

  const {topic, topicName: name, saved} = filter
  const showAll = (
    <Button
      label="Show all articles"
      iconLeft="arrow-left"
      onClick={onShowAll}
    />
  )
  const rss = (
    <Button label="Follow by RSS" kind="ghost" iconLeft="rss" href="/rss.xml" />
  )
  const panel = saved ? (
    <StatePanel
      hue="blue"
      icon="bookmark"
      title="No saved articles yet"
      copy="Save an article with the bookmark on its page and it shows up here. Saved articles stay in this browser."
      command="ls ~/articles --saved"
      result="0 results"
      actions={showAll}
    />
  ) : topic ? (
    <StatePanel
      hue="blue"
      icon={<HashIcon />}
      title={`Nothing on ${name} yet`}
      copy={`No article is tagged ${name} so far. Clear the filter to see everything, or follow the RSS feed to hear when the first one is out.`}
      command={`ls ~/articles --topic ${topic}`}
      result="0 results"
      actions={
        <>
          {showAll}
          {rss}
        </>
      }
    />
  ) : (
    <StatePanel
      hue="blue"
      icon="file-text"
      title="No articles yet"
      copy="The first article is still being written. Subscribe or follow the RSS feed to get it the day it is out."
      command="ls ~/articles"
      result="0 results"
      actions={
        <>
          {rss}
          <Button
            label="Subscribe"
            kind="secondary"
            iconLeft="mail"
            href="/newsletter"
          />
        </>
      }
    />
  )
  const line = saved
    ? '0 saved articles'
    : topic
      ? `0 articles in ${name}`
      : '0 articles'
  return (
    <ListSection label="empty">
      <StateLayout number={<StateNumber prefix="0" digits="0" line={line} />}>
        {panel}
        {topic && related.length > 0 && (
          <ChipRow label="Related topics">
            {related.map(t => (
              <Chip
                key={t.slug}
                label={t.name}
                count={t.count}
                onClick={() => onTopic(t.slug)}
              />
            ))}
          </ChipRow>
        )}
      </StateLayout>
    </ListSection>
  )
}
