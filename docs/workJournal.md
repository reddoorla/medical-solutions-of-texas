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

## 2026-11-01 (begun 10-27) — The home a11y scan stops pinning the hidden rotating word's opacity (#99)

The fleet test audit (`reddoorla/reddoor-workspace` `audits/2026-10-26-fleet-test-audit/report.md`, batch D) flagged one assertion in `tests/smoke/home-a11y.spec.ts`: before the axe scan, "/ passes color-contrast and heading-order" required the "Direct Results" heading to have computed `opacity` 0. That pins a design value, the `weGetTone` choice that hides the word two steps from the lit one (this journal's color-contrast entry), so it went. A designer who later gives every inactive word 75% would bring back the cut-off "DIRECT" at 1024 and 390, and no test now says so; axe still passes that, since 75% `text-dark` on `bg-mid` is 3.30:1 against the 3:1 large-text bar. The line was also the scan's precondition (the rotation still at index 0), and nothing is lost there: the kept "contract expertise" pass check cannot tell index 0 from index 2, but the two are symmetric. Review showed the line was doing more than pinning: it was the only guard on the far word's contrast. With the far tone at `opacity-50`, "DIRECT" sits in full view at 390 at 2.1:1, and axe does not report it, so the scan passed. In its place the test now checks a property instead of a value: each of the three rotating headings must be hidden (opacity 0 or `visibility: hidden`) or clear 3:1 against the nearest ancestor background, with its colour composited at its opacity. That measures 2.11:1 for a 50% word (red, matching axe's own 2.1 when it can see the pair), passes 75% (3.30:1), a fully visible word and `invisible`, and needs `includeHidden` on the role locator, because `visibility: hidden` drops the word from the accessibility tree. Review 2 showed that check was still too narrow, because it read opacity and visibility from the `h2` alone. Computed `opacity` is not inherited, so the same 2.1:1 word passed with the 50% on a `<span>` inside the heading or a `<div>` around it, and `visibility` can be set back to `visible` on a child. The check now measures what paints. For each non-blank text node in the three headings it skips the node when its element is not `visible`, or when its box has no area left inside every `overflow` ancestor (clipped away); an ancestor with `display: contents` or `inline` clips nothing and is passed over, since its rect is 0×0 and the old loop read that as a clip (review 3's nit). Otherwise it multiplies opacity from that element up to the element that paints its ground and composites the colour at that alpha. Review 3 also found that opacity applied through `filter` escaped this, so any `filter` other than `none` on an element from the text up to its ground now fails the test outright. The colour a filter paints is not modelled, and the home page has none on these headings (the one filter in `app.css` is on `.multi-item-clear`), so failing is the honest outcome; the alternative of parsing `opacity()` was not built. Each of those three inputs now goes red at 2.11:1. A word moved fully out of an `overflow-hidden` heading at 50% passes, because nothing of it paints. Also from review 2: `invisible` was accepted as hidden, but it drops the word from the accessibility tree, and the old pin had caught that as a side effect, so each of the three words must now be in the tree, and `invisible` on the far word goes red there. One input in review 2, `h-0 overflow-hidden` on the far heading, is still red, but on the existing "axe judged the inactive word next to the lit one" check, because axe no longer lists "contract expertise" among its passes once that heading collapses (the layout under the list changes; the exact cause was not traced). The contrast check itself skips the collapsed word. The rest of the file is unchanged, and all four of its tests passed against a production build (`vite build`, 2 m 12 s here) before review 2, and all four passed on the dev server after review 3 (the production build was not rerun after review 3).

This branch was cut from `main` while it was still on kit 2. On 2026-11-01 it took `staging` (kit 3, the mobile fixes #100 and #106) by merge and retargeted to `staging`, the site's working branch since 10-24; none of those changes touch this spec.

**Review 4 added three fixes to the same loop, and review 5 took one back.** Gradient text (`bg-clip-text text-transparent`) has a transparent colour, so its alpha read 0 and the word was skipped as hidden. Now a `background-image`, `background-clip: text`, a `-webkit-text-fill-color` apart from `color`, or a `mix-blend-mode` other than `normal`, on the word or an ancestor up to its ground, fails as unmodelled and names the property (on the phone it reads `background-image: linear-gradient(...); background-clip: text`). Review 4 also skipped a word that a positioned sibling covers, and scrolled the rotation to feed that skip. Review 5 found that skip unsafe, because hit-testing reads boxes, not paint. With the far word at `opacity-50 pointer-events-none`, the word dropped out of its own hit test, and its 2.11:1 "DIRECT" was skipped while in full view on a phone. At 1350, a cover that paints nothing or paints at partial alpha (`bg-mid` removed, or `bg-mid/40`) also hid the word from the check, though not from view. The round-5 fix removed the skip and the scroll, so every painted run is measured again. At 1350 the far word under `.bg-mid` is measured too, so `opacity-0 lg:opacity-50` fails there at 2.11:1 with a "may paint" message: it fails closed by design. Review 6 re-ran it: the unmodified file passed 16 of 16 on the dev server and 16 of 16 on a production build, and all six of round 5's inputs went red on both.

## 2026-11-03 — The contact form's interest dropdown is a native `<select>`, and `svelte-select` is gone (into `staging`)

Renovate's svelte-select 6 major (#116) failed `svelte-check` on `StyledSingleSelect.svelte:33:12`: v6's types no longer accept plain-string `items`. The operator chose "Native select, drop dep" over migrating (`reddoorla/reddoor-workspace` `decisions/2026-11-03-0622-p1-80b-prismic-v3-and-svelte-select-6.md`). The one caller was the contact form's "Select Interest" dropdown over three strings, which a native select covers with no JavaScript, so the component, the dependency (with `svelte-floating-ui` and three `@floating-ui` packages behind it), and 53 lines of global `app.css` that styled svelte-select's class names all went. `::placeholder` and the `input, textarea` opacity rule sat inside that block and stayed.

**The contract is the `select` field.** The server action forwards `form.get("select")` as `interest`. Before the change, the form sent it through a hidden `<input name="select">` bound to svelte-select's value, which started as `{ value: "Select Interest" }`. So an untouched form sent `select=Select Interest`, and every enquiry where nobody chose an interest arrived with "Select Interest" as its interest. That is kept: the placeholder option is `hidden`, not `disabled`, because a disabled selected option is left out of the submission. Dropping it would be a cleaner email but a behaviour change nobody asked for. The new `tests/smoke/contact-select.spec.ts` submits the real form, stubs the action's response, and reads `select` off the POST body. Run against the old svelte-select form in a worktree of `staging` (driving svelte-select's own list), the same assertions passed: it sent `DoD Contracts` when chosen and `Select Interest` untouched. That was the instrument's known-good run. The three mutations the brief named all turn "choosing an interest submits it as the `select` field" red: no `name="select"` (all three tests red), option values as indices (`"1"` instead of `DoD Contracts`), and an empty `PRODUCTS` passed from the contact page (`selectOption` finds nothing).

**The look.** At 1280 the before and after screenshots are pixel-identical at the field: 42px tall, `#ffffffcc`, a transparent 1px border, a 3px radius, a 16px inset, `#534422` text, and the same arrow, which fades to 55% on hover or focus. At 390 the text is 18px instead of 16px, because the native select takes the site's phone size for form fields, as the Email and Message fields beside it already do. svelte-select had held its own 16px. Axe, run ad hoc on the form, reports 0 violations, and the select passes `select-name` through an `sr-only` "Interest" label. The repo's axe suite does not visit `/contact` at all, so that run is not repeated in CI.

Gates: `pnpm lint` clean; `svelte-check` 0 errors (17 warnings, none in the changed files); `pnpm build` passes; the full Playwright suite, 67 passed. Renovate should close #116 on its next run, since the dependency it bumps is gone.

## 2026-11-04 — `@prismicio/svelte` 2 → 3 (#115, `6f78f9b`, into `staging`)

Part of the fleet majors sweep (reddoorla/reddoor-maintenance#1949, phase 2 group A), following the ERP pilot's recipe. Renovate's #115 landed as Renovate opened it: package.json and the lock only, 2.2.4 → 3.2.0. This entry rides a separate PR because nothing can be pushed to a Renovate branch.

No code change was needed. The slice simulator already used v3's `{#snippet children({ slices })}` form, nothing imports `SvelteRichTextSerializer`, and the site's own `PrismicPreview` copy already navigates with `refreshAll`. On `staging` (48bf64c) and on #115 alike: lint clean, `svelte-check` 0 errors and the same 17 warnings, the build green, and CI's Playwright run at 67 passed. There is no vitest here. The 6 prerendered pages (index, about, process, partners, resources, privacy) are identical once asset hashes, the kit version, the `__sveltekit_<id>` name, the CSP hash and all HTML comments are normalised.

**Belief corrected on contact:** that diff proves less here than it did on 29 Navy. None of those 6 pages renders a SliceZone. The routes are bespoke, and every live `page` document has `slices: []`, so `[uid]`'s `entries()` prerenders none of them. The proof that v3 is really in the build is the bundle instead: `prismic-slice-start` appears in the client and server chunks on #115 and nowhere on `staging`. Mutation: putting the v2 `<SliceSimulator let:slices>` slot back gives `svelte-check` `'$$_rotalumiSecilS0.$$slot_def' is of type 'unknown'` on v3, and the same file passes on v2.

The review (runtime, tests, deps) came back minors-only, filed as #125: the `@prismicio/client` floor `^7.3.1` against v3's `^7.23.0` peer (the lock already resolves 7.23.0), no test that renders SliceZone or the RichText slice, `engines.node >=20`, and the PrismicPreview copy's toolbar version. The reviewer also ran v3's new `redirectToPreviewURL` branches on `vite preview`. `?path=/about` returned a 307, `?path=//evil.com` fell back to `/preview/` (so it is not an open redirect), and `&session=` set the `io.prismic.previewSession` cookie.

## 2026-11-04 — The Capabilities PDF says VOSB, not SDVOSB, edited in the PDF itself (into `staging`)

MSOT is a Veteran-Owned Small Business, but `static/pdfs/MSOT_Capabilities.pdf`, the homepage's "Capabilities Statement", called it an SDVOSB (Service Disabled Veteran Owned Small Business) twice: in the mission paragraph and under SBA CERTIFICATION. Marketing had sent a whole replacement file. The operator cancelled that swap (#127) at 2:03pm PT because its palette and type are off brand, and asked for this one correction to the current, on-brand file instead.

The InDesign source exists in Dropbox (`/Clients/ZZ_Archived Clients/MSOT/Capabilities Statement/MSOT_Capabilities Summary.indd`). Its `06_pdf/MSOT_Capabilities Summary_1213.pdf` is 50,358 bytes, the same size as the live file, so it is almost certainly the export that went live. InDesign can't run in a cloud container, so I asked the operator. He chose to land a direct edit of the PDF now and fix the `.indd` the next time someone opens it (workspace `decisions/2026-11-04-2222-msot-caps-vosb-indd-source.md`). **The `.indd` still says SDVOSB.** An export from it without that fix would bring the error back.

The edit rewrites four `TJ` operators in the page's one content stream and nothing else. The new text needs a hyphen, a capital V and lowercase letters, and the RigidSquare-Regular subset already holds all of them: its CharSet lists `hyphen`, and the DAPA numbers use it. So no font changed. Size (8pt), tracking (`Tc` 0.015 and 0.02), colour and line positions are untouched. The lines were reflowed the way InDesign would, against the frame's right edge at 576pt. I computed the line widths from the font's `/Widths`, `Tc` and the existing kern values, and they matched the PDF's own bboxes to 0.1pt (line 2 at 574.89 against a bbox of 574.8). In the mission paragraph, "status, and deep" now fits on line 2 (ending at 562.8pt), and line 3 starts at "network". Under SBA CERTIFICATION, "VOSB (Veteran-Owned Small Business)" fits on one line (547.0pt), with "Certification" below it. The new kerning pairs ("(V", "n-", "-O") are 0, because the subset carries no kern table. That isn't visible at 2×.

Checked: `pdftotext` finds 0 "SDVOSB" or "Service Disabled", and the same three fonts are embedded. A 2× pixel diff against the old file changes only the two text regions. The file went from 50,358 to 49,889 bytes because pymupdf re-deflated it on save.

The other errors Marketing listed (DoD → DoW, the missing "over years", DUNS → UEI/CAGE, the old ECAT and DAPA numbers, "DIBE: Disabled Business", the old contact block) are out of scope here and listed in the PR.

## 2026-11-04 — The Capabilities PDF takes the follow-up fixes its font subsets can carry (into `staging`)

Once VOSB was on staging (#128), the operator chose to fold in whichever of Marketing's other corrections a direct edit can make, and to drop "DIBE: Disabled Business". That decided which fixes landed: the PDF embeds only subsets of its fonts. RigidSquare-Regular has no capital Q, Z or F, and BarlowCondensed-Medium has no G. So UEI Z7Q8TN9HMRC4, CAGE 6ZM08, "4903 Golden Quail" and "20 years of Air Force logistics" can't be set from this file without the `.indd` (still in Dropbox under `/Clients/ZZ_Archived Clients/MSOT/Capabilities Statement/`, and still saying SDVOSB too).

Landed: the header reads "CONNECTING VA + DOW HOSPITALS WITH MED-SURG SUPPLIERS"; "the DoD & VA healthcare landscape" reads "the VA and DoW healthcare landscape"; the phone is 833.307.4418; the email is info@MedicalSolutionsofTX.com (still under the "KATHY CASTRO" heading); the DIBE line is gone and the list below it closes up by one 14pt line. The contact block is positioned by a `Td` relative to the "Certification" line, so dropping a line would have pulled the whole footer up 14pt. The `Td` went from −28.75 to −30.5 to hold it, and the street and city lines render pixel-identical to before.

"VA and DoW" is 12.9pt wider than "DoD & VA", so the paragraph reflows. Its frame edge isn't in the PDF, but the existing breaks bound it to 509.0–519.3pt (line 2 fits at 509.0 without its trailing space; line 1 plus "nearly" would end at 519.3). The new line 2 would end at 521.9pt, over either bound. The greedy reflow gives the same four lines anywhere in that range: "DoW" opens line 3 and "and" opens line 4.

Not done, on purpose: "San Antonio, Texas 78232" → "San Antonio, TX 78240" was in the list I offered, but changing it under the unchangeable "1583 Thousand Oaks Drive" would print an address that doesn't exist. The address block stays whole and old until the `.indd` is edited. Also still old: "With over years of DoD Logistics" (the missing number, and "Air Force" needs an F), DUNS, ECAT and DAPA. The paragraph now says "DoD Logistics" one line above "VA and DoW". That is accurate history, not a style slip, but the `.indd` rewrite should settle it.

## 2026-11-04 — Marketing's Phase 1 briefs, the "yes" items, built into `staging` (#132–#139, #143 `c7b963d`)

> The first of the three yes-pass sessions landed #132 and wrote its own pointer in the workspace journal; this entry covers the second, third and fourth (#133–#139, #143). The plan, with the critical pass on every item, is the workspace's `briefs/2026-11-04-msot-phase-1/yes-pass.md`.

MSOT Marketing sent four briefs for "AEO/GEO": copy fixes, an identity block, per-page metadata, five kinds of structured data, llms.txt, the FAQ and timeline as text, a /capabilities page, the LinkedIn tag through Tag Manager, and editable bios. The operator's position is that AEO is SEO: make sure every fact exists as text. Each item got a critical pass against that, Google's own AI-search guide, the code and the cost, before any build. Most survived. Service, FAQ, Person and WebPage markup, llms.txt, hand-run prompt tracking and the tag-on-page-load did not; the client letter carries those whys. Everything below is in `staging`, and nothing is promoted: that is the operator's call.

**What landed, and why.** `src/lib/identity.ts` (#133) holds MSOT's facts once, and the footer (both of them: Home keeps its own copy), Contact, the Organization JSON-LD (#137) and /capabilities all read it, so the visible text and the markup can't disagree. #134 gave every page its own title, description and canonical, moved the khaki logo off the title string `"MSOT | Resources"` (new titles would have silently broken it) onto the route, and made one `<h1>` per page except Home, whose hero is held. #136 turned the `Accordian` into `<details>`/`<summary>`, so the Process FAQ answers and About's DAPA/ECAT/FSS lines are in the server HTML for the first time; it replaced the 17,571-line timeline SVGs with an `<ol>` of Marketing's five steps, and named all 18 partner logos. #138 added /capabilities from Marketing's new PDF, and the sitemap now lists code routes with no `lastmod`, since nothing records when a code change altered them. #139 loads Tag Manager on first interaction, pushes `msot_contact_submit` on a real send, and takes the Privacy Policy out of draft. #143 adds the `team_member` Prismic type; today's cards stay until each person's document exists.

**Defects the reviews caught that screenshots and first-draft tests did not.**

- `<h1 class="h2">` took the h1 font, visible only in computed style (#134).
- The `<details>` accordion lost its side-by-side layout at the site's `xl`, which is **1340px** (`src/app.css`), not Tailwind's 1280. The first fix, `grid-cols-2`, let a one-line question's column shrink, so from 1340 to 1400px the question ran into its answer: 8px apart at 1360 against staging's 80. `xl:grid-cols-[minmax(max-content,1fr)_1fr]` holds 80px at every xl width (#136, rounds 1 and 2).
- `createIngestAction` answers spam it screens out (a filled honeypot, or a send under 800ms after the form's `ts`) with a decoy `{ success: true }`, so the first conversion push counted spam as a LinkedIn lead. The client now runs the same two screens; it measures from mount, which is after the server's stamp, so a send that passes the client passed the server (#139, round 1).
- The first team build fell back all or nothing: one published `team_member` document would have left that one person on About and dropped the other four. It now merges by name (#143, round 1).

**Beliefs corrected on contact.**

- **Chromium fires a trusted `pointermove` with `movementX`/`movementY` of 0,0 when the layout shifts under a resting cursor.** It did so on 4 of 6 headless loads of /contact with no input at all; real moves carried 40,40 and 7,0. An interaction gate that counts `pointermove` therefore fires in an unattended Lighthouse run wherever the layout moves under the cursor. The Tag Manager loader ignores zero-movement moves; `VimeoGate` has the same gap, filed as #141. The test that found it was "an unattended load of /contact requests no Tag Manager", which passed alone and failed in the full run.
- GA4's own `gtag.js` stamps `gtm.uniqueEventId` onto every object pushed to `dataLayer`, so a test that compares a push with `toEqual` has to drop `gtm.*` keys.
- A Playwright route glob `**/googletagmanager.com/...` never matches `www.googletagmanager.com`: the leading `**/` wants a slash before the host. A predicate on `url.href` does.
- Home's three life-story timeline SVGs draw "THE END USER IN MIND" as shapes, which no text test can see; item 1's copy fix couldn't reach them. They need Erik's redraw.
- Marketing's own approved timeline line ("DoW and VA") broke their own house order ("VA and DoW"); built in house order, flagged for them.
- The deny list refuses a force-push, so every branch took `staging` by merge, never by rebase.

**Tried and abandoned.** Three of #136's first-draft mutations tested nothing (a field nothing read, a fallback no item reached, an alt the footer badge duplicated). Two of #139's did too: an M3 that added a second `gtag.js` instead of moving the first, and an M17 that called the loader with no event, which threw instead of loading. Each was rewritten until it changed what the page shows, and then went red.

**Held, and why.** Home's hero is drawn lettering that still says DoD, and Home has no `<h1>`, until MSOT says which line is the heading and Erik decides between a redraw and live type. /capabilities has no download button until MSOT says yes to restyling the new PDF; the one on the site still carries 78232 and "years of DoD Logistics". The `team_member` model reaches Prismic only when `staging` reaches `main`. Inside GTM, everything waits on Publish access and two LinkedIn conversion IDs; the limits of loading on interaction (a first click on the PDF link beats GTM's click listener; a landing page view can be lost on client navigation) are #144. Review minors are #140, #142 and #144.

**#143's ordering took four rounds, and two of them were wrong in the same way.** The rule is "order N is the Nth card", while Marketing publishes people one at a time. Round 2's fix made a document go ahead of a card at the same index, which held only for order 1. On today's five cards, Jon alone at order 5 came out 4th, and Kylene at 1 with Courtney at 2 put Courtney 3rd, because the other cards kept their old indexes and the document's order only broke ties against them. Round 2's own test pinned the bug: it expected a new hire at order 2 in third place. Now the documents with an order are sorted and inserted at `order - 1` into everyone else's list (today's cards in today's order, then new people with no order, by name), each tie going right after the one before. Round 4 ran 28 inputs and found no defect. It did find two mutants alive: `Math.floor` for `Math.ceil` (fractional orders) and the name tie-break among new people. One assertion each now kills them. The fourth test gap was quieter: the test image's own URL carried `auto=format`, so "the headshot asks for WebP/AVIF" could not fail until the fixture lost it. Mutations T1–T24 are in the PR body. It was checked on the staging deploy at 8:49pm PT: five cards, each with §8's alt, where a minute before the deploy staging still served `alt="Jon Hood"`.

**The client letter** (workspace `briefs/2026-11-04-msot-phase-1/response/`) took six Opus rounds; the sixth was the operator's call after five dirty ones. Almost every catch was a sentence saying more than one engine and two runs can say. Two corrected what this site's own record believed. First, the linked audit report told MSOT that `medicalsolutionsoftx.com` has no MX and no SPF record. Both exist (Outlook MX, SPF with Outlook and Google, checked 11-05 on two resolvers), so the link came out and the audit tool's fault went to its own task. Second, "Home has no `<h1>`" is false on phones: the held hero renders an `<h1>` after JavaScript runs, and Google indexes that render, with "DoD" in it. The other on-site PDF fields that still disagree with `identity.ts` (the address, ECAT SPE2DE20D7034, DAPA SPO200-11-H-0031, DUNS) are now named to MSOT as reasons for the restyle.

**Still open from this pass:** the sitemap gives Prismic pages their 2024 publish dates, though this update changes those pages in code, and nothing records a code edit's date. The site's own PDF-download event (#144) is listed as next work, not built.

## 2026-11-05 — Home's Capabilities button opens the corrected PDF again, and pushes its own download event (#144)

The operator, 11-05 about 12:00pm PT: "link the corrected pdf rather than the unstyled page." #146 had sent Home's "Capabilities Statement" button to `/capabilities` that morning, which left nothing on the site linking `/pdfs/MSOT_Capabilities.pdf`. The client's brief counted on that link, both as the button and as the LinkedIn conversion trigger. The PDF at that path is the 11-04 correction (VOSB, "VA + DOW"). It still carries the old address, a DUNS number and "over years of DoD Logistics", which the operator accepts until the restyle. Resources keeps its "READ IT" link to `/capabilities`, and `/capabilities` still has no download.

**The event is the site's own, `msot_capabilities_download`, with no other keys.** #144 explains why a GTM "Click – Just Links" trigger can't count this: Tag Manager loads on the first interaction, so a visitor whose first act is clicking the PDF starts `gtm.js` loading with that same `pointerdown`, and the click listener is not there yet. The push sits in `dataLayer` behind the `gtm.js` event and Tag Manager reads both when it arrives. Marketing's trigger should be a Custom Event on that name.

**The button now opens the PDF in a new tab, and that is part of the fix.** Before #146 it opened the PDF in the same tab. A same-tab load unloads Home, and with it a Tag Manager that the click had only started fetching, so a first-click push would have gone nowhere. With `target="_blank" rel="noopener"`, Home stays open and the queue is still there when `gtm.js` lands. The catalog PDFs on Resources already open in a new tab the same way, though theirs carry `noopener noreferrer`. `BracketButton` took `target` and `rel` props for it, and the link's accessible name is now "Capabilities Statement (PDF, opens in a new tab)". The nightly form-e2e probe only submits the contact form, so it never clicks this button and needs no test-mode screen.

**A belief corrected while running the mutations.** One mutation made the push wait until "Tag Manager has loaded", tested as `window.google_tag_manager`, and no test went red. GA4's hard-coded `gtag.js` defines `google_tag_manager` on every page load, before any interaction, so that guard checked nothing. Keyed on the container (`google_tag_manager["GTM-T4RZ2F54"]`), the same mutation turned both click tests red. Anyone checking whether GTM is present on this site should key on the container ID. The global alone means GA4 loaded.

**A test detail:** headless Chromium hands a PDF to its download path, so the new tab never settles on the PDF's URL and `waitForURL` timed out. The click tests check that the new tab requested the PDF instead.

**Review round 1 (Opus) reproduced one undercount.** A middle-click opened the PDF and pushed nothing, because it fires `auxclick`, not `click`. The button now pushes on `auxclick` with `button === 1` as well. A right-click also fires `auxclick` and is held out, with a test for it. "Open link in new tab" from the context menu fires neither event, so it can't be counted, and Marketing's numbers will run slightly low by that much.

**The first try at that warning broke CI.** It was a visually hidden `<span>` inside the link. `mobile-overflow.spec.ts` walks every text node, and the absolutely positioned span reported a box past the right edge at 320 and 390px. My full local run had been before that commit. The warning is now an `aria-label` that starts with the visible words, so it adds no text node, and the warning stays out of the link's `innerText` (GTM's Click Text), which reads `"[\nCAPABILITIES STATEMENT\n]"` in Chromium as before.

## 2026-11-05 — The footer's identity block folds its extra lines into a closed `<details>` (#156)

**Why.** The operator, looking at the staging footer at about 12:20pm PT: "we need to clean up the footer, it looks hideous. does it work if we put all the extra text into a 'details' accordian." After #151 the block in `FooterIdentity.svelte` was six lines of white `label` type: name, the §12b definition, the VOSB line, address with phone and email, UEI · CAGE · FSS, and ©. Now four are in view: the name, phone · email (still `tel:` and `mailto:`, still in an `<address>`), a "Company details +" summary, and the © line with Privacy Policy. The definition, the VOSB line, the street address (in its own `<address>`) and UEI · CAGE · FSS sit inside a native `<details>`, closed by default. Every word is still in the server HTML, which is why it is `<details>` and not a JavaScript toggle: §12a–d's point was that a crawler or AI assistant reads the identity before any script. The marker is the FAQ Accordian's lucide `Plus` at 14px, turning 45° to an × when open. No colour or band changed: the 3.36:1 white on khaki stays on Erik's list.

**Measured.** Closed, the footer is 68px shorter at 1440px (the page went from 8,806px to 8,738px on Home, 5,669px to 5,601px on About) and 268px shorter at 390px (10,349px to 10,081px on Home). Each footer's top sits exactly where it did on `staging` at 1440, 1100 and 390px on both pages (Home 8,502.16 / 8,093.61 / 9,820.67px; About 5,339 / 5,292 / 7,984.92px). The pixel diffs above the footer fall in the bands of the scroll-filled outline headings ("LET'S GET STARTED" and others), which differ between two runs of `staging` itself (up to 3,018px). A crop of each band shows the same layout with a different fill frame.

**Tests changed, not weakened.** `identity.spec.ts`'s single line "address · phone · email" became two lines, because this change splits that line on purpose. Both halves are still asserted as text in the footer. The two FAQ counts in `process-text.spec.ts` ("exactly N `<details>` on the page") now count the page above its footers, so the footer's own `<details>` is not taken for an FAQ answer. The count is still exact. New: per page, a single `<details>` with no `open`, its four lines inside, and the visible lines and both links outside. On `/` and `/about`, with JavaScript off, Enter on the focused summary opens it and Enter again closes it. All seven named mutations went red (table in the PR).

**Belief corrected on contact.** The first after-screenshots showed About 40,216px tall and unstyled. That came from the screenshot server, not the change. `pkill -f "vite preview"` never matches the process (its command line is `vite.js preview`), so the first preview server kept port 4317. The second one died on `--strictPort` into a log I did not read, and the stale server sent HTML naming stylesheets it did not have. Once the CSS returned 200, the numbers above came out.

**Overlap.** #150 (the `settings` singleton, open) edits this same component, to read `page.data.identity` in place of `IDENTITY`. Whichever lands second takes the other's half: this one's structure, that one's data source.

**Review round 1 (Opus) was clean, with minors only; four were folded in.** The reviewer named two broken versions the first tests would have passed: the © line hidden below 640px (`max-sm:hidden`, the very bug the © line had before §12d), and a `<summary>` taken out of the tab order (`tabindex="-1"`), which `.focus()` reaches anyway. The keyboard test now runs at 1440 and 390px, asserts the name, phone, email, © and Privacy link are visible, and gets to the summary with Tab from the email link. M8 (`max-sm:hidden` on ©) and M9 (`tabindex="-1"`) both go red. The `<address>` regexes no longer run past a `</address>`. At 390px the "·" was left dangling at the end of the phone line. Below `sm`, the phone and email now take a line each with no separator. Two attempts failed first. `whitespace-nowrap` on "phone ·" kept the dot at the line end. A `<span>` holding " · " lost its leading space, because Svelte trims whitespace at the start of an element, which drew "4418· info" at 1100px. The kept form is `&nbsp;·`. The summary's hover colour on khaki (`text-light`, about 2.4:1) matches the links' and goes on Erik's contrast list rather than changing here.

## 2026-11-05 to 11-08 — Every page's copy moves into Prismic, with today's words as the fallback; the content waits in an unpublished release (#150, #158, #159, #161–#164, #166–#170, #172, #173, #175, #176; release `avD0GxIAAFBei9Nm`)

The operator's word on 11-05 was "all content should be in prismic, not in code". This entry covers the whole task, which ran across twelve agent sessions from 11-05 to 11-08. It sits in this docs-only PR because no code PR was left to carry it. Each PR body has the detail; this is the record of why, what it cost, and what turned out to be wrong.

**The shape, and the constraint that set it.** Model changes reach Prismic only when they merge to `main`, because `prismic-models.yml` pushes on `push: main`, and the staging→main promotion is the operator's. A pushed field can never be deleted by the tooling. So every PR landed on `staging` with the code's current words as a per-field fallback, the pattern #143 set for `team_member`, and every model had to be right before the promotion. The operator chose one singleton type per page over slices, and a normal promotion over an early models-only one. That gives ten types: `settings` (identity, Menu and Footer tabs, the error and untitled-page titles) and `home_page`, `about_page`, `process_page`, `partners_page`, `resources_page`, `contact_page`, `capabilities_page` and `privacy_page`, plus the preview routes (#169) so each type's Preview button opens its own page. On reading Prismic rather than the repo at the start, `msot` knew only `page` and `form_replies`: #143's `team_member` was on `staging` but not in Prismic. The six `page` documents already had SEO fields that win over `seo.ts`, so the SEO wording went out as a first release with no model change, and the operator published it on 11-05.

**How "nothing changes" was proved, every PR.** Production builds of `staging` and the branch were compared over all 7 prerendered pages and the sitemap, with scripts, modulepreload links and comments stripped, and a one-word negative control caught each time. Element screenshots were taken at 1440, 1100 and 390px. Mutations were named before the code, and every run starts with an unmutated control pass. That rule came from a runner that passed two spec paths as one argument: Playwright found no test, exited non-zero, and the runner counted every mutation as killed. Each PR also had Opus review rounds, up to five dirty ones. The staging deploy was checked after each landing. The one exception to "nothing a visitor sees" was #159, where the operator chose live type for Home's hero: "Connecting DoW + VA Hospitals with Med-Surg Suppliers" replaced 43k characters of `<path>` lettering, and timelines 2 and 3 read "The Clinician in Mind".

**Defects the reviews found, each of which would have shipped:**

- An expired preview cookie made every server-rendered page a 500, because the root layout rethrew every Prismic error. The layout is now strict only while `building`.
- Phone numbers: "833.307.4418 ext. 2" became `tel:+83330744182`, "TBD" became `tel:+`, and `+833.307.4418` passed as international. `toE164` now refuses ten digits shaped like a North American number in the international branch. The cost is that a real ten-digit foreign number of that shape (Belgium's `+32 2 555 12 12`) prints with no call link.
- Partners' quote logo and company name fell back one field at a time, so a new logo with an empty name would have been read aloud as "Revogen". They now fall back as a pair.
- `isFilled.richText` counts any two blocks as filled, so Enter then delete in an empty body blanked the section. `body()` now requires words.
- Home draws its own footer, which kept both logo alts in code, so a `vosb_alt` edit would have changed every footer but Home's.
- Fields that could never reach the screen: the error page's text (every 404 already carries "Page not found" or "Not Found"), `SITE_NAME` as the home page title (`$lib/seo` always titles "/"), and timeline 3's label hidden behind a photo. Each would have been a permanent field. The first two now show only when filled; the third stayed a constant.

**Privacy was the hard one.** Four of its sections are not plain text. Three are built from `PRIVACY_SERVICES`, and two print `settings`' legal name and email. A filled body freezes that, and the "over time and across different websites" disclosure could drop out unnoticed when a tracker changes. The operator chose bodies with tokens anyway (2(c)), and accepted that a filled body stops following the services. #175 added `{legal name}`, `{name}` and `{email}`. `{name}` is mine: the opening prints the legal name "doing business as" the trading name. Filling tokens in rich text means moving every later span's character offsets, which `fillRichText` does.

**The specs stopped reading live Prismic (#176).** The "with no document" tests pinned the code's words by reading production and assuming nothing was published. Publishing the release would have turned them red at once. They now read, under `vite dev` only, a document whose every field is empty, built from `customtypes/*/index.json` and asked for by cookie. I first thought a dozen tests were affected. Five review rounds found about twenty specs reading singletons live, one more layer per round. An exhaustive grep of every network entry point before the first push would have saved three rounds.

**The release (11-08, after the operator's promotion as #179 at 2:09pm PT).** The content was generated from the code's own fallback constants rather than retyped. Privacy's eight bodies came from the no-document `/privacy` HTML, with the tokens placed. The 18 client logos, Revogen's quote logo and Resources' three PDFs were uploaded from the staging deploy, and every upload's bytes matched the build's sha256. One unpublished release, https://msot.prismic.io/builder/upcoming/avD0GxIAAFBei9Nm, holds all nine documents. It was proved by read-back in three ways:

- **Field by field:** 225 of 226 seeded fields equal. The 226th was the checker's own fault: it read Resources' empty guide link as an asset.
- **Whole-site build:** a build with the read-back documents served to `getSingle` matched the seed build on every page except image and file addresses. Mapped back to code file names, all 10, 23 and 10 addresses on Home, Partners and Resources point to the same files, and a control that swaps two logos is caught.
- **Privacy and Contact:** `/privacy`'s visible text, and all 38 text segments, match the no-document build. The tag differences are the predicted ones: no `data-testid`s, `rel="noreferrer"` on links, and the opening inside `div.space-y-3`. `/contact` through `vite dev` differs only in the form's hidden `ts`.

A build with one marked word per document showed each page's own marker and the `settings` marker, on all 7 pages and `/contact`. Prismic kept the runs of four spaces in About's FSS answer (#160 item 1), in all 8 lines that have them.

**Beliefs corrected on contact, beyond the defects:**

- A field-level check can pass where the page would not. `rows()` falls back to the code's whole list when no document row is complete, so seeds without files compared equal through every logo. Only the build with files filled in showed that a `resources_page` row typed `FSS Catalog (Contract # {fss})` prints the braces, because only the code's rows fill `{fss}`. The release carries the number instead, and the fix is #178.
- A page test that reads raw HTML proves nothing, because SvelteKit serialises the layout's data into a script. Mutations survived until the tests stripped scripts.
- SvelteKit refuses `url.searchParams` on prerendered routes even under `vite dev`, so test fixtures moved to a cookie.
- Tailwind v4's source scan reads model JSON and comments: "italic" in a Privacy model added a `.italic` rule and changed every page's stylesheet hash.
- Prismic accepts a route-resolver entry for a type it does not know yet.
- A deploy cannot be proved by chunk names when the change touches only server code behind `dev`. Netlify's deploys API is the authority, and Netlify posts no commit status here.
- `kill` on `pnpm exec vite` leaves Vite holding the port. Start `node node_modules/vite/bin/vite.js` directly.

**What waits on the operator's publish.** The code copies stay as fallbacks until the release is published and the deploy shows the documents. Only then can they be removed. #178 (`{fss}` in a document row) is open. The "Technique Guide" row stays in code, because it links to `/` and a media field cannot hold that; it waits on a real PDF. #157, #160, #165 and #174 hold the reviews' filed minors.

## 2026-11-09 — Phones see the doctor's face in "let's get started", not a zoom on his ear (this PR)

Asked at about 11:25am PT. The operator wrote: "do we have a mobile crop for the 'let's get started?' it looks like it's using the full photo now". We did have one: `doctor_mobile.jpg` (3564×2752), served below 1024px through `<picture>` since #106 (10-28). The live HTML confirmed it: `currentSrc` was the mobile avif at 390 and 1023px. The crop was not the problem. Its box was. `ScreenWidthImage` put the mobile `<img>` in the same 16:9 cover box as the desktop photo, `w-[max(100vw,177.78vh)] aspect-video`, clipped by `max-h-screen`. On a 390×844 phone that box is 1500×844, and the section shows the middle 390px of it, about a quarter of the width. Phones saw a blurry close-up of his ear and mask strap, neither the full photo nor the crop's framing. At 1023×1366 the box was 2428×1366, the same zoom.

**The fix, below 1024px only.** When a `mobileSrc` is given, the box takes `max-lg:w-screen max-lg:h-screen max-lg:aspect-auto`, so the mobile image fills the section. A new `mobilePosition` prop sets its `object-position` through a CSS variable, under `max-lg:` only. Home passes `25% 40%`. On a portrait screen the image fits the height, so only the horizontal value matters there. A 390px phone shows 36% of the crop's width, an 820px tablet 54%, a 1023px one 58%. At 25% a phone shows glasses, mask, cap and ear. Wider screens add his hand at the cap tie. The vertical 40% matters only for a landscape phone, where it keeps the cap in. Bands without a `mobileSrc` get exactly the old class string.

**No comp.** The MSOT Figma file (`IzKypdulGWKZ0665x2v8Ax`) has no phone frame of this band. Its only phone frames are the timelines' "End User" ones. So the framing is the brief's default: the subject in view.

**The trade-off.** The text sits over the white mask at phone width, and it did before too. Measured as mean grey under the text block: before 95 at 390, after 134. Desktop sits at 109. Positions of 40% or more put the text over the dark scrubs (raw grey 86 at 40%, 56 at 50%), but the face leaves the frame at 390. At 40% and 50% the buttons still cross the mask, so a position change does not solve it. I kept 25%. A stronger darkening below 1024px would solve it, but that is a design change and not made here.

**Proof.** `tests/smoke/cta-mobile-crop.spec.ts`: at 390×844, 430×932, 820×1180 and 1023×1366, the image's box equals the section's (±1px) and its `object-position` is `25% 40%`. At 1024×768, 1100×800 and 1440×900 it keeps the 16:9 cover box at `50% 50%`. On unchanged `staging` the four mobile cases failed (width off by 1110 to 1405px) and the three desktop cases passed. Five mutations each turned it red: the box back to the cover box, the position class dropped, the section-sized box at every width, Home passing no position, and the position at every width. Element screenshots of the band, built `staging` against this branch with fonts confirmed loaded, gave 0 differing pixels at 1100×800 and 1440×900. The prerendered HTML of all 7 pages, normalised (scripts, modulepreload and comments stripped, asset hashes masked), differs only in Home's band. A planted attribute in `about.html` showed up, so the comparison can see a change. The first build differed on four other pages by a doubled space in the class attribute. Building the class string in one expression removed it.

**Instrument notes.** Serving a local build under the staging origin, needed because the Typekit kit is domain-locked, hung on the splash. `/_app/env.js` is served by Netlify's function, so the static build has no such file and the dynamic import threw. Fetching it from staging fixed it. Also, the project's Playwright 1.64 needed its own headless shell (`chromium_headless_shell-1248`). The container ships 1243.
