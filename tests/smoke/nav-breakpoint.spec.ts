import { test, expect } from "@playwright/test";

// The nav must be right before any JS runs (#102). The layout used to branch on
// `viewportWidth`, which starts at 1920 on the server, so a phone got the
// desktop links, off its right edge, until hydration swapped in the menu
// button. With JS off, the prerendered HTML is all a phone has.
test.use({ javaScriptEnabled: false });

for (const [width, phone] of [
  [390, true],
  [768, true],
  [769, false],
  [1440, false],
] as const) {
  test(`at ${width}px the nav shows the ${phone ? "menu button" : "links"} without JS`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const nav = page.locator("nav");
    const menu = nav.getByRole("button", { name: "Open menu" });
    const contact = nav.getByRole("link", { name: "Contact" });
    if (phone) {
      await expect(menu).toBeVisible();
      // The icon itself, not only its button: it carried `md:hidden` (≥768px)
      // while the button showed through 768px, an invisible button at 768.
      await expect(menu.locator("svg")).toBeVisible();
      await expect(contact).toBeHidden();
    } else {
      await expect(contact).toBeVisible();
      await expect(menu).toBeHidden();
    }
  });
}
