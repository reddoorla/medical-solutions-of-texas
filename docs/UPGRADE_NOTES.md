# Svelte 5 / Vite 8 / Tailwind 4 Upgrade Notes

Migrated from Svelte 4.2.8 / Vite 5.0.9 / SvelteKit 2.0.0 / Tailwind 3.4.1 / npm to the `reddoor-starter` reference stack on the `svelte-5` branch in May 2026.

## Final stack

|                              | Before                                                | After                                                          |
| ---------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| svelte                       | 4.2.8                                                 | 5.55.5 (caret `^5.23.0`)                                       |
| @sveltejs/kit                | 2.0.0                                                 | 2.59.1 (caret `^2.5.27`)                                       |
| @sveltejs/vite-plugin-svelte | 3.0.0                                                 | 7.1.1                                                          |
| vite                         | 5.0.9                                                 | 8.0.10                                                         |
| @sveltejs/adapter-\*         | adapter-auto 3 (auto-detect failed silently in build) | **adapter-netlify 6** with `{ edge: false, split: false }`     |
| tailwindcss                  | 3.4.1 (`tailwind.config.js`)                          | 4.2.4 (CSS-only `@theme` in `app.css`)                         |
| postcss                      | yes                                                   | **gone** — Tailwind 4 vite plugin replaces it                  |
| typescript                   | 5.3.3                                                 | 6.0.3                                                          |
| eslint                       | 8.55.0 (`.eslintrc.cjs`)                              | 10.3.0 (flat `eslint.config.js`)                               |
| eslint-plugin-svelte         | 2.35.1                                                | 3.17.1                                                         |
| svelte-check                 | 3.6.2                                                 | 4.4.8                                                          |
| @prismicio/svelte            | 1.0.3                                                 | 2.2.1                                                          |
| svelte-gestures              | 4.0.0 (`swipe` named export)                          | 5.2.2 (attachments API, wrapped via `$utils/swipeAction.ts`)   |
| Icons                        | `@fortawesome/*` npm + FA Kit CDN script              | `@lucide/svelte` 1.14.0                                        |
| Image lib                    | `@sveltejs/enhanced-img` (installed but unused)       | `@zerodevx/svelte-img` (installed, not yet used in components) |
| Package manager              | npm                                                   | **pnpm 10.33.1**                                               |
| Node                         | unspecified                                           | pinned `22.12.0` in `netlify.toml`                             |

Total bundle: 468 KB → 440 KB (~6% smaller). Tailwind 4 + Svelte 5 codegen saved ~40 KB; Lucide icons added back ~12 KB inline. Separately, dropping the FA Kit CDN `<script>` removes a ~70 KB external fetch on first page load — not visible in bundle size, but a real cold-start win.

`pnpm check`: 0 errors, ~24 warnings (all pre-existing a11y/markup quality nits — not introduced by the migration).

## Commit-by-commit

The branch was structured for safe revert. Each commit boots cleanly (`pnpm dev` → HTTP 200) even when rendering is partially broken between commits — full visual correctness is the final commit's job.

1. **bump deps** — package.json rewrite, pnpm switch, explicit adapter-netlify, ESLint flat config, `tsconfig.json` (replaces `jsconfig.json`), `vite.config.ts` with `@tailwindcss/vite` + `imagetools`, `netlify.toml` corepack envs, FA CDN kept temporarily.
2. **tailwind update** — `src/app.css` rewritten to `@import "tailwindcss"` + `@theme {}` + `@source inline()` for safelist replacement + `@utility bump/negative-bump`. Deleted `tailwind.config.js` and `postcss.config.js`. Fixed pre-existing tailwind config bugs (the `light:' #E1DDCB;'` typo, 5× duplicated screen-heights).
3. **automated migrate** — raw output of `npx sv migrate svelte-5`. 41 files modified, 16 of them carrying `@migration-task` warnings the codemod couldn't resolve.
4. **manual check** — hand-cleaned the 16 partial migrations (`$$props.class` → `class: klass + ...rest`), promoted `run()` from `svelte/legacy` to `$effect`, added typed `interface Props` everywhere, fixed all codemod-introduced `$state()` strict-type errors. 23 errors → 7 (the 7 being Commit 5 deferred).
5. **fa removed** — svelte-gestures v4→v5 wrapper (`createSwipeAction`), 8 FontAwesome usages swapped to Lucide, dropped FA Kit CDN script, deleted unused `SocialsRow.svelte` + `TeamBox.svelte`. 7 errors → 0.
6. **next** _(format normalization)_ — `pnpm format` repo-wide, plus targeted lint fixes (unused imports, `NodeJS.Timeout` → `ReturnType<typeof setInterval>`, `: any` → concrete types, stripped 10 zero-width / non-breaking spaces from CMS-pasted copy).

