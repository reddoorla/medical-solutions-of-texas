import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { PRIVACY_SERVICES, type PrivacyService } from "../../src/lib/privacy/policy";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "dev" ? [] : sourceFiles(path);
    return /\.(svelte|ts|js|html|css)$/.test(name) ? [path] : [];
  });
}

const sources = sourceFiles("src")
  .filter(
    (p) => !p.includes(join("src", "lib", "privacy")) && !p.includes(join("routes", "privacy")),
  )
  .map((path) => readFileSync(path, "utf8"));
const loads = (pattern: RegExp) => sources.some((s) => pattern.test(s));
const svelteConfig = readFileSync("svelte.config.js", "utf8");

const DETECTORS: Record<PrivacyService | "googleFonts" | "youtube", () => boolean> = {
  forms: () => sources.some((s) => /\bcreateIngest(Action|Endpoint)\s*\(/.test(s)),
  turnstile: () => loads(/https:\/\/challenges\.cloudflare\.com\/turnstile\//),
  ga4: () => sources.some((s) => /googletagmanager\.com\/gtag\/js|\binitAnalytics\s*\(/.test(s)),
  adobeFonts: () => loads(/https:\/\/use\.typekit\.net\//),
  vimeo: () => loads(/https:\/\/player\.vimeo\.com\//),
  netlify: () => svelteConfig.includes("@sveltejs/adapter-netlify"),
  googleFonts: () => loads(/\/\/fonts\.googleapis\.com\//),
  youtube: () => sources.some((s) => /youtube(-nocookie)?\.com/.test(s)),
};

test("the policy names exactly the services the site's code loads", () => {
  const loaded = Object.entries(DETECTORS)
    .filter(([, detect]) => detect())
    .map(([service]) => service)
    .sort();
  expect(loaded).toEqual([...PRIVACY_SERVICES].sort());
});
