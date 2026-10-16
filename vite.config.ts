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

import react, {reactCompilerPreset} from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import mdx from '@mdx-js/rollup'
import rehypeShiki from '@shikijs/rehype'
import tailwindcss from '@tailwindcss/vite'
import remarkGfm from 'remark-gfm'
import {execFile} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {defineConfig, type Plugin} from 'vite'

// Regenerates public/rss.xml when content data changes during `npm run dev`.
function rssPlugin(): Plugin {
  const run = () =>
    execFile(
      process.execPath,
      [
        '--experimental-strip-types',
        '--no-warnings',
        'scripts/generate-rss.mjs',
      ],
      (error, _stdout, stderr) => {
        if (error) console.error(stderr)
      },
    )
  return {
    name: 'swemre-rss',
    apply: 'serve',
    configureServer(server) {
      server.watcher.on('change', file => {
        if (/[\\/]src[\\/](database|config)[\\/]/.test(file)) run()
      })
    },
  }
}

// The block views shared with swemre-cms live next to both projects
const sharedBlocks = fileURLToPath(
  new URL('../swemre-blocks/src/index.ts', import.meta.url),
)

export default defineConfig({
  resolve: {
    alias: {'swemre-blocks': sharedBlocks},
    // One React for the site and the shared package
    dedupe: ['react', 'react-dom'],
  },
  server: {fs: {allow: ['..']}},
  plugins: [
    rssPlugin(),
    tailwindcss(),
    // MDX must run before the React plugin so JSX output gets transformed.
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: {light: 'github-light', dark: 'github-dark-dimmed'},
              defaultColor: false,
            },
          ],
        ],
      }),
    },
    react({include: /\.(mdx|js|jsx|ts|tsx)$/}),
    babel({presets: [reactCompilerPreset()]}),
  ],
})
