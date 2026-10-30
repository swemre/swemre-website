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

/* eslint-disable react-refresh/only-export-components -- the public barrel exports a hook too */
// Site chrome: shell, nav, mega menus, mobile menu, footer, quick search. Owner: agent A.
export {SiteShell} from './SiteShell.tsx'
export {useChrome, sectionOf, type ChromeApi, type MegaKey} from './context.ts'
