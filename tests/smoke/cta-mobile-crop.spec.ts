import { test, expect } from "@playwright/test";
import { emptyCookies } from "./empty";

// Pin the code's wording whatever is published in Prismic (./empty).
test.beforeEach(({ context, baseURL }) => emptyCookies(context, baseURL));

// Home's "let's get started" band frames the doctor's mobile crop below 1024px.
// Until 2026-11-09 the mobile `<img>` sat in the same 16:9 cover box as the
// desktop photo, `w-[max(100vw,177.78vh)]`: 1500×844 on a 390×844 phone, of
// which the screen showed the middle quarter, a tight zoom on his ear. Below
// 1024px the box now fills the section and the image is framed on his head.
const BAND = 'section:has(.h1:text-is("let’s get started"))';
const MOBILE_POSITION = "25% 40%";

for (const [width, height] of [
  [390, 844],
  [430, 932],
  [820, 1180],
  [1023, 1366],
] as const) {
  test(`at ${width}×${height} the mobile crop fills the band, framed on his head`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/", { waitUntil: "load" });
    const img = page.locator(`${BAND} img`).first();
    await img.scrollIntoViewIfNeeded();
    const section = await page.locator(BAND).first().boundingBox();
    const shown = await img.boundingBox();
    expect(section).not.toBeNull();
    expect(shown).not.toBeNull();
    // The image is the section's size, not the 16:9 cover box's.
    expect(Math.abs(shown!.width - section!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(shown!.height - section!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(shown!.x - section!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(shown!.y - section!.y)).toBeLessThanOrEqual(1);
    expect(await img.evaluate((el) => getComputedStyle(el).objectPosition)).toBe(MOBILE_POSITION);
  });
}

// Desktop must not move: the photo keeps the 16:9 cover box, centred.
for (const [width, height] of [
  [1024, 768],
  [1100, 800],
  [1440, 900],
] as const) {
  test(`at ${width}×${height} the desktop photo keeps its 16:9 cover box`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/", { waitUntil: "load" });
    const img = page.locator(`${BAND} img`).first();
    await img.scrollIntoViewIfNeeded();
    const shown = await img.boundingBox();
    const coverWidth = Math.max(width, (height * 16) / 9);
    expect(Math.abs(shown!.width - coverWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(shown!.height - height)).toBeLessThanOrEqual(1);
    expect(await img.evaluate((el) => getComputedStyle(el).objectPosition)).toBe("50% 50%");
  });
}

// The framing above only holds if the mobile file is the one shown: `<picture>`
// switches at `(min-width: 1024px)`, Tailwind's `max-lg` at `width < 64rem`.
for (const [width, aspect] of [
  [1023, 3564 / 2752],
  [1024, 6869 / 3784],
] as const) {
  test(`at ${width}px the band loads the ${width < 1024 ? "mobile" : "desktop"} file`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    const img = page.locator(`${BAND} img`).first();
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), {
        timeout: 20_000,
      })
      .toBe(true);
    const loaded = await img.evaluate((el: HTMLImageElement) => el.naturalWidth / el.naturalHeight);
    expect(loaded).toBeCloseTo(aspect, 2);
  });
}