## Gotchas hit (the actual ones — not the planned ones)

### Build / config

1. **Netlify + Node 22 + pnpm 10.33+ corepack signature mismatch** — set `COREPACK_INTEGRITY_KEYS = "0"` and `NODE_VERSION = "22.12.0"` in `netlify.toml [build.environment]`. Without this, Netlify builds fail with "Cannot find matching keyid" when corepack tries to verify the pnpm signature.
2. **`postcss.config.js` deletion has to come before `pnpm dev` boots**. The plan put it in Commit 2, but the dev server crashes during `vite-plugin-svelte`'s preprocess of `svelte-select`'s vendored `<style>` block — PostCSS auto-discovers the broken `tailwindcss` plugin reference. Solution: delete `postcss.config.js` in the same commit you bump deps (Commit 1 here).
3. **`adapter-auto` was failing silently** in the v3 / pre-upgrade build — its output was _"Could not detect a supported production environment"_ but exit code was 0, so Netlify built fine but with no adapter wiring. Switching to explicit `@sveltejs/adapter-netlify` revealed and fixed this.
4. **Pre-pnpm `node_modules/@fortawesome/` dirs persist** across dep removal — even after dropping the deps and running `pnpm install`, the symlinks-from-npm directories under `node_modules/@fortawesome/` stay. Manual `rm -rf node_modules/@fortawesome` is needed to fully clear.

### Codemod (`npx sv migrate svelte-5`)

5. **Codemod stops on `$$props.class` patterns** — the very common `class="...{$$props.class || ''}"` idiom (used to forward arbitrary class overrides) is left unconverted with a `<!-- @migration-task -->` comment. In affected files, _other_ migrations (event handlers, slots) are also skipped. Hand-fix to:
   ```svelte
   let { foo, class: klass = '', ...rest }: Props = $props();
   ...class="...{klass}"
   ```
   Hit in **16 files** here.
6. **`$:` blocks emit `run(() => ...)` from `svelte/legacy`**, not `$derived` or `$effect`. Always hand-pass after the codemod to promote each one to the right rune. Side-effect blocks → `$effect(function descriptiveName() { ... })`. Pure derivations → `$derived` or `$derived.by()`.
7. **Codemod's `$state()` calls produce strict-type errors** — `let main: HTMLElement | null = $state()` becomes `HTMLElement | null | undefined` because `$state()` returns `undefined`. Either:
   - Provide an initial value: `$state(typeof window !== 'undefined' ? window.innerWidth : 1920)` (SSR-safe)
   - Or change the type: `HTMLElement | undefined` for `bind:this`.

### Tailwind 4

8. **No `safelist` config in v4** → use `@source inline("...")` directives in CSS to retain CMS-driven dynamic class generation. Brace expansion works: `@source inline("sm:justify-{center,start,end}")`.
9. **Tailwind 4 default border color changed to `currentcolor`** — gallerysonder hit a regression here; we didn't observe one (the project's borders were nearly all explicit-color). If you do, copy reddoor-website's `*, ::after, ::before, ::backdrop, ::file-selector-button { border-color: var(--color-gray-200, currentcolor); }` compatibility rule into `@layer base`.
10. **Arbitrary value cleanups deferred**: `border-[1px]` → `border`, `-translate-x-[1px]` → `-translate-x-px`, `duration-[2000ms]` → `duration-2000`, `aspect-[4/3]` → `aspect-4/3`. The IDE flags these via `suggestCanonicalClasses` warnings. Not blocking; do as a follow-up sweep.

### Svelte 5 idioms

11. **`ComponentProps<X>` requires `typeof`** in Svelte 5: `ComponentProps<typeof TestimonialBox>[]`, not `ComponentProps<TestimonialBox>[]`. Svelte 5 components are functions, not classes.
12. **Mixed event handler syntax** error — Svelte 5's compiler refuses to mix `on:swipe={x}` and `onclick={y}` within a single component. When migrating sliders that still use a Svelte 4 action's named-event listener, either fully migrate the action or rename `on:swipe` → `onswipe` (same handler, new attribute syntax).
13. **Slot fallback content** (`<slot>{text}</slot>` rendering `text` if no children passed) is **not** preserved by the codemod — it just becomes `{@render children?.()}`. Restore the fallback manually:
    ```svelte
    {#if children}{@render children()}{:else}{text}{/if}
    ```
    This caused a real bug in `DefaultButton.svelte`: callers passing `text="..."` without children got an empty button.

