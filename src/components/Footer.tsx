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

import {Link} from 'react-router-dom'
import {siteConfig, socialLinks} from '../config/site'
import {Icon} from './Icon'

const iconLink =
  'inline-grid size-8 place-items-center rounded-sm text-fg-muted transition-colors hover:bg-primary-muted hover:text-primary hover:no-underline'

export function Footer() {
  return (
    <footer className="relative border-t border-border-muted bg-canvas-subtle text-sm">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
      />
      <div className="mx-auto flex w-full max-w-wide flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2 pr-28 pl-4 lg:pl-8">
        <ul aria-label="Social media" className="flex items-center gap-1">
          {socialLinks.map(link => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={link.label}
                title={link.label}
                className={iconLink}
              >
                <Icon name={link.icon} size={16} />
              </a>
            </li>
          ))}
        </ul>
        <ul className="flex items-center gap-1">
          <li>
            <a
              href={siteConfig.rssPath}
              aria-label="RSS feed"
              title="RSS feed"
              className={iconLink}
            >
              <Icon name="rss" size={16} />
            </a>
          </li>
          <li>
            <Link
              to={siteConfig.privacyPath}
              aria-label="Privacy policy"
              title="Privacy policy"
              className={iconLink}
            >
              <Icon name="book" size={16} />
            </Link>
          </li>
          <li className="ml-2 text-xs text-fg-subtle">
            © 2026 {siteConfig.brand}
          </li>
        </ul>
      </div>
    </footer>
  )
}
