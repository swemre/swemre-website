# Mock API

The website reads all of its content through **SWEPress public API v2**: one website channel,
read with a read key. In development the Vite plugin in `mock/plugin.ts` answers that API from
the seed files in `mock/seed/*.json`. No backend is needed. The same plugin runs on
`npm run preview`.

The mock follows `swemre-website-api/docs/public-api-v2.md`. Where the boards and the real API
disagree, the mock follows the API:

- a wrong read key gets `401`;
- forms answer `201`;
- page numbers start at `0`.

## Switching between mock and live

| Variable              | Mock (default)   | Live                                                       |
| --------------------- | ---------------- | ---------------------------------------------------------- |
| `VITE_API_MODE`       | `mock`           | `live`                                                     |
| `VITE_API_BASE`       | `/api`           | the API origin and path, e.g. `https://api.swemre.com/api` |
| `VITE_CHANNEL_KEY`    | `swemre-website` | the website channel key                                    |
| `VITE_READ_KEY`       | `local-mock`     | the channel's read key                                     |
| `VITE_API_TIMEOUT_MS` | `10000`          | the same                                                   |

Copy `.env.example` to `.env.local` and change the values. In `live` mode the plugin is not
mounted, and every call goes to `VITE_API_BASE`.

The dev switches `?state=`, `?fault=` and `?seed=` work in `dev` and whenever the mode is `mock`.
They do nothing in a live production build.

## Requests

Every path below starts with `{VITE_API_BASE}/public/v2/channels/{channel}`.

Every read sends the `X-Read-Key: <VITE_READ_KEY>` header. Form submissions and media files do
not need it.

The mock gives each answer an `X-Request-Id` header.

### GET /publications

Lists publication summaries, newest first. A summary is a publication without its `body`.

| Query          | Meaning                                                         |
| -------------- | --------------------------------------------------------------- |
| `content-type` | `article`, `project`, `page`, `song`, `author`, `site-settings` |
| `term`         | a term slug (category or tag)                                   |
| `page`         | zero-based page number, default `0`                             |
| `size`         | page size from `1` to `100`, default `20`                       |

```http
GET /api/public/v2/channels/swemre-website/publications?content-type=article&size=1
X-Read-Key: local-mock
```

```json
{
  "items": [
    {
      "id": "34ccd63b-bdf9-5d73-a02c-40edd8b8ac09",
      "documentId": "c172b0f3-…",
      "workId": "86a958fb-…",
      "contentType": "article",
      "locale": "en",
      "slug": "spring-boot-template",
      "title": "A Spring Boot template for new services",
      "excerpt": "The baseline I start every new Spring Boot service from: …",
      "author": "Emre",
      "cover": null,
      "fields": {
        "readingTime": 6,
        "coverStyle": "code",
        "hue": "blue",
        "…": "…"
      },
      "terms": [
        {"id": "…", "kind": "CATEGORY", "name": "backend", "slug": "backend"},
        "…"
      ],
      "section": {
        "id": "…",
        "kind": "CATEGORY",
        "name": "backend",
        "slug": "backend"
      },
      "publishedAt": "2026-10-15T08:00:00Z",
      "updatedAt": "2026-10-15T08:00:00Z",
      "seoTitle": null,
      "seoDescription": "…",
      "canonicalUrl": null,
      "noindex": false,
      "languageVersions": [{"locale": "en", "slug": "spring-boot-template"}]
    }
  ],
  "total": 12,
  "page": 0,
  "size": 1
}
```

A `page` below `0`, or a `size` outside `1` to `100`, gets `400 VALIDATION_FAILED`.

### GET /publications/{slug}

Returns one publication with its `body`, which holds `{blocks: [{id, type, v, props}]}`.

- An unknown slug gets `404 NOT_FOUND`.
- An old slug in the redirect list gets `301`, with `Location` set to the new slug's URL.

```http
GET /api/public/v2/channels/swemre-website/publications/about
→ 301 Moved Permanently
  Location: /api/public/v2/channels/swemre-website/publications/emre
```

### GET /terms

Returns every category and tag, with `publicationCount`. `?kind=CATEGORY` or `?kind=TAG`
filters the list, and any other `kind` gets `400`.

- The list keeps the CMS's order, which is the order in `mock/seed/terms.json`. Topics with the
  same article count are listed in this order, as the boards do (Architecture 4, React 3,
  Backend 3, …).
- A tag may carry `related` (topic slugs). The empty Kotlin topic uses it for its "Related
  topics": `"related": ["java", "backend", "architecture"]`. This field is a mock extension;
  API v2 does not have it yet, and without it the site shows the three most used topics.

```json
[
  {
    "id": "…",
    "kind": "CATEGORY",
    "name": "architecture",
    "slug": "architecture",
    "description": "Article category: how the parts fit together.",
    "publicationCount": 2
  }
]
```

