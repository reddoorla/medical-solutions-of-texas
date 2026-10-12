import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const RULES = ["color-contrast", "heading-order"];

const VIEWPORTS = [
  { name: "Lighthouse desktop", width: 1350, height: 940 },
  { name: "phone", width: 390, height: 844 },
];

const MIN_CONTRAST = 3;

async function openSettled(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/", { waitUntil: "load" });
  await expect(page.locator('img[src*="msot_logo_sand"]')).toHaveCount(0, { timeout: 15_000 });
  await expect(page.locator("footer")).toBeVisible();
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (a) => a.playState !== "running" || a.effect?.getComputedTiming().iterations === Infinity,
      ),
  );
}

for (const viewport of VIEWPORTS) {
  test(`/ passes ${RULES.join(" and ")} at ${viewport.width}×${viewport.height} (${viewport.name})`, async ({
    page,
  }) => {
    await openSettled(page, viewport.width, viewport.height);

    await expect(page.getByRole("heading", { name: /direct\s*results/i })).toHaveCSS(
      "opacity",
      "0",
    );

    const results = await new AxeBuilder({ page }).withRules(RULES).analyze();
    const scanned = [
      ...new Set([...results.passes, ...results.violations].map((r) => r.id)),
    ].sort();
    expect(scanned, "axe evaluated both rules").toEqual([...RULES].sort());

    const violations = results.violations.flatMap((v) =>
      v.nodes.map(
        (n) => `${v.id}: ${n.target.join(" ")} — ${n.any[0]?.message ?? n.failureSummary}`,
      ),
    );
    expect(violations).toEqual([]);

    const contrastPasses =
      results.passes.find((r) => r.id === "color-contrast")?.nodes.map((n) => n.html) ?? [];
    expect(
      contrastPasses.some((html) => /contract\s*(<br[^>]*>)?\s*expertise/i.test(html)),
      "axe judged the inactive word next to the lit one",
    ).toBe(true);
  });
}

test("We'll Get You keeps 3:1 against the footage behind it at 1350×940", async ({ page }) => {
  await openSettled(page, 1350, 940);

  const heading = page.getByRole("heading", { name: "We'll Get You" });
  const box = heading.locator("xpath=..");
  await box.locator("img").evaluate(async (img: HTMLImageElement) => {
    img.loading = "eager";
    await img.decode();
  });

  const textColor = await heading.evaluate((el) => getComputedStyle(el).color);
  const rgb = textColor
    .match(/^rgb\((\d+), (\d+), (\d+)\)$/)
    ?.slice(1)
    .map(Number);
  expect(rgb, `heading colour ${textColor}`).toHaveLength(3);

  const h = (await heading.boundingBox())!;
  const b = (await box.boundingBox())!;
  const scroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
  const clip = {
    x: Math.max(h.x, b.x) + scroll.x,
    y: Math.max(h.y, b.y) + scroll.y,
    width: Math.min(h.x + h.width, b.x + b.width) - Math.max(h.x, b.x),
    height: Math.min(h.y + h.height, b.y + b.height) - Math.max(h.y, b.y),
  };
  const png = await page.screenshot({ fullPage: true, clip, animations: "disabled" });

  const scratch = await page.context().newPage();
  const measured = await scratch.evaluate(
    async ({ b64, text }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height).data;
      const lin = (c: number) => {
        const v = c / 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      const lum = (r: number, g: number, b: number) =>
        0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const textLum = lum(text[0]!, text[1]!, text[2]!);
      const ratios: number[] = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        const distance = Math.hypot(r - text[0]!, g - text[1]!, b - text[2]!);
        if (distance <= 60) continue;
        const l = lum(r, g, b);
        ratios.push((Math.max(l, textLum) + 0.05) / (Math.min(l, textLum) + 0.05));
      }
      ratios.sort((x, y) => x - y);
      return { pixels: ratios.length, p05: ratios[Math.floor(ratios.length / 20)] ?? 0 };
    },
    { b64: png.toString("base64"), text: rgb! },
  );
  await scratch.close();

  expect(measured.pixels, "background pixels sampled behind the heading").toBeGreaterThan(5_000);
  expect(
    measured.p05,
    `the brightest 5% of the footage behind the heading (${measured.pixels} pixels)`,
  ).toBeGreaterThanOrEqual(MIN_CONTRAST);
});
