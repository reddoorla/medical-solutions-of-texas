# `src/app.html`: what its scripts do, and why

`src/app.html` ships in every page's HTML, comments included, so its notes live
here instead (moved out on 2026-11-05: about 1.2KB of internal notes, decision
numbers and Lighthouse figures were in every page's source).
`tests/smoke/app-html.spec.ts` keeps comments out of it.

## Google tag (gtag.js)

GA4 (`G-BZ0WQMEE8L`), hard-coded in `<head>`, counts every page view. It stays
outside Tag Manager, so page views are never counted twice (Marketing's
Developer Brief Part 1: "Don't also add GA4 inside GTM").

## Google Tag Manager (`GTM-T4RZ2F54`)

MSOT Marketing's container; it fires the LinkedIn Insight Tag. It loads on the
visitor's first `pointerdown`, `pointermove`, `wheel`, `keydown` or
`touchstart`, the same events as `VimeoGate.svelte`, never on page load: the
LinkedIn tag's third-party cookies take Lighthouse Best Practices from 100 to
about 78 when they load unprompted (decision 2207, answer 1, an estimate from
the audit's weights and October's measured 78).

- **A `pointermove` counts only if the pointer really moved.** Chromium fires a
  trusted `pointermove` with no movement when the layout shifts under a
  resting cursor (4 of 6 headless loads of `/contact`, 11-04). It is not a
  visitor, so it must not load the tag in a Lighthouse run. `VimeoGate.svelte`
  filters it the same way (#141).
- **No `<noscript>` iframe:** without JavaScript it loads a frame that runs no
  tags.
- **The limits** of loading on interaction (a first click can land before GTM's
  listeners exist) are in #144.
