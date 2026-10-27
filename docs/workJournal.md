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

## 2026-10-04 — The simulator leaves `[uid]`'s bundle; an encoded path gets the simulator's framing (#72)

The two findings from the adversarial review of the Prismic CLI move, ported
from reddoor-starter#168 on the pattern of caltex-landing#70. `/slice-simulator`
imports `SliceSimulator` from the `@prismicio/svelte` barrel, which re-exports
it statically, so Rolldown put `@prismicio/simulator` in the barrel's shared
chunk. `scripts/prismic-barrel.ts`, copied verbatim from the starter, declares
that one re-export-only module side-effect-free, and `SliceZone` is then bound
directly.

Here the shared chunk did not hang off the root layout, as it did on caltex,
but only off `[uid]`, the one page route that renders a `SliceZone` from the
barrel. Measured from the build manifest as each client node's static-import
closure, gzipped, `main` → branch: `[uid]` 32,795 → 28,362, and it no longer
reaches the simulator. `/slice-simulator` went 32,865 → 32,988, carrying the
code in its own node. The root layout (44,295 → 44,290) and home (59,050 →
59,050) never reached it and did not change beyond hash noise.

The hook asked `isCmsFramedRoute(event.url.pathname)`, the raw path, while
SvelteKit routes on the decoded one, so `/slice%2Dsimulator` and
`/slice%2dsimulator` rendered the simulator with no framing CSP. It now asks
`event.route.id`. From `vite preview`, both encoded paths went from no
`frame-ancestors` to the widened one, the same as `/slice-simulator`.

The proof is `tests/smoke/slice-simulator.spec.ts`, since this site has no
unit runner. Against `main` it failed 3 of 7 (the bundle check and both
encoded paths); on the branch it passes 7 of 7, and with the plugin removed
from `vite.config.ts` it fails the bundle check alone. The starter imports
the plugin as `./scripts/prismic-barrel.ts`; here svelte-check refused that
(`allowImportingTsExtensions` is not on in this tsconfig), so the import is
extensionless, as caltex's is from its `.js` config.

## 2026-10-12 — The home page passes Lighthouse accessibility again: a scrim, 75% ghost words and three heading tags (#77)

The fleet Lighthouse nightly scored `/` 0.92 accessibility on 10-09, 10-10
and 10-11, under the 0.95 gate, on color-contrast and heading-order (#76).
Re-run on production with the nightly's own lhci config (desktop preset,
devtools throttling, 3 runs), it scored 0.92 ×3, with the same four nodes
every run. Fixing heading-order alone gives about 0.944, so both contrast
nodes had to pass too. Both turned out to be design calls, and the operator
made them (reddoor-maintenance `docs/BACKLOG.md`, Operator decisions 106 and
108).

**"We'll Get You" was measured against a colour nobody sees.** axe walked
down from the heading, through the `bg-mid mix-blend-multiply` layer, to
the video box's `bg-light`, and reported 1.33:1 (`#cbc3a4` on `#b3a983`,
which is mid multiplied by light). The placeholder image covers that box in
every state, LQIP included. The first fix made the box `bg-dark`. That
passed axe at 6.85:1 and changed nothing a visitor sees. The design lens of
the first review said so: it measured the heading against the real pixels,
and the brightest 5% behind it were 1.9:1 on the still at 1440, and 1.6–2.2:1
behind "YOU" on a production frame with the surgical lamp in it. The
operator chose a scrim, a bottom gradient from black 50% to 0. It now sits
over the image and the video. Against the still, 99% of the pixels behind the
heading reach 4.30:1 at 1350 and 4.65:1 at 390. Without the scrim they reach
1.45:1 and 1.93:1. axe now stops at the gradient and reports the heading
"incomplete", so `bg-dark` matters only if the image never paints, and
Lighthouse does not judge this node at all.

