---
name: add-rss-item
description: Add an item to the site's RSS feed (src/database/feedDatabase.ts) for a new article, project, song or a free-form note, then regenerate and validate public/rss.xml. Use whenever content is added, when the owner asks to announce something in the feed, or when `npm run rss` reports "has no feed item". The new-article, new-project and new-song skills call this skill as their last content step.
argument-hint: <article|project|song|note> <ref or title> [summary] [link]
---

# Add an RSS item

The feed is generated from an append-only log, `src/database/feedDatabase.ts`
(type `FeedItem` in `src/types/type.d.ts`). `scripts/generate-rss.mjs` resolves
each entry against the content databases and writes `public/rss.xml`. The
generator **fails** if an article, project or song has no feed entry, if a
reference does not resolve, if an id is duplicated or if a date is not ISO
8601 UTC.

Arguments: `$ARGUMENTS`

## Steps

1. **Work out the item.**

   | Kind      | `ref` is                          | Title and link come from          |
   | --------- | --------------------------------- | --------------------------------- |
   | `article` | the article `slug`                | `articleDatabase` → `/articles/<slug>` |
   | `project` | the project `slug`                | `projectDatabase` → `/projects/<slug>` |
   | `song`    | the song `id` (e.g. `s6`)         | `songDatabase` → Spotify track URL |
   | `note`    | no ref; needs `title`, `summary`, optional `link` (absolute URL or site path) | the entry itself |

   For `article`, `project` and `song`, confirm the referenced entry already
   exists in its database. If it does not, stop and add the content first
   (use the matching `new-*` skill).

2. **Choose the id** (permanent; readers use it to detect new items):
   - article: `feed-<article id>` (e.g. `feed-a1f3c9d2`)
   - project: `feed-<project id>` (e.g. `feed-p6`)
   - song: `feed-<song id>` (e.g. `feed-s6`)
   - note: `feed-note-<YYYY-MM-DD>[-n]`
   Check that the id is not already in `feedDatabase`.

3. **Choose `publishedAt`**, ISO 8601 UTC with `Z`
   (`2026-10-15T09:00:00Z`). For articles use the article's `createdAt`.
   For everything else use the current date and time in UTC. Never back-date
   an existing item and never change the date of a published item.

4. **Append** the entry at the **bottom** of `feedDatabase` (the array is
   chronological; the generator sorts newest first):

   ```ts
   {
     id: 'feed-p6',
     kind: 'project',
     ref: 'my-new-project',
     publishedAt: '2026-10-20T09:00:00Z',
   },
   ```

   Notes:

   ```ts
   {
     id: 'feed-note-2026-10-20',
     kind: 'note',
     title: 'Short headline',
     summary: 'One or two sentences.',
     link: '/projects/my-new-project',
     publishedAt: '2026-10-20T09:00:00Z',
   },
   ```

5. **Regenerate and validate**: `npm run rss`. It must print
   `rss.xml written with N items` (N one higher than before). If it prints
   problems, fix them; never delete other entries to make it pass.

6. **Check the output**: the new item is at the top of `public/rss.xml`
   (unless its date is older than existing items) with the right title, link
   and category.

7. Run `npm run checkstyle`. (`npm run build` also regenerates the feed.)

8. **Report** the item id, title, link and the new item count.

## Rules

- Do not edit `public/rss.xml` by hand; it is generated.
- Do not reorder, rename or remove published entries. To retract an item,
  ask the owner first.
- Keep entries free of HTML; the generator escapes text.
- While `npm run dev` runs, a Vite plugin regenerates the feed whenever a file
  in `src/database/` or `src/config/` changes.
