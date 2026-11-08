import { test, expect } from "@playwright/test";
import { empty, emptyCookies, SINGLETONS } from "./empty";

// Pin the code's wording whatever is published in Prismic (./empty).
test.beforeEach(({ context, baseURL }) => emptyCookies(context, baseURL));

// Spelling, punctuation and house-style fixes in MSOT's own copy, found in the
// 2026-11-05 fresh review. Nothing is reworded. Read from the server HTML.

function text(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

const FIXES: Record<string, { fixed: string[]; gone: RegExp[] }> = {
  "/about": {
    fixed: [
      "20 years’ worth",
      "Sign DAPAs",
      "Get Listed in the ECAT",
      "awarded to the nine VA FSS",
    ],
    gone: [/the the/i, /Dapas/, /E-CAT/, /years worth/],
  },
  "/process": {
    fixed: [
      "with many partners and",
      "build further relationships",
      "approval on the ECAT, typically 45 working days or less.",
      "a medical manufacturer",
      "rollout to VA facilities and military bases",
      "med-surg equipment",
    ],
    gone: [
      /many, partners/,
      /relationship(?!s)/,
      /ECAT\. Typically/,
      /Medical Manufacturer/,
      /med-surge/,
      /military bases and VA/,
    ],
  },
  "/": {
    fixed: ["VOSB (Veteran-Owned Small Business)", "phases of service in between."],
    gone: [/Veteran Owned/, /inbetween/],
  },
  "/resources": {
    fixed: ["FSS Catalog (Contract # 36F797-25-D-0204)"],
    gone: [/36F79725D0204/],
  },
};

for (const [path, { fixed, gone }] of Object.entries(FIXES)) {
  test(`${path}: the copy fixes are in, and the errors are gone`, async ({ request }) => {
    const t = text(await (await request.get(path, { headers: empty(...SINGLETONS) })).text());
    for (const f of fixed) expect(t, f).toContain(f);
    for (const g of gone) expect(t, String(g)).not.toMatch(g);
  });
}

test("/process: the timeline's step titles are <h4> under its <h3>, with the h5 look", async ({
  page,
}) => {
  await page.goto("/process", { waitUntil: "networkidle" });
  const steps = page.locator('[data-testid="timeline"] li h4');
  await expect(steps).toHaveCount(5);
  await expect(page.locator('[data-testid="timeline"] h5')).toHaveCount(0);
  // The same look as the page's real <h5>s ("01 Refine"), property by property.
  const look = (el: Element) => {
    const c = getComputedStyle(el);
    return [c.fontFamily, c.fontSize, c.fontWeight, c.letterSpacing, c.lineHeight, c.textTransform];
  };
  const ref = await page.locator("h5", { hasText: "Refine" }).evaluate(look);
  for (const w of [1440, 390]) {
    await page.setViewportSize({ width: w, height: 900 });
    expect(await steps.first().evaluate(look), `${w}px`).toEqual(
      await page.locator("h5", { hasText: "Refine" }).evaluate(look),
    );
  }
  expect(ref[1]).toBe("15px");
});
