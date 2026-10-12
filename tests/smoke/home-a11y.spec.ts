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

for (const viewport of VIEWPORTS) {
  test(`We'll Get You keeps 3:1 against the placeholder still at ${viewport.width}×${viewport.height} (${viewport.name})`, async ({
    page,
  }) => {
    await openSettled(page, viewport.width, viewport.height);
    await page.evaluate(() => document.fonts.ready);

    const heading = page.getByRole("heading", { name: "We'll Get You" });
    const box = heading.locator("xpath=..");
    await box.locator("img").evaluate(async (img: HTMLImageElement) => {
      img.loading = "eager";
      await Promise.race([
        img.decode(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("the placeholder still did not decode in 15s")),
            15_000,
          ),
        ),
      ]);
    });

    const h = (await heading.boundingBox())!;
    const b = (await box.boundingBox())!;
    const scroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
    const clip = {
      x: Math.max(h.x, b.x) + scroll.x,
      y: Math.max(h.y, b.y) + scroll.y,
      width: Math.min(h.x + h.width, b.x + b.width) - Math.max(h.x, b.x),
      height: Math.min(h.y + h.height, b.y + b.height) - Math.max(h.y, b.y),
    };
    const shot = () => page.screenshot({ fullPage: true, clip, animations: "disabled" });
    const withText = await shot();
    await heading.evaluate((el) => {
      el.style.setProperty("color", "transparent", "important");
      el.style.setProperty("text-shadow", "none", "important");
    });
    const withoutText = await shot();

    const scratch = await page.context().newPage();
    let measured: { glyphPixels: number; textRgb: number[]; pixels: number; p01: number };
    try {
      measured = await scratch.evaluate(
        async ({ shots }) => {
          const pixelsOf = async (b64: string) => {
            const img = new Image();
            img.src = `data:image/png;base64,${b64}`;
            await img.decode();
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            return ctx.getImageData(0, 0, img.width, img.height).data;
          };
          const [text, plain] = await Promise.all(shots.map(pixelsOf));
          const lin = (c: number) => {
            const v = c / 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          };
          const lum = (r: number, g: number, b: number) =>
            0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

          const glyphs: { diff: number; rgb: number[] }[] = [];
          const background: number[] = [];
          for (let i = 0; i < plain!.length; i += 4) {
            const rgb = [text![i]!, text![i + 1]!, text![i + 2]!];
            const diff =
              Math.abs(rgb[0]! - plain![i]!) +
              Math.abs(rgb[1]! - plain![i + 1]!) +
              Math.abs(rgb[2]! - plain![i + 2]!);
            if (diff > 40) glyphs.push({ diff, rgb });
            background.push(lum(plain![i]!, plain![i + 1]!, plain![i + 2]!));
          }
          glyphs.sort((x, y) => y.diff - x.diff);
          const solid = glyphs.slice(0, Math.max(1, Math.floor(glyphs.length / 4)));
          const median = (values: number[]) => values.sort((x, y) => x - y)[values.length >> 1]!;
          const textRgb = [0, 1, 2].map((c) => median(solid.map((g) => g.rgb[c]!)));
          const textLum = lum(textRgb[0]!, textRgb[1]!, textRgb[2]!);
          const ratios = background
            .map((l) => (Math.max(l, textLum) + 0.05) / (Math.min(l, textLum) + 0.05))
            .sort((x, y) => x - y);
          return {
            glyphPixels: glyphs.length,
            textRgb,
            pixels: ratios.length,
            p01: ratios[Math.floor(ratios.length / 100)] ?? 0,
          };
        },
        { shots: [withText.toString("base64"), withoutText.toString("base64")] },
      );
    } finally {
      await scratch.close();
    }

    expect(measured.glyphPixels, "pixels the heading's glyphs change").toBeGreaterThan(1_500);
    expect(
      measured.p01,
      `the brightest 1% of the still behind the heading, against the heading as rendered (rgb ${measured.textRgb.join(", ")}, ${measured.pixels} pixels)`,
    ).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });
}
