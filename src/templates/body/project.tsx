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

// The project body: one a2-sec per `section` block, as on the project board. Split sections put
// the number, eyebrow, title, copy, the stack prompt and link cards on the left (4 of 12 columns)
// and the rest on the right (7 columns from column 6); a section whose content is a card image
// (the architecture diagram) runs full width under a header row.
import type {ReactNode} from 'react'
import type {Block, Hue} from '../../contract/blocks.ts'
import {useViewport} from '../../design/index.tsx'
import {
  Glow,
  Sec,
  Texture,
  type SecDeco,
  type TextureKind,
} from '../parts/deco.tsx'
import {Image, LinkCards, Prompt, SectionNumber, StackItems} from './blocks.tsx'
import {Blocks} from './render.tsx'
import {Rich} from './rich.tsx'

type SectionProps = Extract<Block, {type: 'section'}>['props']
interface Group {
  head: SectionProps
  blocks: Block[]
}

/** Background per section position, cycling as on the board. */
const LOOKS: {
  tex: TextureKind
  x: string
  y: string
  label: string
  second?: [string, string]
}[] = [
  {tex: 'dots', x: '16%', y: '40%', label: 'c0ffee1', second: ['82%', '16%']},
  {tex: 'grid', x: '20%', y: '56%', label: '0b5e55d'},
  {tex: 'lines', x: '50%', y: '60%', label: '5ca1ab1'},
  {tex: 'rings', x: '72%', y: '40%', label: 'faded01'},
  {tex: 'diag', x: '80%', y: '20%', label: 'acce55d'},
]

function groups(blocks: Block[]): Group[] {
  const out: Group[] = []
  for (const b of blocks) {
    if (b.type === 'section') out.push({head: b.props, blocks: []})
    else if (out.length) out[out.length - 1].blocks.push(b)
  }
  return out
}

const isWide = (g: Group) =>
  g.blocks.some(b => b.type === 'image' && b.props.card)

/** The project body sections. `from` is the hue of the rail above (the hero). */
export function ProjectBody({blocks, from}: {blocks: Block[]; from: Hue}) {
  const gs = groups(blocks)
  return (
    <>
      {gs.map((g, i) => {
        const hue = g.head.hue ?? 'blue'
        const prev = i === 0 ? from : (gs[i - 1].head.hue ?? 'blue')
        const look = LOOKS[i % LOOKS.length]
        const wide = isWide(g)
        const deco: SecDeco = {
          rail: {from: prev, hue},
          node: {
            top: wide
              ? {m: 87, t: 103, d: 134, k: 166}
              : {m: 69, t: 95, d: 130, k: 166},
          },
          label: look.label,
          bg: (
            <>
              <Glow hue={hue} x={look.x} y={look.y} a={0.135} />
              {look.second && (
                <Glow
                  hue={hue}
                  x={look.second[0]}
                  y={look.second[1]}
                  a={0.068}
                  size="sm"
                />
              )}
              <Texture kind={look.tex} hue={hue} x={look.x} y={look.y} />
            </>
          ),
        }
        return (
          <Sec key={i} deco={deco}>
            <div className="a2-c">
              {wide ? (
                <WideSection g={g} hue={hue} />
              ) : (
                <SplitSection g={g} hue={hue} />
              )}
            </div>
          </Sec>
        )
      })}
    </>
  )
}

function Header({head, hue}: {head: SectionProps; hue: Hue}) {
  return (
    <>
      <div>
        <SectionNumber number={head.number} hue={hue} />
      </div>
      <div>
        <span className="a2-eyebrow">// {head.eyebrow}</span>
        <h2 className="a2-h2" style={{marginTop: 16}}>
          {head.title}
        </h2>
      </div>
    </>
  )
}

