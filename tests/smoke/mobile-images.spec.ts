import { test, expect, type Page } from "@playwright/test";

// A phone gets the mobile art, a desktop the desktop art. Until 2026-10-28 each
// image's `src` was a JS ternary on `viewportWidth`, which starts at 1920 on the
// server, so the prerendered HTML always carried the desktop file; Svelte 5's
// hydration keeps a server-rendered attribute that differs from the client's,
// and the width never changed again without a resize, so every phone kept the
// desktop file. `<picture>` lets the browser choose before any JS runs.
//
// Each image is told apart by the file `currentSrc` names where the URL carries
// one (the SVGs, dev and build alike), and always by the natural aspect ratio
// of what loaded: imagetools' dev URLs are `/@imagetools/<hash>`, with no name.
type Art = { file?: RegExp; aspect: number };
type Image = { path: string; selector: string; desktop: Art; mobile: Art };

const timeline = (n: number): Image => ({
  path: "/",
  selector: `img[alt="timelines"] >> nth=${n - 1}`,
  desktop: { file: new RegExp(`/timeline${n}(\\.[\\w-]+)?\\.svg$`), aspect: 1440 / 650 },
  mobile: { file: new RegExp(`/timeline${n}_mobile(\\.[\\w-]+)?\\.svg$`), aspect: 359 / 650 },
});

const IMAGES: Image[] = [
  timeline(1),
  timeline(2),
  timeline(3),
  {
    path: "/",
    selector: 'section:has(h1:text-is("let’s get started")) img >> nth=0',
    desktop: { aspect: 6869 / 3784 },
    mobile: { aspect: 3564 / 2752 },
  },
  {
    path: "/process",
    selector: 'img[alt="timelines"]',
    desktop: { file: /\/timeline(\.[\w-]+)?\.svg$/, aspect: 1438 / 748 },
    mobile: { file: /\/timeline_mobile(\.[\w-]+)?\.svg$/, aspect: 385 / 1055 },
  },
];

async function loaded(page: Page, selector: string) {
  const img = page.locator(selector);
  // The timelines are `loading="lazy"`: a browser picks no source until the
  // image nears the viewport, and `currentSrc` reads "" until then.
  await img.scrollIntoViewIfNeeded();
  await expect
    // The timeline SVGs are 0.3-1.5MB, and a dev server under parallel load
    // took up to 5.5s for one; the default 5s poll flaked.
    .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), {
      timeout: 20_000,
    })
    .toBe(true);
  return img.evaluate((el: HTMLImageElement) => ({
    src: el.currentSrc,
    aspect: el.naturalWidth / el.naturalHeight,
  }));
}

for (const [width, kind] of [
  [390, "mobile"],
  [1440, "desktop"],
] as const) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 } });

    for (const path of new Set(IMAGES.map((i) => i.path))) {
      test(`${path} serves the ${kind} images`, async ({ page }) => {
        await page.goto(path, { waitUntil: "load" });
        for (const image of IMAGES.filter((i) => i.path === path)) {
          const { src, aspect } = await loaded(page, image.selector);
          const want = image[kind];
          if (want.file) expect(src, image.selector).toMatch(want.file);
          expect(aspect, `${image.selector} (${src})`).toBeCloseTo(want.aspect, 2);
        }
      });
    }
  });
}
