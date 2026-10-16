---
name: new-song
description: Add a song to the "Songs I liked" list (songDatabase entry with a verified Spotify track id and artwork) and announce it in the RSS feed through the add-rss-item skill. Use when the owner asks to add a song or shares a Spotify track link.
argument-hint: <spotify track URL or id> [title] [artist]
---

# New song

Add a song from: `$ARGUMENTS`

1. **Track id.** Take the id from `https://open.spotify.com/track/<id>` (drop
   any `?si=…` query). It is 22 base-62 characters.
2. **Verify and fetch details** with Spotify's public oEmbed endpoint (no API
   key needed):

   ```text
   https://open.spotify.com/oembed?url=https://open.spotify.com/track/<id>
   ```

   - A 404 means the id is wrong: stop and ask the owner.
   - `title` is the track name; `thumbnail_url` is the artwork. Use the
     artist the owner gave you, or ask; oEmbed does not always return it.
   - Never invent an id or an artwork URL.
3. **Metadata.** Append to `src/database/songDatabase.ts`:

   ```ts
   {
     id: 's6',
     title: 'Track name',
     artist: 'Artist',
     spotifyId: '<22-char id>',
     artworkUrl: '<thumbnail_url from oEmbed>',
   },
   ```

   Use the next free `s<n>` id. The home page shows the first five songs, so
   ask the owner whether the new song should go first (insert at the top) or
   be appended.
4. **RSS.** Run the **add-rss-item** skill with `song <id>`.
5. **Verify.** `npm run checkstyle`, `npm run build`. Then search for the song
   with Ctrl K in `npm run dev` if you can; playing it is a manual check.
6. **Report** the song id, title, artist and the feed item id.
