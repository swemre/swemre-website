---
name: new-article
description: Scaffold a new article (database entry + MDX file) and announce it in the RSS feed through the add-rss-item skill. Use when the owner asks to add, write or draft an article.
argument-hint: <slug> <title>
---

# New article

Create a new article from: `$ARGUMENTS`

Follow `.claude/docs/article-system.md` and the MDX rules in
`.claude/docs/syntax-and-conventions.md` §8.

1. **Metadata.** Append an entry to `src/database/articleDatabase.ts`:
   - `id`: a new random 8-character lowercase hex string, unique (it keys
     visitor likes and views forever; never change it later);
   - `slug`: kebab-case, unique, equal to the MDX file name;
   - `title`, a one-sentence `summary`, `author: 'swemre'`;
   - `createdAt`: now, ISO 8601 UTC (`2026-10-20T09:00:00Z`);
   - `readingTime`: words ÷ 200, rounded up (minutes);
   - `tags`: 1 to 4 lowercase tags, reusing existing tags where they fit.
2. **Body.** Create `src/page/article/<slug>.mdx`:
   - starts with the MDX license header (copy it from another `.mdx` file);
   - no `h1`; `##` sections and `###` subsections;
   - every code fence has a language; TypeScript samples have no semicolons;
   - if the owner did not provide the text, write a short placeholder body
     that starts with `<Callout type="warning">Draft article.</Callout>`.
3. **RSS.** Run the **add-rss-item** skill with `article <slug>`, using the
   article's `createdAt` as `publishedAt`.
4. **Verify.** `npm run checkstyle:fix`, `npm run checkstyle`, `npm run build`
   (the build regenerates the feed and fails if the article has no feed item).
5. **Docs.** No engineering-doc change is needed for ordinary content. Update
   the content table in
   `.claude/docs/engineering/software-version-description.md` §2.1.
6. **Report** the URL `/articles/<slug>`, the article id and the feed item id.
