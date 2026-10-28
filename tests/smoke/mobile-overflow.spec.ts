import { test, expect, type Page } from "@playwright/test";

// No page may be wider than a phone or a tablet. On 2026-10-28 the home page's
// 50px "support-text" words ("UNDERSTANDING", "TRANSPARENCY") and /about's
// `text-nowrap` team names ran past a 390px screen, and past their half-width
// columns and 288px cards on tablets: WebKit scrolled sideways and Chromium's
// mobile emulation zoomed the whole page out to fit, which hid it from the
// fleet's `scrollWidth > innerWidth` check. A plain desktop context at the
// device width has no such zoom, so the overflow shows up as
// scrollWidth > clientWidth. Text an ancestor clips (the end-user copy's fixed
// `w-80` at 320px) widens nothing but is still cut off, so any text past the
// edge fails too.
const ROUTES = ["/", "/about", "/process", "/partners", "/resources", "/contact"];
const WIDTHS = [320, 390, 768, 820, 1024];

async function gotoHydrated(page: Page, path: string) {
  // The layout used to server-render the desktop links and swap in the menu
  // button on hydration, so this waited for the swap; since #102 CSS chooses,
  // and the prerendered nav is already the phone's.
  await page.goto(path, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
}

function measure(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      if ([...range.getClientRects()].some((r) => r.width > 0 && r.right > vw + 1)) {
        offenders.push(`<${n.parentElement?.tagName.toLowerCase()}> "${n.textContent.trim()}"`);
      }
    }
    return { scrollWidth: document.documentElement.scrollWidth, clientWidth: vw, offenders };
  });
}

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of ROUTES) {
      test(`${path} has no horizontal overflow`, async ({ page }) => {
        await gotoHydrated(page, path);
        const { scrollWidth, clientWidth, offenders } = await measure(page);
        expect(scrollWidth, `page is wider than ${clientWidth}px`).toBeLessThanOrEqual(clientWidth);
        expect(offenders, `text past the ${clientWidth}px edge`).toEqual([]);
      });
    }
  });
}
