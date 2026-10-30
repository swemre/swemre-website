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

// 500 (boards 500, 4K 500): the status page with the request id from route.params.requestId,
// Try again (reloads), Home and Articles.
import type {TemplateProps} from '../../contract/templates.ts'
import {Button} from '../../design/index.tsx'
import {CodeMark, StatusHero, StatusLink} from '../parts/status.tsx'
import {t} from '../../i18n/index.ts'

function reload() {
  window.location.reload()
}

export function ErrorTemplate({route}: TemplateProps) {
  const id = route.params.requestId
  return (
    <StatusHero
      hue="blue"
      railLabel="5e7e500"
      mark={
        <CodeMark
          code="500"
          color="var(--a2-err-text)"
          glow="var(--a2-err-rgb)"
        />
      }
      markLabel={t('error.mark')}
      markColor="var(--a2-err-text)"
      eyebrow={t('error.eyebrow', {code: 500})}
      detail={id ? t('error.requestId', {id}) : undefined}
      title={t('error.title')}
      lead={t('error.lead')}
      actions={
        <>
          <Button
            kind="primary"
            label={t('form.retry')}
            iconLeft="refresh"
            onClick={reload}
          />
          <StatusLink to="/">{t('nav.home')}</StatusLink>
          <StatusLink to="/articles">{t('nav.articles')}</StatusLink>
        </>
      }
    />
  )
}
