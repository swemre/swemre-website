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

// Block dispatch: renders a run of blocks in the markup of one board variant.
import type {ReactNode} from 'react'
import type {Block, RichText} from '../../contract/blocks.ts'
import {
  BulletList,
  Callout,
  Code,
  FactList,
  FactRows,
  FactStrip,
  Heading,
  Image,
  LinkCards,
  Quote,
  StackItems,
  Table,
  Timeline,
  type Variant,
} from './blocks.tsx'
import {Faq} from '../parts/faq.tsx'
import {Rich} from './rich.tsx'

/** Renders a run of blocks; consecutive list items become one list. */
export function Blocks({blocks, variant}: {blocks: Block[]; variant: Variant}) {
  const out: ReactNode[] = []
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.type === 'bulleted' || b.type === 'numbered') {
      const items: RichText[] = []
      while (i < blocks.length && blocks[i].type === b.type) {
        items.push((blocks[i] as Extract<Block, {type: 'bulleted'}>).props.text)
        i++
      }
      i--
      out.push(
        <BulletList
          key={b.id}
          items={items}
          numbered={b.type === 'numbered'}
        />,
      )
      continue
    }
    out.push(<BlockView key={b.id} block={b} variant={variant} />)
  }
  return <>{out}</>
}

export function BlockView({
  block: b,
  variant,
}: {
  block: Block
  variant: Variant
}) {
  switch (b.type) {
    case 'paragraph':
      return (
        <p>
          <Rich text={b.props.text} />
        </p>
      )
    case 'heading':
      return <Heading p={b.props} />
    case 'bulleted':
    case 'numbered':
      return (
        <BulletList items={[b.props.text]} numbered={b.type === 'numbered'} />
      )
    case 'quote':
      return <Quote p={b.props} />
    case 'callout':
      return <Callout p={b.props} />
    case 'code':
      return <Code p={b.props} numbered={variant === 'article'} />
    case 'image':
      return <Image p={b.props} />
    case 'divider':
      return <div className="a2-hr" role="separator" />
    case 'table':
      return <Table p={b.props} variant={variant} />
    case 'section':
      return (
        <div>
          <span className="a2-eyebrow">// {b.props.eyebrow}</span>
          <h2 className="a2-h2" style={{marginTop: 16}}>
            {b.props.title}
          </h2>
          {b.props.copy && <p className="a2-body">{b.props.copy}</p>}
        </div>
      )
    case 'facts':
      if (b.props.layout === 'strip')
        return <FactStrip title={b.props.title} facts={b.props.facts} />
      if (b.props.layout === 'rows') return <FactRows facts={b.props.facts} />
      return <FactList facts={b.props.facts} />
    case 'stack':
      return <StackItems items={b.props.items} />
    case 'links':
      return <LinkCards p={b.props} hue="blue" />
    case 'timeline':
      return <Timeline p={b.props} variant={variant} />
    case 'faq':
      return <Faq items={b.props.items} />
  }
}

/**
 * The article body (.p2-prose). Paragraphs before the first heading are the lead (the board's
 * a2-lead in text-hi under the cover).
 */
export function BlocksView({
  blocks,
  variant = 'article',
}: {
  blocks: Block[]
  variant?: Variant
}) {
  const firstHeading = blocks.findIndex(b => b.type === 'heading')
  const intro = firstHeading < 0 ? [] : blocks.slice(0, firstHeading)
  const leadOnly = intro.length > 0 && intro.every(b => b.type === 'paragraph')
  const rest = leadOnly ? blocks.slice(firstHeading) : blocks
  return (
    <>
      {leadOnly &&
        intro.map(b => (
          <p
            key={b.id}
            className="a2-lead"
            style={{color: 'var(--a2-text-hi)', marginTop: 48}}
          >
            <Rich
              text={(b as Extract<Block, {type: 'paragraph'}>).props.text}
            />
          </p>
        ))}
      <Blocks blocks={rest} variant={variant} />
    </>
  )
}