### Library swaps

14. **`svelte-select` 5.8.3 works under Svelte 5** despite being released January 2024 against Svelte 3 tooling. Compiles cleanly in Svelte 5's legacy mode; only emits a11y warnings on its `<style>` block. Verified by compiling its 4 vendored components with the v5 compiler (zero errors). Don't replace it preemptively.
15. **`svelte-gestures` v5 changed action API** to attachments-based. Wrap with the small factory below (also in `src/lib/utils/swipeAction.ts`) so existing `use:swipe` callsites keep working:

    ```ts
    import { useSwipe, type SwipeCustomEvent } from "svelte-gestures";

    export const createSwipeAction = (handler: (e: SwipeCustomEvent) => void) => {
      const gesture = useSwipe(handler, undefined, undefined, true);
      return (node: HTMLElement) => ({ destroy: gesture.swipe(node) });
    };
    ```

16. **FA Kit CDN `<i class="fa-...">` tags often outnumber the npm-package usages** — pre-flight `grep` for `@fortawesome` only catches the npm side. For a complete audit also `grep -E 'fa-[a-z-]+ fa-[0-9]+x|fa-sharp|fa-thin'`. We thought we had 2 sites; turned out to be 8 across 6 components.
17. **Lucide icon positioning differs from FontAwesome** — FA `<i>` glyphs anchor to text baseline; Lucide SVGs anchor to top-left. `<i class="absolute top-10">` and `<Plus class="absolute top-10">` render at visibly different vertical offsets. **Fix**: either adjust `top-*` values, or — much better — drop absolute positioning and let flexbox center the icon as a sibling of the text. The Accordian header icon hit this exactly.
18. **Lucide's core lib drops most brand icons** (Reddit, etc.). `@lucide/lab` has them, or hand-roll an inline SVG. We deleted the only two components that needed Reddit (unused dead code).
19. **`@prismicio/svelte` v1 → v2 was clean** — `<PrismicRichText>`, `<SliceZone>`, `<PrismicImage>` all kept their prop shapes. Only typing nit: `SliceZone`'s `slices` prop type for the slice-simulator snippet param needs `ComponentProps<typeof SliceZone>["slices"]`.
20. **`eslint-plugin-svelte` v3 stricter rules** generate noise on the legacy codebase. Pre-disabled five rules in `eslint.config.js`: `svelte/no-navigation-without-resolve`, `svelte/require-each-key`, `svelte/no-reactive-functions`, `svelte/no-useless-mustaches`, `svelte/no-at-html-tags`. Re-enable incrementally.

### CMS / content

21. **CMS-pasted copy contains zero-width spaces** (U+200B) and non-breaking spaces (U+00A0). ESLint v10's `no-irregular-whitespace` flags these as errors. Strip with:
    ```bash
    perl -i -pe 's/\xe2\x80\x8b//g; s/\xc2\xa0/ /g' path/to/file.svelte
    ```

## Pointers

- **Canonical reference**: `reddoor-starter` (at `~/Documents/GitHub/reddoor-starter/`) is the source of truth for any Reddoor SvelteKit/Prismic site going forward. When in doubt, match its file shapes (`svelte.config.js`, `vite.config.ts`, `eslint.config.js`, `app.css` `@theme` block, `$lib` aliases, store factory pattern in `*.svelte.ts`, prop typing convention).
- **Plan file used for this upgrade**: `/Users/tuckerlemos/.claude/plans/look-at-my-reddoor-dazzling-map.md` — kept for posterity.
- **Cross-project upgrade recipe**: lives in two places, kept in sync:
  - `~/Documents/GitHub/reddoor-starter/docs/upgrading-from-svelte-4.md` — human-readable reference, committed to the starter.
  - `~/.claude/skills/svelte4-to-5-upgrade/SKILL.md` — auto-loads in Claude Code sessions when working on a Svelte 4 project.

## Out of scope (deferred)

These were excluded from the upgrade by design and remain as follow-up:

- Convert `.js` files in `src/` to `.ts` (incrementally as files are touched).
- Add tests (vitest + playwright, matching reddoor-starter's harness).
- Replace `svelte-select` with native `<select>` or a smaller library.
- Add CSP block to `svelte.config.js` (complex enough that misconfiguration breaks Typekit + Prismic preview at runtime).
- Tailwind 4 arbitrary-value canonical-class sweep (`-translate-x-[1px]` → `-translate-x-px` etc.).
- Fix the ~24 pre-existing a11y / markup-quality warnings surfaced by `pnpm check` (missing `aria-label`s, `<a>`-in-`<a>`, missing `alt`, implicit `</div>` close).
