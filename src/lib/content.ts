// Page copy from Prismic, with today's wording as the fallback, field by field
// (the operator, 11-05: "all content should be in prismic, not in code"; the
// workspace's decisions/2026-11-05-1856-msot-content-to-prismic-models-route.md).
//
// Each page has its own singleton type (home_page, about_page, …). Until its
// model reaches Prismic (on merge to `main`) and Marketing publishes the
// document, the page shows the code's wording; an empty field keeps it too, so
// a half-filled document changes only what was filled.
import { asText, isFilled, NotFoundError, type RichTextField } from "@prismicio/client";

type SingleClient = { getSingle: (type: never) => Promise<unknown> };

/**
 * The page's singleton document, or null when none exists yet. Only Prismic's
 * NotFoundError means "no document"; any other error stops the build rather
 * than quietly ship the code's wording.
 */
export async function loadSingle<T>(client: SingleClient, type: string): Promise<T | null> {
  try {
    return (await (client.getSingle as (t: string) => Promise<unknown>)(type)) as T;
  } catch (e) {
    if (e instanceof NotFoundError) return null;
    throw e;
  }
}

/** A filled text field, trimmed; else the code's wording. */
export function text(value: string | null | undefined, fallback: string): string {
  return isFilled.keyText(value) && value.trim() ? value.trim() : fallback;
}

/**
 * A heading Marketing may break across lines: a one-paragraph rich-text field
 * where Shift+Enter starts a new line. Empty lines are dropped. Empty, it is
 * the code's lines.
 */
export function lines(value: RichTextField | null | undefined, fallback: string[]): string[] {
  if (!isFilled.richText(value)) return fallback;
  const out = asText(value, { separator: "\n" })
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return out.length ? out : fallback;
}
