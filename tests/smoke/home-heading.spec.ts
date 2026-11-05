import { test, expect } from "@playwright/test";

// Home's <h1> is the existing "Your Trusted Partner" box heading, in the server
// HTML; the phone hero line is decoration with the h1 look (the operator,
// decision 2026-11-05-1527, answers 1 and 2). Nothing on screen may change, so
// the look of both is pinned as computed style at each breakpoint.

const H4_LOOK = (size: string) => ({
  fontFamily: /barlow-condensed/,
  fontSize: size,
  fontWeight: "700",
  letterSpacing: "1px",
  textTransform: "uppercase",
});

for (const [width, size] of [
  [1440, "20px"],
  [1100, "20px"],
  [700, "16px"],
  [390, "16px"],
] as const) {
  test(`at ${width}px Home's one <h1> is "Your Trusted Partner", with the h4 look`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    // After mount: the phone hero has rendered by now, and is no heading.
    if (width <= 768) await expect(page.locator("p.h1", { hasText: "Hospitals" })).toBeVisible();
    const h1s = await page.locator("h1").allInnerTexts();
    expect(h1s.map((t) => t.trim().toLowerCase())).toEqual(["your trusted partner"]);
    const s = await page.locator("h1").evaluate((el) => {
      const c = getComputedStyle(el);
      return {
        fontFamily: c.fontFamily,
        fontSize: c.fontSize,
        fontWeight: c.fontWeight,
        letterSpacing: c.letterSpacing,
        textTransform: c.textTransform,
      };
    });
    const want = H4_LOOK(size);
    expect(s.fontFamily).toMatch(want.fontFamily);
    expect({ ...s, fontFamily: "" }).toEqual({ ...want, fontFamily: "" });
    // It still sits centred on the box's top border, as the <h2> did.
    const [h, box, pos] = await page
      .locator("h1")
      .evaluate((el) => [
        el.getBoundingClientRect().toJSON(),
        el.parentElement!.getBoundingClientRect().toJSON(),
        getComputedStyle(el).position,
      ]);
    expect(pos).toBe("absolute");
    expect(Math.abs(h.top + h.height / 2 - box.top)).toBeLessThan(6);
    expect(Math.abs(h.left + h.width / 2 - (box.left + box.width / 2))).toBeLessThan(2);
  });
}

for (const [width, size] of [
  [700, "60px"],
  [390, "50px"],
] as const) {
  test(`at ${width}px the phone hero line keeps the h1 look as a <p>`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    const hero = page.locator("p.h1", { hasText: "Hospitals" });
    await expect(hero).toBeVisible();
    const s = await hero.evaluate((el) => {
      const c = getComputedStyle(el);
      return [c.fontFamily, c.fontSize, c.fontWeight, c.lineHeight, c.textTransform];
    });
    expect(s[0]).toMatch(/barlow-condensed/);
    expect(s.slice(1)).toEqual([size, "600", `${parseFloat(size) * 1.2}px`, "uppercase"]);
  });
}

test("Home's Capabilities Statement button opens /capabilities, and Home links no PDF", async ({
  request,
}) => {
  const html = await (await request.get("/")).text();
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].filter((m) =>
    /Capabilities Statement/i.test(m[2].replace(/<[^>]+>/g, " ")),
  );
  expect(links.map((m) => m[1])).toEqual(["/capabilities"]);
  expect(html).not.toMatch(/\.pdf\b/i);
});
