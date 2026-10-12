import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const RULES = ["color-contrast", "heading-order"];

const VIEWPORTS = [
  { name: "Lighthouse desktop", width: 1350, height: 940 },
  { name: "phone", width: 390, height: 844 },
];

for (const viewport of VIEWPORTS) {
  test(`/ passes ${RULES.join(" and ")} at ${viewport.width}×${viewport.height} (${viewport.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
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
  });
}
