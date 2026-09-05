# CLAUDE.md

The marketing site for **Medical Solutions of Texas** — a Veteran-Owned Small
Business that helps medical vendors navigate government healthcare contracting
for the DoD and VA — at `medicalsolutionsoftx.com`. SvelteKit 2 / Svelte 5 /
Tailwind v4 / Prismic (repo `msot`), prerendered onto Netlify. The README at
the repo root is the Reddoor scaffold's, inherited at the fork and never
replaced; it does not describe this site.

## Working here

There is **no `pnpm verify`** in this repo, unlike its siblings. CI is the
org's reusable workflow (`reddoorla/.github` ci.yml); the local equivalent is
`pnpm lint`, `pnpm check`, `pnpm build`, `pnpm test:smoke`. Node 24, pnpm 11.

- **The pages are bespoke routes, not slices.** They live under
  `src/routes/[[preview=preview]]/` (`about`, `process`, `partners`,
  `resources`, `contact`, plus a `[uid]` catch-all). Prismic supplies the
  `page` type's metadata and one `RichText` slice; the layout and copy are in
  the route components. The site predates the slice library.
- **`src/prismicio-types.d.ts` is generated** by Slice Machine and is
  prettier-ignored on purpose — a prettier bump would otherwise red
  `--check` on unrelated dependency PRs.
- **The canonical origin is defined once**, in `src/lib/site.js`. Re-hardcoding
  it elsewhere is what caused a stale-www sitemap bug on a sibling site.
- **The branch filters in `.github/workflows/prismic-models.yml` are
  load-bearing**, not tidiness — the file explains why. That workflow is
  managed by `@reddoorla/maintenance`; change it there.

`docs/UPGRADE_NOTES.md` is the commit-by-commit record of the May 2026
Svelte 4 → 5 / Vite 5 → 8 / Tailwind 3 → 4 / npm → pnpm migration. Read it
before touching build config.

## The work journal

**Every working session appends a dated entry to `docs/workJournal.md`** — what
was done and **why**, newest at the bottom, never corrected in place. Write it
as the last act of the session, not the first act of the next one.

The journal is the history of executing the build. Code says what the system
does now; the journal says what it used to do, what it cost to change, and
which beliefs turned out to be wrong. Nearly everything expensive to rediscover
lives there and nowhere else.

An entry is headed with the date, a short title, and where it landed:

```markdown
## 2026-09-04 — Both runway stages render their final frame without JS (#51, `ce46ae0`)
```

Then prose — not a bullet list of file names, which the diff already tells you.
What to put in, in rough order of value:

- **Why, over what.** The reason a thing was done survives; the diff does not
  need restating.
- **Measured numbers, exactly.** "The comp's open mask is 2696×2352 on an 860px
  band — 2.735× the band's height, so a 390×664 phone needs ~534%" is worth
  keeping. "Fixed the hero on mobile" is not.
- **Defects, named.** What broke, what it looked like, and what made it
  invisible until it wasn't.
- **What was tried and abandoned**, and what it would take to revive it. A dead
  end nobody wrote down gets walked twice.
- **Beliefs corrected on contact.** The design assumption that turned out false
  is usually the most valuable line in the entry.
- **Honest accounting.** If a win came from somewhere other than the change
  that claimed it, say so — that is exactly what someone will otherwise
  over-invest in next.

**History is never edited to be right.** An entry that stops being true is not
rewritten; a later entry corrects it, and says which one it corrects. The
journal is a record of what was believed at the time, and that record is most
useful precisely where it was wrong. Fixing the past in place destroys the only
evidence of how the mistake was made.

If a session produced nothing worth an entry, that is itself worth one line.