**The ghost words were a design, not a mistake.** The rotating list lights
one of "Priority Access / contract expertise / Direct Results" at a time,
and dims the others to 25%: 1.42:1 against `bg-mid`, where 80px text needs
3:1. Text-dark at any opacity is 3:1 only from 0.70 up (3.01:1). At 75%
(3.30:1) an inactive word is only 1.62:1 from the lit one, against 3.76:1
before, so most of the spotlight goes. The operator chose 75% over hiding
the inactive words. At 75%, the first line of "Direct Results" became a
prominent cut-off "DIRECT" at 1024 and 390. At 25% it had been a faint one;
the list's `-mb-[15%]` and the box below it clip that word only partly when
words wrap. So a word two steps from the lit one is hidden (`weGetTone`).
At 1440 that word was already under the box, so nothing changes there.

**Heading order** needed no decision:

- "The End User In Mind" went from `h5` (after `h2`) to `h3`.
- 01–03 are paragraphs.
- "Your Trusted Partner" is an `h2`. It followed the hero `h1`, which
  renders at 768px and below.

`.h4` and `.h5` share the element rules in `app.css`, and a full-page pixel
diff found no change from the swap. A stray `>` text node in the video box,
which screen readers announced, is gone.

**The pixel test was wrong twice before it was right.** Its first version
took the heading colour from `getComputedStyle` and dropped pixels near
that colour. The second review showed it would pass with the heading drawn
under the overlays: the heading renders at rgb(76, 70, 49), the test still
read the CSS colour, and it reported 4.43 when the truth was 1.13. Its 5th
percentile was also set by anti-aliased glyph edges, about 2.4% of the
sample. And it ran only at 1350, where the scrim is strongest. It now
screenshots the heading's area twice, with the text drawn and with it
transparent. The difference gives the glyph mask and the rendered colour,
and the second shot holds only the still. Four mutations go red: no scrim,
the heading under the overlays (1.03), a 20% scrim, and the heading hidden.
The axe test also had to wait for the splash and the mount. Without those
waits it still caught the desktop nodes but missed the 390 one, because the
hero `h1` renders only after mount.

**Not fixed here, filed:**

- #78: the "Government contracts are" column fades to 1.42:1 after a
  scroll.
- #79: `/process` and `/about` use the same video-box heading.
- #80: at 390 the heading wraps, so "WE'LL GET" sits mid-box, where the
  scrim is about 20%. Over bright video frames it estimates at about 2.4:1.

The nightly sees none of these, because it does not scroll, audits only `/`,
and runs before any interaction mounts the video.

## 2026-10-14 — A DRAFT `/privacy` page and a footer link on every page (#81)

`reddoor-maint launch-check msot` read 7 of 8 `ok`. The one failure was
`privacy missing`: `/privacy` and `/privacy-policy` both answered 404, and no
page linked to a policy, while `src/app.html` loads GA4 `G-BZ0WQMEE8L` on every
page. This change ports the starter's DRAFT, `noindex` policy page
(reddoor-starter#165), using data-dynamiq as the reference, and puts a link in
both footers: home's inline footer and the shared `Footer.svelte`.

**The list of services comes from a live capture, not from the template.**
Chromium loaded six pages and scrolled each one. It saw:

- GA4 on every page.
- Adobe Fonts on every page: `use.typekit.net`, plus the licensing ping
  `p.typekit.net`.
- Vimeo on `/` and `/process`, once VimeoGate mounts the player. vimeo.com
  sets `__cf_bm` and `cf_clearance` even though every embed carries `dnt=1`,
  so "its player may set cookies" stays in the policy.
- Turnstile on `/contact`.

The brief expected Prismic's image CDN as well, and it is not there. The images
are local assets. `msot.cdn.prismic.io` appears only as a string inside the
serialized page data, and `static.cdn.prismic.io` loads only in a preview
session. So the policy does not name Prismic. data-dynamiq derives its list at
build time through a Vite plugin. This site gets a fixed `PRIVACY_SERVICES`
instead, and `tests/privacy/services.spec.ts` fails if the hosts in the source
stop matching that list in either direction.

**Every value the policy needs was already published**, so nothing went to
the operator:

- the name, "Medical Solutions of Texas", from the footer;
- `info@MedicalSolutionsofTX.com`, from `/contact`;
- the effective date, set to the day the page was written.

**The defect review caught:** the Turnstile clause rendered "…with your
messageand is used…". Svelte trims whitespace at the edge of an `{#if}` block.
The first fix wrapped the clause in a `<span>`, and that lost the space too:
whitespace at the start of an element's children is trimmed as well. `{" "}`
fails eslint's `no-useless-mustaches`. What works is making the clause its own
sentence, so the space sits outside the block, and a test pins the full
sentence. No test read the prose before this, which is how it reached review.

**A process slip, recorded so it is not repeated:** the first mutation run
restored each mutated file with `git checkout --` before the footer edits had
been committed. That silently reverted them, and three of the six "red"
results were measuring the wrong tree. Every mutation was run again against a
committed head, and each one turned a test red.

Filed as minors: #82 (white footer text on khaki is about 3.36:1, a
pre-existing problem the link now shares), #83 (the footer row wraps at
561–767px), #84 (the detector also matches comments) and #85 (an unused
`noindex` field, and the Vimeo Referer).

