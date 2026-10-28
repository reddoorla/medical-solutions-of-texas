import { test, expect } from "@playwright/test";

// No page may be wider than a phone. On 2026-10-28 the home page's 50px
// "support-text" words ("UNDERSTANDING", "TRANSPARENCY") and /about's
// `text-nowrap` team names ran past a 390px screen: WebKit scrolled sideways
// and Chromium's mobile emulation zoomed the whole page out to fit, which hid
// it from the fleet's `scrollWidth > innerWidth` check. A plain desktop
// context at phone width has no such zoom, so the overflow shows up as
// scrollWidth > clientWidth. Text an ancestor clips (the end-user copy's fixed
// `w-80` at 320px) widens nothing but is still cut off, so text past the edge
// fails too, except inside a fixed layer (the header's off-screen desktop
// links), which never reaches the page's flow.
const ROUTES = ["/", "/about", "/process", "/partners", "/resources", "/contact"];
const WIDTHS = [390, 320];

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of ROUTES) {
      test(`${path} has no horizontal overflow`, async ({ page }) => {
        await page.goto(path, { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const offenders: string[] = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!n.textContent?.trim()) continue;
            let fixedLayer = false;
            for (let a = n.parentElement; a && !fixedLayer; a = a.parentElement) {
              fixedLayer = getComputedStyle(a).position === "fixed";
            }
            if (fixedLayer) continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            if ([...range.getClientRects()].some((r) => r.width > 0 && r.right > vw + 1)) {
              offenders.push(
                `<${n.parentElement?.tagName.toLowerCase()}> "${n.textContent.trim()}"`,
              );
            }
          }
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: vw,
            offenders,
          };
        });
        expect(
          scrollWidth,
          `page is wider than ${clientWidth}px; text past the edge: ${offenders.join(", ")}`,
        ).toBeLessThanOrEqual(clientWidth);
        expect(offenders, `text past the ${clientWidth}px edge`).toEqual([]);
      });
    }
  });
}
