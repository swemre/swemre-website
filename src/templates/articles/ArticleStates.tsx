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
import {StateNumber, StatePanel} from '../home/kit/StatePanel.tsx'
import type {FilterState} from './model.ts'
import {t} from '../../i18n/index.ts'

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
            <StateNumber
              prefix="E"
              digits="503"
              error
              line={t('state.loadError')}
            />
          }
        >
          <StatePanel
            icon="cloud-off"
            title={t('articles.error.title')}
            copy={t('articles.error.copy')}
            command="GET /api/public/v2/channels/swemre/articles"
            result="503 Service Unavailable"
            actions={
              <>
                <Button
                  label={t('form.retry')}
                  iconLeft="refresh"
                  onClick={retry}
                />
                <Button
                  label={t('state.browseProjects')}
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
      label={t('articles.showAll')}
      iconLeft="arrow-left"
      onClick={onShowAll}
    />
  )
  const rss = (
    <Button
      label={t('articles.followRss')}
      kind="ghost"
      iconLeft="rss"
      href="/rss.xml"
    />
  )
  const panel = saved ? (
    <StatePanel
      hue="blue"
      icon="bookmark"
      title={t('articles.saved.empty.title')}
      copy={t('articles.saved.empty.copy')}
      command="ls ~/articles --saved"
      result={t('qs.results', {count: 0})}
      actions={showAll}
    />
  ) : topic ? (
    <StatePanel
      hue="blue"
      icon="hash"
      title={t('articles.topic.empty.title', {name})}
      copy={t('articles.topic.empty.copy', {name})}
      command={`ls ~/articles --topic ${topic}`}
      result={t('qs.results', {count: 0})}
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
      title={t('articles.empty.title')}
      copy={t('articles.empty.copy')}
      command="ls ~/articles"
      result={t('qs.results', {count: 0})}
      actions={
        <>
          {rss}
          <Button
            label={t('nav.subscribe')}
            kind="secondary"
            iconLeft="mail"
            href="/newsletter"
          />
        </>
      }
    />
  )
  const line = saved
    ? t('articles.count.saved', {count: 0})
    : topic
      ? t('articles.count.in', {count: 0, name})
      : t('articles.count', {count: 0})
  return (
    <ListSection label="empty">
      <StateLayout number={<StateNumber prefix="0" digits="0" line={line} />}>
        {panel}
        {topic && related.length > 0 && (
          <ChipRow label={t('articles.relatedTopics')}>
            {related.map(tp => (
              <Chip
                key={tp.slug}
                label={tp.name}
                count={tp.count}
                onClick={() => onTopic(tp.slug)}
              />
            ))}
          </ChipRow>
        )}
      </StateLayout>
    </ListSection>
  )
}