## 2026-10-27 — The home a11y scan stops pinning the hidden rotating word's opacity (#99)

The fleet test audit (`reddoorla/reddoor-workspace` `audits/2026-10-26-fleet-test-audit/report.md`, batch D) flagged one assertion in `tests/smoke/home-a11y.spec.ts`: before the axe scan, "/ passes color-contrast and heading-order" required the "Direct Results" heading to have computed `opacity` 0. That pins a design value, the `weGetTone` choice that hides the word two steps from the lit one (this journal's color-contrast entry), so it went. A designer who later gives every inactive word 75% would bring back the cut-off "DIRECT" at 1024 and 390, and no test now says so; axe still passes that, since 75% `text-dark` on `bg-mid` is 3.30:1 against the 3:1 large-text bar. The line was also the scan's precondition (the rotation still at index 0), and nothing is lost there: the kept "contract expertise" pass check cannot tell index 0 from index 2, but the two are symmetric. Review showed the line was doing more than pinning: it was the only guard on the far word's contrast. With the far tone at `opacity-50`, "DIRECT" sits in full view at 390 at 2.1:1, and axe does not report it, so the scan passed. In its place the test now checks a property instead of a value: each of the three rotating headings must be hidden (opacity 0 or `visibility: hidden`) or clear 3:1 against the nearest ancestor background, with its colour composited at its opacity. That measures 2.11:1 for a 50% word (red, matching axe's own 2.1 when it can see the pair), passes 75% (3.30:1), a fully visible word and `invisible`, and needs `includeHidden` on the role locator, because `visibility: hidden` drops the word from the accessibility tree. Review 2 showed that check was still too narrow, because it read opacity and visibility from the `h2` alone. Computed `opacity` is not inherited, so the same 2.1:1 word passed with the 50% on a `<span>` inside the heading or a `<div>` around it, and `visibility` can be set back to `visible` on a child. The check now measures what paints. For each non-blank text node in the three headings it skips the node when its element is not `visible`, or when its box has no area left inside every `overflow` ancestor (clipped away). Otherwise it multiplies opacity from that element up to the element that paints its ground and composites the colour at that alpha. Each of those three inputs now goes red at 2.11:1. A word moved fully out of an `overflow-hidden` heading at 50% passes, because nothing of it paints. Also from review 2: `invisible` was accepted as hidden, but it drops the word from the accessibility tree, and the old pin had caught that as a side effect, so each of the three words must now be in the tree, and `invisible` on the far word goes red there. One input in review 2, `h-0 overflow-hidden` on the far heading, is still red, but on the existing "axe judged the inactive word next to the lit one" check, because axe no longer lists "contract expertise" among its passes once that heading collapses (the layout under the list changes; the exact cause was not traced). The contrast check itself skips the collapsed word. The rest of the file is unchanged, and all four of its tests passed against a production build (`vite build`, 2 m 12 s here) before the review change and on the dev server after it.

This branch is cut from `main`, which is still on kit 2; `staging` carries the kit 3 migration and 27 files `main` lacks, none of them this spec.
