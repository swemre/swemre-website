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
// the number, eyebrow, title, copy, the section prompt, link cards and the call to action on the
// left (4 of 12 columns) and the rest on the right (7 columns from column 6); plain images follow
// the split at full width as screenshots. A section with a card image, an architecture diagram or
// the project pages runs full width under a header row.
import type {CSSProperties, ReactNode} from 'react'
import type {Block, Hue} from '../../contract/blocks.ts'
import {useTheme, useViewport} from '../../design/index.tsx'
import {
  Glow,
  Sec,
  Texture,
  type SecDeco,
  type TextureKind,
} from '../parts/deco.tsx'
import {Image, LinkCards, Prompt, SectionNumber, StackItems} from './blocks.tsx'
import {ArchitectureLink, Cta} from './brand.tsx'
import {Blocks} from './render.tsx'
import {Rich} from './rich.tsx'
import {rgb} from '../parts/vp.ts'

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
  g.blocks.some(
    b =>
      (b.type === 'image' && b.props.card) ||
      b.type === 'architecture' ||
      b.type === 'subpages',
  )

const isScreen = (b: Block) => b.type === 'image' && !b.props.card

/** The prompt drawn in the section header, from the stack, coverage or project pages block. */
function sectionPrompt(blocks: Block[]) {
  for (const b of blocks) {
    if (
      (b.type === 'stack' || b.type === 'coverage' || b.type === 'subpages') &&
      b.props.prompt
    )
      return (
        <Prompt
          command={b.props.prompt}
          cwd={b.type === 'stack' ? undefined : b.props.cwd}
        />
      )
  }
  return null
}

/**
 * The project body sections. `from` is the hue of the rail above (the hero); `host` labels the
 * browser frame of the first screenshot.
 */
export function ProjectBody({
  blocks,
  from,
  host,
}: {
  blocks: Block[]
  from: Hue
  host?: string
}) {
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
                <SplitSection g={g} hue={hue} host={host} />
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

function SplitSection({g, hue, host}: {g: Group; hue: Hue; host?: string}) {
  const vp = useViewport()
  const big = vp === 'd' || vp === '4k'
  const prompt = sectionPrompt(g.blocks)
  const links = g.blocks.filter(b => b.type === 'links')
  const ctas = g.blocks.filter(b => b.type === 'cta')
  const screens = g.blocks.filter(isScreen)
  const right = g.blocks.filter(
    b => b.type !== 'links' && b.type !== 'cta' && !isScreen(b),
  )
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
        {ctas.map(b =>
          b.type === 'cta' ? <Cta key={b.id} p={b.props} /> : null,
        )}
      </div>
      {prompt && <div style={{marginTop: big ? 32 : 24}}>{prompt}</div>}
    </>
  )
  const content = (
    <RightColumn
      blocks={right}
      hue={hue}
      lead={copyIsLead ? g.head.copy : undefined}
    />
  )
  const split = big ? (
    <div className="a2-g12" style={{alignItems: 'start'}}>
      <div style={{gridColumn: '1 / span 4', minWidth: 0}}>{left}</div>
      <div style={{gridColumn: '6 / span 7', minWidth: 0}}>{content}</div>
    </div>
  ) : (
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
  return (
    <>
      {split}
      {screens.length > 0 && <Screens blocks={screens} host={host} />}
    </>
  )
}

/** Screenshots under the split: the first one large in a browser frame, the rest two by two. */
function Screens({blocks, host}: {blocks: Block[]; host?: string}) {
  const vp = useViewport()
  const [first, ...rest] = blocks.flatMap(b =>
    b.type === 'image' ? [b.props] : [],
  )
  const frame = (radius: number): CSSProperties => ({
    borderRadius: radius,
    border: '1px solid var(--a2-line-blue-2)',
    overflow: 'hidden',
    boxShadow: 'var(--a2-shadow-card)',
  })
  const dot: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: 9,
    background: 'var(--a2-line-3)',
  }
  return (
    <>
      <figure style={{margin: `${{m: 48, t: 64, d: 96, '4k': 96}[vp]}px 0 0`}}>
        <div
          className="a2-island"
          style={{
            ...frame(12),
            background: 'var(--a2-code-bg)',
            boxShadow: `var(--a2-shadow-card),0 0 160px -40px ${rgb('blue', 'calc(0.3 * var(--a2-glow-k))')}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderBottom: '1px solid var(--a2-line)',
            }}
          >
            <span style={dot} />
            <span style={dot} />
            <span style={dot} />
            {host && (
              <span className="a2-mono" style={{marginLeft: 16, fontSize: 12}}>
                {host}
              </span>
            )}
          </div>
          <ScreenImage p={first} />
        </div>
        <ScreenCaption text={first.caption} />
      </figure>
      {rest.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${vp === 'm' ? 1 : 2},minmax(0,1fr))`,
            gap: 32,
            marginTop: 32,
          }}
        >
          {rest.map((p, i) => (
            <figure key={i} style={{margin: 0}}>
              <div className="a2-island" style={frame(10)}>
                <ScreenImage p={p} />
              </div>
              <ScreenCaption text={p.caption} />
            </figure>
          ))}
        </div>
      )}
    </>
  )
}

type ImageProps = Extract<Block, {type: 'image'}>['props']

function ScreenImage({p}: {p: ImageProps}) {
  const {theme} = useTheme()
  return (
    <img
      src={theme === 'dark' && p.darkUrl ? p.darkUrl : p.url}
      alt={p.alt}
      style={{display: 'block', width: '100%', height: 'auto'}}
    />
  )
}

function ScreenCaption({text}: {text?: string}) {
  if (!text) return null
  return (
    <figcaption
      className="a2-small"
      style={{marginTop: 16, color: 'var(--a2-text-lo)'}}
    >
      {text}
    </figcaption>
  )
}

/**
 * Right column: leading paragraphs form the prose (the first one as the lead), every other block
 * follows with the section gap above it.
 */
function RightColumn({
  blocks,
  hue,
  lead,
}: {
  blocks: Block[]
  hue: Hue
  lead?: string
}) {
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
        <Blocks blocks={[b]} variant="project" hue={hue} />
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
  const arch = g.blocks.find(b => b.type === 'architecture')
  const aside =
    sectionPrompt(g.blocks) ??
    (arch?.type === 'architecture' ? <ArchitectureLink p={arch.props} /> : null)
  // With an aside (the prompt or a link) the copy sits under the title; otherwise it faces it.
  const copy = g.head.copy && (
    <p
      className="a2-body"
      style={aside ? {marginTop: 16, maxWidth: 620} : {maxWidth: 520}}
    >
      {g.head.copy}
    </p>
  )
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
            {aside && copy}
          </div>
        </div>
        {aside ?? copy}
      </div>
      {g.blocks.map(b =>
        b.type === 'image' ? (
          <Image key={b.id} p={b.props} hue={hue} />
        ) : (
          <div key={b.id}>
            <Blocks blocks={[b]} variant="project" hue={hue} />
          </div>
        ),
      )}
    </>
  )
}
