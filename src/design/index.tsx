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

// Public API of the design system. Owner: agent A. Everyone else imports from here only.
/* eslint-disable react-refresh/only-export-components -- the public barrel exports hooks too */
import type {ReactNode} from 'react'
import type {Hue} from '../contract/view.ts'
import {ROOT_CLASS, useViewport} from './context.ts'

export {AppProviders} from './providers.tsx'
export {
  useTheme,
  useViewport,
  useVp,
  useCompact,
  useReducedMotion,
  viewportOf,
  ROOT_CLASS,
  type Theme,
  type Viewport,
} from './context.ts'

/** The root of every page: sets a2-root and the viewport class (a2-m a2-cmp, a2-t a2-cmp, a2-d,
 * a2-4k). Rendered once, by SiteShell. hue sets data-hue for page-level hue styling. */
export function Root({
  hue,
  children,
  className,
}: {
  hue?: Hue
  children: ReactNode
  className?: string
}) {
  const vp = useViewport()
  return (
    <div
      className={`a2-root ${ROOT_CLASS[vp]}${className ? ` ${className}` : ''}`}
      data-hue={hue}
    >
      {children}
    </div>
  )
}

export {Icon, type IconName} from './components/Icon.tsx'
export {Anchor, type AnchorProps} from './components/Link.tsx'
export {Button, type ButtonProps} from './components/Button.tsx'
export {
  TextLink,
  Chip,
  Badge,
  Kbd,
  Tags,
  BadgeList,
  type TextLinkProps,
  type ChipProps,
  type BadgeProps,
} from './components/Text.tsx'
export {
  Field,
  Checkbox,
  type FieldProps,
  type FieldState,
  type CheckboxProps,
} from './components/Field.tsx'
export {
  StatusLine,
  SubmitRow,
  Banner,
  type StatusLineProps,
  type SubmitRowProps,
  type BannerProps,
} from './components/Status.tsx'
export {
  SectionHeader,
  SectionNumber,
  Eyebrow,
  type SectionHeaderProps,
} from './components/SectionHeader.tsx'
export {CodeCover, ImageCover, GlyphCover} from './components/Cover.tsx'
export {
  ArticleCard,
  ArticleRow,
  type ArticleCardProps,
  type ArticleRowProps,
} from './components/Article.tsx'
export {
  ProjectCard,
  StatusBadge,
  type ProjectCardProps,
} from './components/Project.tsx'
export {StatePanel, type StatePanelProps} from './components/StatePanel.tsx'
export {
  Skeleton,
  Skel,
  LoadingStatus,
  type SkeletonProps,
  type SkeletonPattern,
} from './components/Skeleton.tsx'
export {
  Texture,
  Glow,
  Grain,
  SectionBg,
  TopGround,
  Rail,
  type TextureKind,
  type RailProps,
} from './components/Decor.tsx'
export {
  PageHeader,
  Crumbs,
  type PageHeaderProps,
} from './components/PageHeader.tsx'
export {
  Card,
  IconTile,
  LinkCard,
  CodePanel,
  Prompt,
  Table,
  KeyValue,
  type CardProps,
  type PromptProps,
  type TableProps,
} from './components/Card.tsx'
export {Receipt, type ReceiptProps} from './components/Receipt.tsx'
export {
  hueRgb,
  hueVar,
  hueAt,
  formatDate,
  cx,
  HUES,
  badgeStyle,
  hueCardStyle,
  RAIL_X,
  railNodeStyle,
  glyphFor,
  articleHue,
  isExternal,
  projectHue,
  projectGlyph,
  relativeTime,
  type RailNode,
} from './components/util.ts'