### GET /redirects

Returns the list of old slugs: `[{"from": "about", "to": "emre"}, {"from": "callback", "to": "call-back"}]`.

### GET /media/{id}/file

Returns the file bytes with their own content type, cached for 7 days.

A media `url` in the JSON is relative to the API base, for example
`/public/v2/channels/swemre-website/media/<id>/file`. The client puts `VITE_API_BASE` in front of
it (`api.mediaUrl`). Image URLs inside a body are already absolute paths.

### POST /forms/{formKey}/submissions

Used by `/newsletter`, `/contact`, `/call-back`, the newsletter confirm and unsubscribe pages, and the home page's Subscribe block, which posts the `newsletter` form directly and then opens `/newsletter/thanks`.

```http
POST /api/public/v2/channels/swemre-website/forms/newsletter/submissions
Content-Type: application/json

{"fields": {"name": "Priya Shah", "email": "priya.shah@lumen.dev", "role": "Engineer",
            "source": null, "topics": ["java", "architecture"], "consent": true}}
```

```http
201 Created
{"id": "…", "receivedAt": "2026-10-30T09:12:00Z", "submittedAt": "2026-10-30T09:12:00Z",
 "ignoredFields": [], "result": {"status": "pending_confirmation", "token": "9f1c…"}}
```

| Form key                 | Fields (★ required)                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `newsletter`             | name, email ★, role, source, topics (string[]), consent ★ (`true`)                                                                      |
| `contact`                | fullName, email ★, phone, describesYou, foundVia, favouriteLanguage, message ★, consent ★, newsletterOptIn                              |
| `callback-request`       | fullName, contact ★ (an email, or a phone number with 9 or more digits), preferredTime ★ (string[]), timeZone, topic ★, note, consent ★ |
| `newsletter-confirm`     | token ★. The answer's `result` is the subscriber: `{name, email, topics}`                                                               |
| `newsletter-unsubscribe` | token or email                                                                                                                          |

- Fields the form does not know come back in `ignoredFields`.
- The newsletter-confirm tokens `invalid` and `expired` get `400` on the `token` field.
- Any other unknown token confirms the example subscriber, Priya Shah.

Form test addresses:

- An email (or call-back contact) starting with `fail@` gets `504`.
- One starting with `slow@` is answered after 3 s.

## GET /rss.xml

In mock mode, the plugin also serves the site's feed at `/rss.xml`. It is RSS 2.0, built from
the seeded articles (`mock/rss.ts`).

- Items are newest first. Each has its title, link, guid, pubDate, author and excerpt, with one
  `category` per topic.
- Links start with `VITE_SITE_URL`.
- `npm run build` in mock mode also writes it to `dist/rss.xml`.
- In live mode the plugin is off; the feed then comes from the API side.

## Errors

Every error has the same body:

```json
{
  "key": "VALIDATION_FAILED",
  "message": "Some fields need a fix",
  "errors": [{"field": "email", "message": "Enter a full email address."}]
}
```

| Status   | Key                              | When                                                                           |
| -------- | -------------------------------- | ------------------------------------------------------------------------------ |
| 400      | `VALIDATION_FAILED`              | bad paging, bad `kind`, a body that is not JSON, or field errors in `errors[]` |
| 401      | `CHANNEL_READ_DENIED`            | the channel is unknown, or the read key is missing or wrong                    |
| 403      | `FORM_CLOSED`                    | the form is closed (fault only)                                                |
| 404      | `NOT_FOUND`                      | an unknown slug, form or route                                                 |
| 429      | `RATE_LIMITED`                   | too many submissions; sent with `Retry-After: 60` (fault only)                 |
| 500      | `INTERNAL`                       | carries `requestId`, which the 500 page shows                                  |
| 503      | `UNAVAILABLE`                    | carries `requestId` and `maintenance: {from, until}`, which the 503 page shows |
| 502, 504 | `BAD_GATEWAY`, `GATEWAY_TIMEOUT` | carry `requestId`                                                              |

On the site:

- A read that answers `404` becomes `undefined`, and the page shows not-found.
- A `503`, or no answer at all (status `0` in `ApiError`), shows the unavailable page.
- Any other failure shows the error page.

## Fault injection

Add `?fault=` to a page URL. The client copies it into the `X-Mock-Fault` header of every API
call that page makes. You can also put `?fault=` on an API URL, or send the header yourself.

The value is a comma list. Each entry is either `<fault>`, which hits every call, or
`<resource>:<fault>`, which hits only that resource.

| Fault     | Effect                                                                       |
| --------- | ---------------------------------------------------------------------------- |
| `500` …   | any HTTP status, answered with the error body above                          |
| `timeout` | waits 30 s, then answers `504`; the client gives up at `VITE_API_TIMEOUT_MS` |
| `slow`    | answers normally after 3 s                                                   |

