# Morning brief — 2026-06-05

_Deep evening review of `medical-solutions-of-texas` (whole repo, all severities). Read-only: no commits, no pushes, no live writes. Repo was clean on `main` @ `8439000` at start._

**Health of the gates:** `pnpm lint` ✅ clean · `pnpm check` ✅ 0 errors / 24 warnings (a11y + reactivity nits) · `pnpm audit` ⚠️ 3 low / 12 moderate / 4 high. The migration landed well — these findings are mostly **pre-existing content/form bugs and a11y/SEO hygiene**, not migration regressions. The one thing to know up front: most of the dependency CVEs are exactly what your "self-healing" (Renovate) is built to clear — see the security section for which ones it will and won't reach.

---

## Top of stack (do this first)

Three highest-leverage, ~30-min-or-less actions. All three are pre-existing bugs that survived the migration, and the first two touch the site's actual business goals (SEO previews + the only lead-capture form on a DoD/VA contracting site).

1. **Fix the OG image — every page currently ships the fallback.** ~20 min. The 7 load functions return `meta_image` as a _string_ (`page.data.meta_image.url`), but `+layout.svelte:96` reads it as an _object_ (`?.url`), so `string.url` is always `undefined` and **every page's social preview silently falls back to `/msot-og.jpg`.** Pick one shape and use it consistently; guard with `?? null`. (Details in CRITICAL-adjacent HIGH #1.)
2. **Fix the contact form.** ~30 min. The "Your Name / Company" field is `type="email"` ([ContactForm.svelte:50](src/lib/components/FullWidth/ContactForm.svelte#L50)) so any company name without an `@` is rejected; the Netlify honeypot is declared but the `bot-field` input is missing (spam protection is off); and there's no success/error state. This is the primary conversion path — see HIGH #3.
3. **Add a 404 guard to the dynamic route.** ~15 min. [`[uid]/+page.server.js:8`](src/routes/[[preview=preview]]/[uid]/+page.server.js#L8) calls `getByUID` with no `try/catch` and no `error(404)`, so `/anything-missing` 500s, and the same unguarded pattern in the static routes means **one missing CMS doc fails the prerender build.** See HIGH #2.

Quick win you can fold in: delete `user-scalable=no` from the viewport tag (a11y, 2 min — LOW #1).

---

## Findings — CRITICAL

None. No active security incident, no committed secrets (the GA id and Google site-verification token in `app.html` are public-by-design, not secrets), no data-loss risk. The repo is safe to leave overnight.

---

## Findings — HIGH

### HIGH #1 — OG `meta_image` is double-dereferenced; per-page social previews never work

- **Where:** all 7 loads return `meta_image: page.data.meta_image.url` (a string) — [+page.server.js:15](src/routes/[[preview=preview]]/+page.server.js#L15) and the `about`/`contact`/`partners`/`process`/`resources`/`[uid]` siblings. Consumer at [+layout.svelte:96](src/routes/+layout.svelte#L96) reads `$page.data.meta_image?.url`.
- **Why it matters:** `("https://…").url === undefined`, so the `?? '/msot-og.jpg'` fallback fires on **every page**. Per-page OG images set in Prismic are dead. Wrong link previews across LinkedIn/X/iMessage for a marketing site.
- **Fix sketch:** Decide on string. In each load: `meta_image: page.data.meta_image?.url ?? null`. In layout: `content={$page.data.meta_image ?? \`${$page.url.origin}/msot-og.jpg\`}`. The `?.url ?? null` in the load also removes the empty-image throw risk below.

### HIGH #2 — Dynamic `[uid]` route (and static routes) have no missing-doc handling

- **Where:** [`[uid]/+page.server.js:8`](src/routes/[[preview=preview]]/[uid]/+page.server.js#L8) `const page = await client.getByUID("page", params.uid);` — no `catch`, no `error(404)`. Same unguarded `getByUID` in all static loads (home/about/contact/partners/process/resources).
- **Why it matters:** `getByUID` **throws** on a missing document. At runtime `/nonexistent` returns a 500 instead of a clean 404. At build time, `prerender = "auto"` means a single required UID missing from Prismic throws an unhandled error and **fails the Netlify deploy.** Brittle for a CMS-driven site where an editor can unpublish a page.
- **Fix sketch:**
  ```js
  import { error } from "@sveltejs/kit";
  const page = await client.getByUID("page", params.uid).catch(() => null);
  if (!page) throw error(404, "Page not found");
  ```
  Apply to the static loads too (or document that those UIDs are deploy-required).

### HIGH #3 — Contact form: wrong field type + missing honeypot + bypassed validation

- **Where:** [ContactForm.svelte](src/lib/components/FullWidth/ContactForm.svelte)
  - **L50:** the "Your Name / Company" `<input>` is `type="email"` → browser rejects any value without `@`.
  - **L33-34 vs L36:** `netlify-honeypot="bot-field"` is declared but there is **no `bot-field` input** in the form — honeypot spam protection is silently inert.
  - **L13 + the Submit button:** `submit = () => form?.submit()`. `form.submit()` skips constraint validation and the submit event. Compounding this, `BracketButton` renders a `<button>` with **no explicit `type`** ([BracketButton.svelte:39](src/lib/components/Buttons/BracketButton.svelte#L39)), so it's an implicit `type="submit"` _and_ its `onclick` calls `form.submit()` — two competing submit paths. No field is marked `required`, and there is no post-submit success/error UI ([contact/+page.svelte:25](src/routes/[[preview=preview]]/contact/+page.svelte#L25) just renders `<ContactForm />`).
- **Why it matters:** This is the only working lead-capture path on the site (DoD/VA contracting — leads are the whole point). Today: garbage/empty submissions get through, valid company names get blocked, spam protection is off, and users get no confirmation (→ duplicate or abandoned submissions).
- **Fix sketch:** `type="text"` on the name field; add `<p hidden><label>Don't fill this out <input name="bot-field" /></label></p>`; give the submit button an explicit `type="submit"` and let the form submit natively (or `form.requestSubmit()`); mark email + message `required`; add a Netlify success redirect (`action="/contact?success=1"`) with a thank-you banner.

### HIGH #4 — Dead component with a build-breaking import path

- **Where:** [StyledMultiSelect.svelte:3](src/lib/components/FullWidth/StyledMultiSelect.svelte#L3) imports from `$lib/**assests**/icons/...` (typo — the dir is `assets/`, and `assests/` does not exist). Verified: the component is **imported nowhere** (grep clean), which is the only reason the build still passes.
- **Why it matters:** A latent landmine — the first time anyone wires this component in, `vite build` breaks with an unresolved import. Plus it's confusing dead code.
- **Fix sketch:** Delete the file (also `EmailSubmit.svelte` and `ContactBox.svelte` — see MEDIUM #5), or fix the path to `$lib/assets/...` if you intend to use it.

> **On the dependency CVEs (audit: 4 high / 12 moderate / 3 low):** these are framed as MEDIUM below, not HIGH, because the practical exploitability on a prerendered marketing site with no user-generated content is low _and_ Renovate is configured to clear most of them automatically. See **MEDIUM #1**.

---

## Findings — MEDIUM

### MEDIUM #1 — Dependency advisories; what self-healing will and won't reach

- **Runtime deps with real (if low-exploitability) advisories — these matter most:**
  - `svelte` 5.55.5 has **4 moderate SSR/XSS + ReDoS advisories**, patched in **5.55.7**.
  - `@sveltejs/kit` — `query.batch` cross-talk, patched **2.60.1**.
  - `devalue` (via kit) — **high**, DoS via sparse-array deserialization, patched **5.8.1**.
- **Dev/build-only transitive highs (low real risk):** `html-minifier` (via `@reddoorla/maintenance > mjml > mjml-cli`), `tmp` (via `@lhci/cli > inquirer > external-editor`). These only run in CI/email-build/dev tooling.
- **Self-healing reality check:** [renovate.json](renovate.json) extends `config:recommended`, runs **Mondays before 7am**, and **automerges patch/minor**. The svelte 5.55.5→5.55.7 and kit→2.60.1 bumps are patch-range and within the existing carets — **Renovate should auto-PR and automerge them Monday.** The dev-only transitive highs (`html-minifier`, `tmp`) are buried deep and may _not_ be reachable without an upstream bump to `@reddoorla/maintenance` / `@lhci/cli`.
- **Why it matters / action:** Mostly hands-off — let Monday's Renovate run do its thing, then **verify after** that `svelte`, `@sveltejs/kit`, and `devalue` actually moved (`pnpm audit` should drop to ~2 high + a handful of moderates). If you want it gone tonight-equivalent: `pnpm update svelte @sveltejs/kit` is safe and in-range.

### MEDIUM #2 — `setInterval` without cleanup in 3 of 4 sliders (real leak on client nav)

- **Where:** [SliderOfContentBoxes.svelte:69-71](src/lib/components/FullWidth/SliderOfContentBoxes.svelte#L69), [SliderOfTestimonialBoxes.svelte:68-70](src/lib/components/FullWidth/SliderOfTestimonialBoxes.svelte#L68), [ScreenWidthImageSlider.svelte:64-66](src/lib/components/ScreenWidth/ScreenWidthImageSlider.svelte#L64) start a `setInterval` in `onMount` with **no return cleanup**. [ScreenWidthGallerySliderSmall.svelte:60](src/lib/components/ScreenWidth/ScreenWidthGallerySliderSmall.svelte#L60) does it correctly (`return () => clearInterval(...)`).
- **Why it matters:** SvelteKit does client-side nav between prerendered pages. Intervals keep firing after unmount, mutating `$state` on dead components → console errors, CPU churn (every 5s per slider visited), small memory leak.
- **Fix sketch:** `onMount(() => { …; return () => clearInterval(sliderInterval); })` in all three.

### MEDIUM #3 — Two conflicting viewport meta tags; the injected one blocks zoom

- **Where:** [app.html:11](src/app.html#L11) emits `<meta name="viewport" content="width=device-width" />` (clean), and [+layout.svelte:99](src/routes/+layout.svelte#L99) injects a **second** `<meta name="viewport" content="width=device-width, initial-scale=1.0 user-scalable=no" />` via `<svelte:head>`. Note the layout one is also malformed (missing comma before `user-scalable`).
- **Why it matters:** Two viewport tags → browser-dependent behavior. The injected one disables pinch-zoom (`user-scalable=no`) — a WCAG 1.4.4 failure, and a pointed one for a **medical/veteran audience** (older / low-vision users). a11y is a stated priority for this site.
- **Fix sketch:** Delete the `<meta viewport>` line from `+layout.svelte`; keep the clean one in `app.html`.

### MEDIUM #4 — `[uid]` prerenders the named pages a second time (route shadow)

- **Where:** [`[uid]/+page.server.js:19`](src/routes/[[preview=preview]]/[uid]/+page.server.js#L19) `entries()` enumerates **all** `page` docs, including `about`/`contact`/`partners`/`process`/`resources` — which also have dedicated routes. SvelteKit serves the static route, but both get prerendered.
- **Why it matters:** Each named page is built twice; if the `[uid]` generic template and the dedicated `+page.svelte` ever diverge, you get content drift and wasted build output.
- **Fix sketch:** Filter reserved UIDs out of `entries()`: `pages.filter(p => !["home","about","contact","partners","process","resources"].includes(p.uid)).map(...)`.

### MEDIUM #5 — Three unused dead components carrying their own bugs

- **Where:** `StyledMultiSelect.svelte` (broken import, HIGH #4), `EmailSubmit.svelte` (its button does `click={() => SubmitEvent}` — references the global constructor and discards it; no `name`/`netlify`/`action`, so it submits nowhere), `ContactBox.svelte` (placeholder lorem data — `385 Noah Place`, `877-255-7945`, `info@form.com` — plus an empty `<script>`). All three are imported nowhere (grep confirmed).
- **Why it matters:** Each is a trap waiting for a future "let's use this" — fake contact data or a no-op form could ship by accident.
- **Fix sketch:** Delete all three. If `EmailSubmit` is a planned newsletter capture, finish it (wire to Netlify) rather than leave it broken.

### MEDIUM #6 — Scroll-lock is built on `window.onscroll` reassignment + magic-number timers

- **Where:** [+layout.svelte:49-83](src/routes/+layout.svelte#L49). `disableScroll`/`enableScroll` assign `window.onscroll` while `handleScroll` uses `addEventListener('scroll')` on a separate channel; unlock is driven by `setTimeout(… , 2400)` / `1050` magic numbers tied to transition timing.
- **Why it matters:** If a navigation/transition is interrupted, `isTransitioning` can stick and the `$effect` keeps scrolling locked → a "page frozen" bug that's hard to reproduce. Mixing `onscroll =` with `addEventListener` is a maintenance landmine.
- **Fix sketch:** Lock scroll via a `body` class (`overflow:hidden`), and unlock on `afterNavigate`/transition-end rather than fixed timers.

### MEDIUM #7 — Render-blocking third-party scripts on every page

- **Where:** [app.html:12](src/app.html#L12) loads `https://player.vimeo.com/api/player.js` as a **blocking** `<script>` in `<head>` on every page, plus Typekit CSS (L13) and GA (L18, already `async`).
- **Why it matters:** The Vimeo player loads site-wide even on pages with no video — a needless render-blocking request that will show up in the Lighthouse budget (`lighthouserc.json` / `@lhci/cli` is wired in).
- **Fix sketch:** Make it `async`/`defer`, or load it only on the route(s) that embed Vimeo. Consider `media`/preconnect for Typekit.

---

## Findings — LOW

1. **`user-scalable=no` zoom block** — covered in MEDIUM #3; the 2-minute version is just deleting that attribute. Top-of-stack quick win.
2. **`ScreenWidthImageSlider` a11y gaps** — arrow buttons have no accessible name and their `<img>` chevrons have no `alt` ([:114-120](src/lib/components/ScreenWidth/ScreenWidthImageSlider.svelte#L114)); the dot buttons carry `aria-hidden` on **focusable** controls ([:109](src/lib/components/ScreenWidth/ScreenWidthImageSlider.svelte#L109)) — an ARIA violation (tabbable but removed from the a11y tree). Sibling `ScreenWidthGallerySliderSmall` does both correctly (`aria-label="Previous/Next slide"`) — copy that. These are the bulk of the 24 `pnpm check` warnings.
3. **`state_referenced_locally` warnings are benign today** — verified every slider/Accordian consumer passes **static, never-reassigned** props (or uses defaults), so the warnings are not active bugs. `Accordian.svelte:24` is actually correct-by-design (independent UI state). They become real bugs only if these components are ever fed dynamic Prismic data; if so, convert the prop-derived `let`s to `$derived` first (`SliderOfContentBoxes:37`, `:73-79`; `ScreenWidthImageSlider:68`). Documenting so the next review can grade it.
4. **Leftover `console.log(sliderIndex)`** in [SliderOfContentBoxes.svelte:61](src/lib/components/FullWidth/SliderOfContentBoxes.svelte#L61) and [SliderOfTestimonialBoxes.svelte:60](src/lib/components/FullWidth/SliderOfTestimonialBoxes.svelte#L60) — fires on every slide. Remove.
5. **Test/dev routes ship to the public production build, crawlable.** `build/dev/a11y-fixtures.html` and `/slice-simulator` are prerendered into prod; `static/robots.txt` is `Disallow:` (allow-all) and there's no `noindex` meta anywhere. Low SEO-hygiene smell for a client site. Add `<meta name="robots" content="noindex">` to the fixtures/simulator heads, or exclude them from the prod build. (The a11y-fixtures page is intentional — it's the lhci/axe target — just shouldn't be indexable.)
6. **No `sitemap.xml`** in `static/` and none generated — minor SEO miss for a multi-page marketing site. A small prerendered `+server.js` sitemap endpoint would help.
7. **`netlify.toml` Node pin loosened from documented value.** [netlify.toml:6](netlify.toml#L6) pins `NODE_VERSION = "22"` (floating major) where `docs/UPGRADE_NOTES.md:25` specifies `22.12.0`. `COREPACK_INTEGRITY_KEYS = "0"` mitigates the corepack-signature risk the exact pin was guarding against, so this is low-risk — but it's doc drift; either re-pin to `22.12.0` or update the notes to say "22.x, corepack key check disabled."
8. **Duplicated slider implementation (4 near-identical carousels)** — `SliderOfContentBoxes`, `SliderOfTestimonialBoxes`, `ScreenWidthImageSlider`, `ScreenWidthGallerySliderSmall` reimplement the same index/animate/swipe/interval logic and have **already drifted** (cleanup + `$derived` present in one, missing in the others — that drift is the root cause of MEDIUM #2 and LOW #3). This is the "4th copy of the same shape" signal that an abstraction is overdue. Not urgent; flag for the next time one needs a fix — extract a shared `useCarousel` rune or a base `<Carousel>` with an item snippet, fixing all four at once.

---

## Open loops carried forward

These are documented as **deliberately deferred** in `docs/UPGRADE_NOTES.md` ("Out of scope") — grading them so the next review can track:

- **CSP block in `svelte.config.js`** — still deferred. Correct call to defer (the notes flag it as easy to misconfigure against Typekit + Prismic preview). Open.
- **Convert `src/*.js` → `.ts` incrementally** — open; the route loads and `prismicio.js` are still `.js`. Do opportunistically when touching them.
- **Add tests (vitest + Playwright/axe)** — open. The `@playwright/test` + `@axe-core/playwright` + `@lhci/cli` deps are installed and the `/dev/a11y-fixtures` target exists, but I found **no `*.test.*` / `*.spec.*` files and no `playwright.config` test dir wired** beyond the stub `playwright.config.ts`. The harness is staged but empty — first test is the highest-value next infra step after the HIGH bugs.
- **Replace `svelte-select`** — open, low priority (notes verified it works under Svelte 5).
- **Tailwind 4 arbitrary-value canonical sweep** (`border-[1px]`→`border`, etc.) — open, cosmetic. Visible in ContactForm (`border-[1px]`, `rounded-[3px]`).
- **Fix the ~24 pre-existing a11y warnings** — partially addressed (the recent `+error.svelte` a11y commit closed one); the slider a11y gaps (LOW #2) remain.

## Decisions deferred

- **OG `meta_image` — string vs object shape?** I recommend standardizing on the **string** (`meta_image: page.data.meta_image?.url ?? null` in loads, consume as a bare string in layout) — fewer moving parts. Provisional; you may prefer returning the object if you also want `alt`/dimensions later. Couldn't ask — flagging.
- **Dead components — delete vs finish?** I recommend **delete** all three (StyledMultiSelect/EmailSubmit/ContactBox); they're unimported and buggy. If `EmailSubmit` is a planned newsletter capture, that's a "finish it" call only you can make.
- **`/dev/a11y-fixtures` indexability** — provisional recommendation: add `noindex`, keep the route (it's a legitimate lhci/axe target). Did not change anything.

## What I did NOT do tonight

Read-only review per the evening-review contract. **No commits, no PRs, no pushes, no live-service writes, no dependency installs/bumps, no file fixes** — even the obvious one-liners (viewport, `console.log`, `type="email"`). The only writes this session were (1) the session permission allowlist in `.claude/settings.local.json` (approved by you before I started) and (2) this brief. Working tree is otherwise unchanged from `main @ 8439000`. Tomorrow you decide what to fix; Renovate handles the dependency bumps on Monday.

---

### One thing you couldn't have gotten from today's diff

Every page's social-share preview has been broken since before the migration — the OG `meta_image` is returned as a string but consumed as an object, so all 7 routes silently serve the generic fallback image. It passes every gate (lint, check, build) because it's a runtime data-shape mismatch, not a type error. That's HIGH #1, and the 20-minute fix is the highest-leverage thing on the list.
