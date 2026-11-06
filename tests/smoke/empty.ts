import type { BrowserContext } from "@playwright/test";

// The cookie that makes `vite dev` serve each named page singleton, and always
// `settings`, as a published document with every field empty
// ($lib/empty-fixture). The checks that pin the code's wording send it, so they
// hold whatever is published in Prismic: before, they read live Prismic and
// assumed no document (#160 item 3, #165 item 2).
export const empty = (...pages: string[]) => ({
  cookie: ["settings", ...pages].map((p) => `msot-${p}-fixture=empty`).join("; "),
});

/** Every page singleton. */
export const SINGLETONS = [
  "home",
  "about",
  "process",
  "partners",
  "resources",
  "contact",
  "capabilities",
  "privacy",
];

/**
 * The same cookies in a browser context, for page.goto: set as cookies, not as
 * an extra header, so the browser's own cookies still reach the server.
 */
export const emptyCookies = (context: BrowserContext, baseURL: string | undefined) =>
  context.addCookies(
    ["settings", ...SINGLETONS].map((p) => ({
      name: `msot-${p}-fixture`,
      value: "empty",
      url: baseURL ?? "http://localhost:5173",
    })),
  );