Resources:

- `publications` (any list)
- `articles`, `projects`, `pages`, `songs`, `authors`, `settings` (a list or a single item of that type)
- `publication` (any single item), or a slug such as `spring-boot-template`
- `terms`, `redirects`
- `forms`, or a form key such as `newsletter` or `contact`

```
/projects?fault=503                     → the unavailable page
/?fault=songs:500                       → home with the songs block in its error state
/articles/spring-boot-template?fault=publication:500 → the error page with a request id
/contact?fault=forms:429                → the contact form's rate-limit failure
/newsletter?fault=newsletter:timeout    → the newsletter form times out
```

Two more dev switches skip the API altogether:

- `?state=<hook>:<loading|empty|error>` forces a data hook into that state. It takes a comma
  list. The names are `settings`, `page`, `articles`, `article`, `projects`, `project`, `songs`,
  `topic`, `terms`, `author`, `search`, `mega` and `activity`.
- `?seed=0` shows the boards' five songs in board order. Without it the song order is random on
  each visit.

## Content model

Each seed file holds one content type:

- `articles.json`
- `projects.json`
- `pages.json`
- `songs.json`
- `authors.json`
- `settings.json` (`site-settings`)

`terms.json` holds the categories and tags. Seed items are short:

- Terms are given by slug.
- Blocks have no `id` or `v`.
- Rich text is a string with the inline markup `` `code` ``, `**bold**`, `*italic*` and
  `[label](href)`.
- `media:<name>` stands for a file in `mock/media`.

`mock/seed.ts` turns them into the API's wire shapes. Ids are stable UUIDs made from the names.

### Site settings

The one `site-settings` publication (slug `site-settings`) holds the site-wide values.
`fields.activity` feeds the projects activity strip (`useActivity()`):

```json
"activity": {
  "weeks": [13, 19, 10, 22, 16, 25, 19, 13, 22, 28, 16, 10, 19, 25, 22, 13, 16, 28, 22, 19, 25, 16, 22, 28, 25, 19],
  "latest": {"at": "2026-10-27T07:12:00Z", "project": "swemre.com", "message": "fix nav focus ring"}
}
```

- `weeks` holds 26 weekly commit counts, oldest first.
- `latest` is the latest commit.
- Without `weeks`, the hook is empty and the strip is hidden.

The author `emre` has the portrait `mock/media/avatar-emre.png` as its `cover`, the same image
as `public/images/avatar-384.png`.

### How a page picks its template

The **section** (category) of a publication is its area of the site and the first part of its URL.
**Reserved tags** choose the layout. All other tags are topics.

| Rule                                                   | Template            | URL                  |
| ------------------------------------------------------ | ------------------- | -------------------- |
| page + `layout-home`                                   | `home`              | `/`                  |
| page + section `articles` + `layout-listing`           | `articles`          | `/articles`          |
| page + section `projects` + `layout-listing`           | `projects`          | `/projects`          |
| page + `layout-topic`                                  | `topic`             | `/articles/topic/:t` |
| page + `layout-search`                                 | `search`            | `/search`            |
| page + `layout-form` (`fields.formKey` picks the form) | `form`              | `/<slug>`            |
| page + section `newsletter` + `layout-status`          | `newsletter-status` | `/newsletter/<slug>` |
| page + `layout-author`                                 | `author`            | `/<slug>`            |
| any other article                                      | `article`           | `/articles/<slug>`   |
| any other project                                      | `project`           | `/projects/<slug>`   |
| any other author                                       | `author`            | `/authors/<slug>`    |
| any other page                                         | `single`            | `/<section>/<slug>`  |

`featured` is reserved too. It marks the featured article and the featured projects, and it is
never shown as a topic.

`/sp/<slug>` redirects to a page's canonical URL, and so does any page reached by a
non-canonical path. An old slug from `/redirects` redirects to its new slug.

### Seed content

| Type          | Items                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| article       | 12. `spring-boot-template` has the full body, FAQ, previous and next                                                                       |
| project       | 7. `swemre-website-api` has the full body                                                                                                  |
| page          | home, articles, topic, projects, search, newsletter, contact, call-back, thanks, confirmed, unsubscribed, privacy-policy                   |
| song          | 12 liked songs (the site shows 412 from settings); the first five have album art                                                           |
| author        | `emre`                                                                                                                                     |
| site-settings | one item: taglines, contact email, hero copy, newsletter cadence, the liked-songs total, the projects activity strip, socials, maintenance |
| terms         | 9 categories (site areas and article categories); 26 tags: 13 article topics (Kotlin has none), project-only tags, the reserved tags       |

The articles `typed-api-clients` and `ai-pair-programming`, and the copy of the `tokenset`
project, are made up to fill the lists. No board shows them in full.