function SplitSection({g, hue}: {g: Group; hue: Hue}) {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const stack = g.blocks.find(b => b.type === 'stack')
  const prompt = stack?.type === 'stack' ? stack.props.prompt : undefined
  const links = g.blocks.filter(b => b.type === 'links')
  const right = g.blocks.filter(b => b.type !== 'links')
  // When the right column opens with prose, the section copy is its lead (overview on the board).
  const copyIsLead = right[0]?.type === 'paragraph' && !!g.head.copy
  const left = (
    <>
      <div
        style={{display: 'flex', flexDirection: 'column', gap: big ? 32 : 24}}
      >
        <Header head={g.head} hue={hue} />
        {g.head.copy && !copyIsLead && <p className="a2-body">{g.head.copy}</p>}
        {links.map(b =>
          b.type === 'links' ? (
            <div key={b.id}>
              <LinkCards p={b.props} hue={hue} wide={vp === 't'} />
            </div>
          ) : null,
        )}
      </div>
      {prompt && (
        <div style={{marginTop: big ? 32 : 24}}>
          <Prompt command={prompt} />
        </div>
      )}
    </>
  )
  const content = (
    <RightColumn blocks={right} lead={copyIsLead ? g.head.copy : undefined} />
  )
  if (!big) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: vp === 'm' ? 48 : 64,
        }}
      >
        <div>{left}</div>
        <div style={{minWidth: 0}}>{content}</div>
      </div>
    )
  }
  return (
    <div className="a2-g12" style={{alignItems: 'start'}}>
      <div style={{gridColumn: '1 / span 4', minWidth: 0}}>{left}</div>
      <div style={{gridColumn: '6 / span 7', minWidth: 0}}>{content}</div>
    </div>
  )
}

/**
 * Right column: leading paragraphs form the prose (the first one as the lead), every other block
 * follows with the section gap above it.
 */
function RightColumn({blocks, lead}: {blocks: Block[]; lead?: string}) {
  const vp = useViewport()
  const gap = vp === 'd' || vp === '4k' ? 64 : 48
  const proseEnd = blocks.findIndex(b => b.type !== 'paragraph')
  const prose = blocks.slice(0, proseEnd < 0 ? blocks.length : proseEnd)
  const rest = blocks.slice(prose.length)
  const parts: ReactNode[] = []
  if (prose.length) {
    const first = lead ? 1 : 0
    parts.push(
      <div key="prose" className="p2-prose">
        {lead && (
          <p className="a2-lead" style={{color: 'var(--a2-text-hi)'}}>
            {lead}
          </p>
        )}
        {prose.map((b, i) =>
          b.type === 'paragraph' ? (
            <p
              key={b.id}
              className={i + first === 0 ? 'a2-lead' : undefined}
              style={i + first === 0 ? {color: 'var(--a2-text-hi)'} : undefined}
            >
              <Rich text={b.props.text} />
            </p>
          ) : null,
        )}
      </div>,
    )
  }
  rest.forEach(b => {
    const node =
      b.type === 'stack' ? (
        <StackItems items={b.props.items} />
      ) : (
        <Blocks blocks={[b]} variant="project" />
      )
    parts.push(
      parts.length === 0 ? (
        <div key={b.id}>{node}</div>
      ) : (
        <div key={b.id} style={{marginTop: gap}}>
          {node}
        </div>
      ),
    )
  })
  return <>{parts}</>
}

function WideSection({g, hue}: {g: Group; hue: Hue}) {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  return (
    <>
      <div
        style={
          big
            ? {
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 64,
                marginBottom: 64,
              }
            : {
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                marginBottom: 48,
              }
        }
      >
        <div>
          <SectionNumber number={g.head.number} hue={hue} />
          <div style={{marginTop: big ? 32 : 24}}>
            <span className="a2-eyebrow">// {g.head.eyebrow}</span>
            <h2 className="a2-h2" style={{marginTop: 16}}>
              {g.head.title}
            </h2>
          </div>
        </div>
        {g.head.copy && (
          <p className="a2-body" style={{maxWidth: 520}}>
            {g.head.copy}
          </p>
        )}
      </div>
      {g.blocks.map(b =>
        b.type === 'image' ? (
          <Image key={b.id} p={b.props} hue={hue} />
        ) : (
          <div key={b.id}>{<Blocks blocks={[b]} variant="project" />}</div>
        ),
      )}
    </>
  )
}
