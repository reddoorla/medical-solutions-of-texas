# Medical Solutions of Texas — Work Journal

Running log of build work: what was done, why, and where it landed.
Chronological — newest entry at the bottom. The code says what the site does
now; this says what it used to do and what changing it cost.

The convention is in [CLAUDE.md](../CLAUDE.md) under "The work journal". In
short: every working session appends a dated entry, prose over bullets, why
over what, and history is never edited to be right — a later entry corrects an
earlier one and says so.

---

## 2026-09-05 — Journal opened, and 181 commits of history summarised rather than reconstructed (`chore/work-journal`)

The journal starts today, so this first entry is a **backfill**: a coarse
summary written from the commit log, not from memory. Detail below this line is
trustworthy; detail above it is not, and nothing here should be cited as though
someone wrote it down at the time. For anything earlier the log is the record —
and a thin one, because most pre-June-2026 subjects are terse (`next`, `ne5xt`,
`manual check`, `changes`). The only contemporaneous prose in the repo is
`docs/UPGRADE_NOTES.md` and `docs/morning-reports/MORNING_REPORT_2026-06-05.md`.

**What this repo is.** The marketing site for Medical Solutions of Texas — a
Veteran-Owned Small Business that helps medical vendors navigate government
healthcare contracting for the DoD and VA — at `medicalsolutionsoftx.com`.
SvelteKit 2 / Svelte 5 / Tailwind v4 / Prismic, prerendered onto Netlify.
Forked from the Reddoor wireframer scaffold, whose README was never replaced,
so the file at the repo root describes the starter and not this site.

**The eras.** 181 commits, 2024-10-14 to 2026-09-01, in three unequal years:
68 / 13 / 100.

_2024 (68)._ The build — **47 commits in October alone**: hero video,
preloader, the heartbeat and nav-icon transitions, repeated mobile passes; then
November and December on content and imagery. This is why the pages are bespoke
routes (`about`, `process`, `partners`, `resources`, `contact`) with Prismic
supplying metadata and a single `RichText` slice. The site predates the slice
library it would otherwise have been built from.

_2025 (13)._ Effectively dormant. Client edits arriving one at a time — new
address and phone, fax removed, `gtag`, `robots.txt`, dynamic dates.

_2026 (100)._ Three pushes. **May (15)**: the Svelte 4.2.8 → 5, Vite 5 → 8,
Tailwind 3 → 4, npm → pnpm migration on the `svelte-5` branch —
`docs/UPGRADE_NOTES.md` records it commit by commit and is the thing to read
before touching build config. **June (43)**: fleet onboarding onto
`@reddoorla/maintenance` — shared eslint/prettier/CI/renovate configs, Node 24 +
pnpm 11, Typekit consolidated onto the shared kit `noj4tji`, the contact form
moved off Netlify Forms to central ingest, Turnstile added. **July (19)**:
measurement paying off — homepage payload 37 MB → 3.7 MB, load-aware splash
reveal (SI 5.7s → 4.6s), a Prismic-backed `sitemap.xml`, `/health`, the smoke
suite, and `/rep-login` retired to a 301 rather than deleted in Prismic. August
and September are dependency and CI maintenance.

**State as of this entry.** `main` at `e0bb5f4`, tree clean, nothing in flight.
A dozen stale remote branches survive from merged PRs; none is live work.

**What changed today.** `CLAUDE.md` did not exist here — this repo predates the
convention — so it was created carrying only what the code and log support,
plus "The work journal". And this file exists.

## 2026-10-04 — Off Slice Machine, onto the Prismic CLI (reddoor-maintenance#1090)

Phase 4 of the fleet migration (reddoor-maintenance
`docs/prismic-migration-plan-2026-10.md` §9), following espada and
caltex-landing. Slice Machine is deprecated by Prismic since 2026-09-18; models
are now edited in the Type Builder and the generated files come from
`pnpm prismic:gen`.

**The Type Builder could not have framed this site's simulator.** On `main`
the root layout's `prerender = "auto"` prerendered `/slice-simulator` into a
static file, and netlify.toml's `/*` block stamps every static file
`X-Frame-Options: SAMEORIGIN`. Measured read-only on medicalsolutionsoftx.com:
`/slice-simulator`, `/` and `/about` all carry `x-frame-options: SAMEORIGIN`;
`/contact` and `/health`, server-rendered, carry none, and no route sends a
CSP (the site never opted into the central one, whatever netlify.toml's
comment about `kit.csp` says). `vite preview` showed neither header on any
route, because it does not apply netlify.toml, so the local preview alone
would have called the route frameable. `/slice-simulator` is now
`prerender = false`, and a new `hooks.server.ts` touches that route only:
it deletes X-Frame-Options and sends
`frame-ancestors 'self' http://localhost:* https://*.prismic.io https://prismic.io`.
Re-measured from `vite preview`: that CSP on `/slice-simulator`, and `/`,
`/about`, `/contact`, `/health` unchanged (no X-Frame-Options, no CSP, as
before). There is no unit runner here, so the hook was proven with a throwaway
node probe instead: given `X-Frame-Options: SAMEORIGIN`, `/slice-simulator`
and `/slice-simulator/` come back without it, and `/about` keeps it.

**Types moved to the project root, and svelte-check stopped seeing them.**
The CLI writes `prismicio-types.d.ts` at the root, outside SvelteKit's `src/**`
include: 4 errors (`Content` missing in the RichText slice, `[uid]`'s
`entries()` uid typed `string | null` three times). `src/app.d.ts` now
imports the file; 0 errors after, as on `main`.

**A stale model, found by regenerating.** The new types add
`FormRepliesDocument` and `FormRepliesDocumentDataRepliesItem`:
`customtypes/form_replies` arrived with the form work and the committed Slice
Machine types were never regenerated after it — exactly the gap
`src/lib/server/reply-copy.ts` described, whose comment now says it is closed.
The slice index is unchanged (`rich_text` only). The `prismic-codegen` job
exists for that case; its check passed on this tree and went red with an
un-regenerated field added to the RichText model.

The nightly drift sweep read msot's 3 models as matching Prismic at `320e878`,
the base of this change, so nothing was owed to Prismic first.
