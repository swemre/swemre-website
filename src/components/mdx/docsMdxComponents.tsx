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

import type {MDXComponents} from 'mdx/types'
import {AnchorHeading} from './AnchorHeading'
import {Callout} from './Callout'
import {CodeBlock} from './CodeBlock'

export const baseMdxComponents: MDXComponents = {
  p: props => <p className="my-4" {...props} />,
  a: props => (
    <a
      className="font-medium text-primary underline-offset-2 hover:underline"
      {...props}
    />
  ),
  strong: props => (
    <strong className="font-semibold text-fg-strong" {...props} />
  ),
  ul: props => (
    <ul
      className="my-4 list-disc space-y-1.5 pl-6 marker:text-fg-subtle"
      {...props}
    />
  ),
  ol: props => (
    <ol
      className="my-4 list-decimal space-y-1.5 pl-6 marker:text-fg-subtle"
      {...props}
    />
  ),
  blockquote: props => (
    <blockquote
      className="my-5 border-l-4 border-border-strong pl-4 text-fg-muted [&>p]:my-2"
      {...props}
    />
  ),
  code: props => (
    <code
      className="rounded-sm border border-border-muted bg-inset px-1.5 py-0.5 font-mono text-sm"
      {...props}
    />
  ),
  pre: CodeBlock,
  hr: props => <hr className="my-8 border-border-muted" {...props} />,
  table: props => (
    <div className="my-5 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: props => (
    <th
      className="border border-border bg-surface-muted px-3 py-2 text-left font-semibold text-fg-strong"
      {...props}
    />
  ),
  td: props => <td className="border border-border px-3 py-2" {...props} />,
  img: props => (
    <img className="my-5 rounded-md border border-border" alt="" {...props} />
  ),
  Callout,
}

export const docsMdxComponents: MDXComponents = {
  ...baseMdxComponents,
  h2: props => (
    <AnchorHeading
      as="h2"
      className="mt-12 mb-4 border-b border-border-muted pb-2 text-2xl font-semibold text-fg-strong"
      {...props}
    />
  ),
  h3: props => (
    <AnchorHeading
      as="h3"
      className="mt-8 mb-3 text-xl font-semibold text-fg-strong"
      {...props}
    />
  ),
}

export const legalMdxComponents: MDXComponents = {
  ...baseMdxComponents,
  h2: props => (
    <AnchorHeading
      as="h2"
      className="mt-10 mb-3 border-t border-border-muted pt-8 text-xl font-semibold text-fg-strong [counter-increment:section] before:mr-2 before:text-primary before:content-[counter(section)'.'] first-of-type:border-t-0 first-of-type:pt-0"
      {...props}
    />
  ),
  h3: props => (
    <AnchorHeading
      as="h3"
      className="mt-6 mb-2 text-base font-semibold text-fg-strong"
      {...props}
    />
  ),
}
