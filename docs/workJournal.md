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

## 2026-10-24 — SvelteKit 3 and adapter-netlify 7, onto a new `staging` branch (#91, `0343a63`)

Overnight, Renovate opened `@sveltejs/kit` ^3 as a security PR (#90, GHSA-27mw-82g8-phjj, fixed only in 3.0). It could not pass: kit 3 refuses to start beside `svelte.config.js`. The migration lands on a new `staging` branch and reaches `main` only through the operator's promotion PR (#93). It follows the recipe from eight other fleet sites (reddoor-maintenance P1-53), with what revogen#108 found that morning. `@reddoorla/maintenance` went from 0.95 to 0.109.1, the first release with kit 3's `createKitConfig`.

**Defects the migration would have shipped without these changes:**

- **`$app/stores` in the root layout and `+error.svelte`.** On kit 3.1 it throws `app_stores_removed`, so every page answered 500. Putting it back as a mutation kept Playwright's web server from ever starting. Both files now use `$app/state`.
- **The fallback `og:image`.** It was built from `page.url.origin`, and kit 2 took Netlify's `URL` as `prerender.origin` for that. Kit 3 removed the option, so six prerendered pages would have advertised `http://sveltekit-prerender/msot-og.jpg`. The image now uses `$lib/site`'s `SITE_URL`, which this repo's `CLAUDE.md` already names as the one canonical origin. `paths.origin`, kit 3's replacement, stays unset: it would also become the only origin the contact form's CSRF check accepts.
- **Undeclared environment variables.** Kit 3 exposes only what `src/env.ts` declares. Without the file, the form's ingest URL and token read as `undefined`, and the build only warned. With the reads moved to `$app/env/*`, svelte-check now rejects an undeclared variable.

**Belief corrected on review.** The a11y audit's error-page coverage was an accident. Under maintenance 0.95 the audit loaded `/dev/animate-in`, a fixture this site never had, and so axe-scanned the 404 page. 0.109 skips the absent fixture, which left `+error.svelte` with no a11y scan at all, in a PR that edits it. A smoke test now runs axe on a real 404. An `<img>` without alt there turns it red. `reddoor.absentFixtures` makes the audit report `pass` again instead of `warn`.

`scripts/prerender-origin.mjs` checks the built output. It fails on the placeholder, on this host over http or on a subdomain (the stale-www sitemap class), and on Netlify's `URL`. It builds with `URL` set to a sentinel, because nothing here should read it: the netlify.app mirror builds with its own. Its control names the three files that carry the origin whatever Prismic holds. An earlier count of eight carriers would have failed on any editor filling a page's `meta_image`.

**Measured on the deployed `staging` URL:** `/health` was byte-identical to medicalsolutionsoftx.com's. The smoke suite passed 19 of 19 on staging. On production it passed 16, plus 3 that were flaky and passed on retry.

## 2026-10-28 — No page is wider than a phone or a tablet (P1-85, #100 into `staging`)

The operator, from his phone at 7:36am PT: "msot is messed up on mobile, looks like it's specifically on pages where text is bigger than the content width", and later "the overflow is also causing layout issues on safari". He was right on both counts. Measured on production at the iPhone 14 profile (WebKit, 390px), `/` scrolled to 462px and `/about` to 433px; at 320px, `/` reached 459px and `/about` 398px. Review then found the same two text defects on tablets: `/` 62px too wide at 768px and 36px at 820px (iPad Air), and `/about` 36px too wide at 1024px.

**Five causes, two of them not text:**

- The home page's `.support-text` words were a fixed 50px, and single words don't wrap. "UNDERSTANDING" is about 8.8em wide, so it needs a 440px column: it ended at 463px on a 412px Pixel 7, and on a tablet it overran its half-width column. A first fix, `min(50px, 9.5vw)`, cured phones but not tablets, where the column is half the screen. The size is now `min(50px, 10.5cqi)` against the column (`container-type: inline-size` on `.support-text`): 50px wherever it fits, about 37px on an iPhone 14 or a 768px tablet, 31px at 320px. The words' `duration-1000` also animated the font size on resize, for about 300ms past the edge, so the transition is now limited to opacity.
- The `/about` team cards set names `text-nowrap` at 30px, so "COURTNEY ALEXANDER" ended at 444px on a phone. At `lg` the cards are 288px, so it also spilled past its card and the page at 1024px. Names now wrap below `xl` (1340px in this project's `app.css`) and stay on one line from there, where the 384px card holds them, so the desktop look is unchanged from 1340px up. Between 1280 and 1340px they now wrap onto two lines, where before they ran past their 288px card. The popup gets the same class, though `/about` passes `noclick` to every card, so no visitor can open it today.
- The home page's "End User In Mind" copy is a fixed `w-80` (320px), so at a 320px width it ran past the edge. An ancestor clips it, so it didn't widen the page; the words were just cut off. It is now `w-full max-w-80`.
- The Revogen testimonial logo was `h-32 max-w-[350px]`, 335px wide inside a 320px screen. It is now `max-w-[min(350px,100%)] object-contain`.
- The `/about` decorative dots sit at `-right-[10%]` of a column that is full width on a phone. Their row now clips on x below `md`, and is unchanged above.

**Why the fleet's browser audit called it `/partners` and not `/` or `/about`.** Chromium's mobile emulation does not scroll an overflowing page; it widens the layout viewport and zooms out. On the Pixel 7, `innerWidth` read between 441 and 463 on `/` and between 434 and 445 on `/about` instead of 412, depending on how far the page had loaded. The audit's test, `scrollWidth > innerWidth + 2`, compares two numbers that grow together, so it passed both broken pages. Its one failure, `/partners [Pixel 7]` on 10-28, did not reproduce in three Chromium and three WebKit readings. One `domcontentloaded` reading of `/` caught the 1440px and 1920px images at their natural size before the stylesheet applied (scroll width 1928). That race is the likeliest source of the `/partners` failure. Both are the instrument's: reddoorla/reddoor-maintenance#1871.

`tests/smoke/mobile-overflow.spec.ts` loads six routes at 320, 390, 768, 820 and 1024px in a plain desktop context, which has no zoom-out. It fails on either a scroll width past the viewport or any text past the edge. It measures after hydration. The layout server-renders the desktop nav links, because `viewportWidth` starts at 1920, and swaps in the menu button only once it hydrates. Before it waited, the spec measured the server-rendered page in 10 of 12 loads, and its first version had to exclude fixed layers to step over those links. A phone also flashes them before hydration; that is older than this change. Seven mutations each turn the spec red: each of the five fixes reverted, plus two tablet-only ones. The names keeping `nowrap` from `md` fails at 1024px; the support text losing its container fails at 768 and 820px. A first version checked only scroll width and stayed green with the `w-80` revert, because the clipped copy widened nothing. That is why the text check exists.

## 2026-10-28 — Phones get the mobile timeline and doctor art, chosen by `<picture>` (#106)

Asked at about 12:05pm PT, after the operator wrote: "re msot, do we not have mobile versions of the poster/timeline images?" We did, for five images: `timeline1/2/3_mobile.svg` on `/`, `process/timeline_mobile.svg`, and `doctor_mobile.jpg`. No phone ever got them. On the live site after promotion #104, an iPhone 14 (WebKit) and a Pixel 7 (Chromium) both loaded `timeline1/2/3.svg`, `doctor.*.avif` and `timeline.svg`. Each `src` was a JS ternary on `viewportWidth`. That value is `$state(window ? innerWidth : 1920)`, so the prerendered HTML always carried the desktop file. Svelte 5's hydration keeps a server-rendered attribute that differs from the client's (the dev warning `hydration_attribute_changed`), and `viewportWidth` never changes again without a resize. The mobile art showed only after a client-side navigation, which may be why nobody noticed. "Poster" names nothing in the code. The timelines are poster-like art: the second has a soldier cut out over it. So these five are probably what he meant.

Each image is now a `<picture>`: the desktop art in a `<source media="(min-width: 769px)">` and the mobile art as the `<img>`. The doctor image uses `(min-width: 1024px)`. Both keep the old breakpoints (`> 768`, `< 1024`). The browser picks before any JS and fetches one file. svelte-img's `<Img>` has no media support. So `ScreenWidthImage` gained a `mobileSrc` prop: given one, it renders the imagetools `sources` itself, with the desktop formats under the media query, and keeps svelte-img's lqip background. Each `<source>` carries its own `width`/`height`.

**Beliefs corrected on contact.** The home timeline sections carried `aspect-[5/2]`, which looked as if it would trap the 359×650 phone art in a 156px band at 390px. It does not: CSS `aspect-ratio` grows to fit taller content. The review measured each section exactly as tall as its image at every width, 650px at 1440 where 5/2 gives 576. The class never did anything on either page, so it is gone. The bot's deploy-preview link, `deploy-preview-106--medical-solutions-of-texas.netlify.app`, is a 404. The Netlify site is `msot-landing`, and `deploy-preview-106--msot-landing.netlify.app` served the fix: both phones got all five `_mobile` files, and 1440px got the desktop ones.

reddoorla/medical-solutions-of-texas#102 has the same root cause in the nav. Its links and "Open menu" button now both render, and CSS chooses at 769px. Reading that code turned up a second defect: the menu icon carried `md:hidden`, which in Tailwind v4 is ≥768px, while its button showed through 768px. At exactly 768px (a portrait iPad mini) the menu button was invisible.

The tests are `tests/smoke/mobile-images.spec.ts` (390px and 1440px, on `/` and `/process`) and `tests/smoke/nav-breakpoint.spec.ts` (JS off, at 390, 768, 769 and 1440). The image spec names the file only for the SVGs. Imagetools' dev URLs are `/@imagetools/<hash>`, with no file name, so the doctor is told apart by the aspect of what loaded: 1.815 for desktop, 1.295 for mobile. On unchanged `staging` the mobile cases fail and the desktop cases pass, so the instrument passes on known-good input. Six mutations each turned a spec red:

- each of a timeline and the doctor put back on the ternary;
- each of two media queries moved;
- `md:hidden` back on the icon;
- the nav links at `md`.

The review found nothing above minor. It reproduced a flake: the default 5s poll lost to a 5.5s SVG load under 4 workers, in 2 of 32 and 1 of 24 repeats. The poll now waits 20s, and 24 of 24 passed. The boundary cases (768/769, 1023/1024) are not asserted by the image spec. That nit needs a new test, so it is reddoorla/medical-solutions-of-texas#107. At 768px each home timeline is now the phone art at 768×1390: that is the old breakpoint's intent, which the bug had hidden.

Usage: $5.75, 218/58059 tokens, 13866163/272199 cache, rate limit allowed_warning

## 2026-10-28 — The deploy-preview comment links `msot-landing`, the site that builds every PR (into `staging`)

The org's reusable `ci.yml` (v1.4.2) posts `deploy-preview-<pr>--<site>.netlify.app` and takes `<site>` from its `netlify-site` input, defaulting to the repo name. This repo has two Netlify sites. `msot-landing` is the one serving `medicalsolutionsoftx.com`; `medical-solutions-of-texas` is a second site on the same repo. Probed at 3:15pm PT: `msot-landing` answered 200 for #105, #106, #108 and #109; `medical-solutions-of-texas` answered 200 for #105, #108 and #109 but **404 for #106**, a PR into `staging` whose head SHA carries only `msot-landing` check runs. So the link the bot posted on #106 was dead, and the working preview was one site over.

**Belief corrected on contact.** The report was "PRs into `staging` build only `msot-landing`". #109 went into `staging` and built both. Which PRs `medical-solutions-of-texas` builds is a Netlify-side setting this session could not read (the Netlify connector returns no build settings), so a mapping keyed on the base branch would have encoded a guess. Pointing the input at the site that has built every measured PR does not depend on it.

**What was not built.** The brief preferred deriving the site from the Netlify check run on the head SHA. Two things argued against it here. First, on #109 the `ci / deploy-preview-comment` check run completed at 12:58:49pm PT, seven seconds before the first Netlify check run on the same SHA started (12:58:56pm PT, both read from the PR's check runs), so derivation means polling inside the job on every PR push in about 27 repos. Second, `reddoorla/.github` cannot be changed from a cloud session (its name starts with a dot; maintenance `docs/journal/2026-10-13-2010-p1-45-promoted.md`). The fleet census found no other repo whose posted link 404s. It read the `netlify-site` input from each of the 27 site repos' `ci.yml` (all pin v1.4.2), matched each repo against the Netlify team's site list, and probed the four newest PRs of every repo that has a second site. revogen (#116–#119), gallerysonder (#139–#142) and reddoor-website (#302–#306) each have a second site that built only some of those PRs, but the site their link names answered 200 on all of them; caltex-landing and vineyard-custom-homes answered 200 on the named site for all four too. The repos whose site name differs from the repo name already pass `netlify-site`.

**Wider than the first probe.** The review probed further back: `medical-solutions-of-texas` 404s for #94, #98, #100, #101, #106 and #110, all into `staging`, and answers for #105, #109 and every PR into `main` probed. `msot-landing` answered 200 for all of them, Renovate PRs into `main` included.

**The red test is the live link.** M1, no input (the repo name): the #106 comment's link, 404. M2, `netlify-site: "msot-landing"`: this PR's own comment (#110) links `deploy-preview-110--msot-landing.netlify.app`, which answered 200 at 3:20pm PT, while `deploy-preview-110--medical-solutions-of-texas.netlify.app` answered 404, so M1 reproduces on the same PR. No offline test was added: it could only assert the YAML line it pins.
