<script lang="ts">
  // One of Home's three "service member's life" timelines: a text-free back
  // layer, the words as live text, then a front layer of the photos that cover
  // the step labels, as the old pictures drew them. The front layer comes after
  // the text, so it paints over it. Every length scales with the picture, as the
  // SVG did: `--u` is one unit of the picture's own width (1440 on desktop, 359
  // on phones, swapped at the site's 769px breakpoint). Layout is
  // $lib/home-timelines; the words are props, from the home_page document.
  import { STEP_NUMERALS, type Box, type TimelineLayout } from "$lib/home-timelines";

  let {
    n,
    layout,
    eyebrow,
    heading,
    body,
    labels,
    hiddenLabel,
    labelsHidden = false,
  }: {
    n: number;
    layout: TimelineLayout;
    eyebrow?: string;
    heading: string;
    body: string;
    /** The six steps' words, without their numerals. */
    labels: string[];
    hiddenLabel?: string;
    /** Timelines 2 and 3 repeat the six steps; a screen reader hears them once. */
    labelsHidden?: boolean;
  } = $props();

  // Transparent: timeline 2 has no front layer on phones.
  const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  const at = (desktop?: Box, phone?: Box) =>
    [
      desktop && `--x:${desktop.x};--y:${desktop.y};--w:${desktop.w}`,
      phone && `--px:${phone.x};--py:${phone.y};--pw:${phone.w}`,
    ]
      .filter(Boolean)
      .join(";");

  const only = (desktop?: Box, phone?: Box) =>
    desktop && phone ? "" : desktop ? "desktop-only" : "phone-only";
</script>

<div class="tl" data-testid="timeline-{n}">
  <picture>
    <source media="(min-width: 769px)" srcset={layout.back.desktop} width="1440" height="650" />
    <img
      class="layer back"
      src={layout.back.phone}
      alt=""
      width="359"
      height="650"
      loading="lazy"
      decoding="async"
    />
  </picture>
  {#if eyebrow && layout.eyebrow}
    <p class="t eyebrow desktop-only" style={at(layout.eyebrow)}>{eyebrow}</p>
  {/if}
  <h4 class="t head" style={at(layout.heading.desktop, layout.heading.phone)}>
    <span class="num">{STEP_NUMERALS[layout.step - 1]}</span>
    {heading}
  </h4>
  <p class="t body" style={at(layout.body.desktop, layout.body.phone)}>{body}</p>
  <ol class="labels" aria-hidden={labelsHidden ? "true" : undefined}>
    {#each layout.labels as place, i (i)}
      <li class="t label {only(place.desktop, place.phone)}" style={at(place.desktop, place.phone)}>
        <span class="num">{STEP_NUMERALS[i]}</span>
        {labels[i]}
      </li>
    {/each}
    {#if hiddenLabel && layout.hiddenLabel}
      <li class="t label desktop-only" style={at(layout.hiddenLabel)}>{hiddenLabel}</li>
    {/if}
  </ol>
  <picture>
    <source media="(min-width: 769px)" srcset={layout.front.desktop} width="1440" height="650" />
    <img
      class="layer front"
      src={layout.front.phone ?? BLANK}
      alt=""
      width="359"
      height="650"
      loading="lazy"
      decoding="async"
    />
  </picture>
</div>

<style>
  .tl {
    position: relative;
    width: 100%;
    aspect-ratio: 1440 / 650;
    container-type: inline-size;
    overflow: hidden;
  }
  .tl * {
    --u: calc(100cqw / 1440);
  }
  .layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
  }
  .labels {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .t {
    position: absolute;
    display: block;
    margin: 0;
    padding: 0;
    left: calc(var(--u) * var(--x));
    top: calc(var(--u) * var(--y));
    width: calc(var(--u) * var(--w));
    font-family: "rigid-square", "helvetica", sans-serif;
    font-feature-settings:
      "liga" off,
      "clig" off;
    font-style: normal;
    color: #534422;
    text-align: left;
  }
  .eyebrow,
  .head,
  .label {
    font-weight: 600;
    letter-spacing: var(--u);
    line-height: 1.2;
    text-transform: uppercase;
  }
  .eyebrow,
  .head {
    font-size: calc(var(--u) * 15);
  }
  .body {
    font-weight: 400;
    font-size: calc(var(--u) * 24);
    letter-spacing: 0;
    /* The live desktop pictures were exported at 140%; phones at 120%. */
    line-height: 1.4;
  }
  .label {
    font-size: calc(var(--u) * 10);
    transform-origin: 0 0;
    transform: rotate(90deg);
  }
  .num {
    color: #998b6a;
  }
  .phone-only {
    display: none;
  }

  @media (max-width: 768px) {
    .tl {
      aspect-ratio: 359 / 650;
    }
    .tl * {
      --u: calc(100cqw / 359);
    }
    .t {
      left: calc(var(--u) * var(--px));
      top: calc(var(--u) * var(--py));
      width: calc(var(--u) * var(--pw));
    }
    .body {
      line-height: 1.2;
    }
    .desktop-only {
      display: none;
    }
    .phone-only {
      display: block;
    }
  }
</style>
