---
name: new-project
description: Scaffold a new project page (projectDatabase entry + MDX write-up) and announce it in the RSS feed through the add-rss-item skill. Use when the owner asks to add or document a project.
argument-hint: <slug> <title> [year] [repoUrl] [url]
---

# New project

Create a new project from: `$ARGUMENTS`

1. **Metadata.** Append an entry to `src/database/projectDatabase.ts`:
   - `id`: the next free `p<n>` id (check the existing ones);
   - `slug`: kebab-case, unique, equal to the MDX file name;
   - `title`, a one-sentence `summary`, `year` (number, default current year);
   - `tags`: 1 to 4 lowercase tags;
   - optional `repoUrl` and `url` (live site). Only add URLs the owner gave
     you; never invent them.
   Projects are listed newest year first by `ProjectService`.
2. **Write-up.** Create `src/page/projects/<slug>.mdx`:
   - MDX license header first;
   - no `h1`; suggested sections: Problem, Goals, Architecture, Design
     decisions, Testing, Risks, Status;
   - code fences with languages; no semicolons in TypeScript samples;
   - if the project is not real yet, start with
     `<Callout type="warning">Example project. …</Callout>` and say so
     honestly in the Status section. Never describe unbuilt features as
     working.
3. **RSS.** Run the **add-rss-item** skill with `project <slug>`.
4. **Verify.** `npm run checkstyle:fix`, `npm run checkstyle`, `npm run build`.
5. **Docs.** Update the content table in
   `.claude/docs/engineering/software-version-description.md` §2.1, and the
   placeholder list in `.claude/docs/project-overview.md` if it is a
   placeholder.
6. **Report** the URL `/projects/<slug>`, the project id and the feed item id.
