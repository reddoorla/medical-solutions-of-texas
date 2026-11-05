// Page copy from Prismic, with today's wording as the fallback, field by field
// (the operator, 11-05: "all content should be in prismic, not in code"; the
// workspace's decisions/2026-11-05-1856-msot-content-to-prismic-models-route.md).
//
// Each page has its own singleton type (home_page, about_page, …). Until its
// model reaches Prismic (on merge to `main`) and Marketing publishes the
// document, the page shows the code's wording; an empty field keeps it too, so
// a half-filled document changes only what was filled.
import { asText, isFilled, type RichTextField } from "@prismicio/client";
import { isNoDocument } from "./identity";

type SingleClient = { getSingle: (type: never) => Promise<unknown> };

/**
 * The page's singleton document, or null when none exists yet, the same policy
 * as `loadIdentity`: only the client's own "No documents were returned" means
 * "no document". With `strict` (set while building) any other error stops the
 * build rather than quietly ship the code's wording into a prerendered page. At
 * request time (the page's /preview variant) an error falls back to the code's
 * wording and is logged: an editor's expired preview cookie or a Prismic outage
 * must not turn the page into a 500.
 */
export async function loadSingle<T>(
  client: SingleClient,
  type: string,
  { strict }: { strict: boolean },
): Promise<T | null> {
  try {
    return (await (client.getSingle as (t: string) => Promise<unknown>)(type)) as T;
  } catch (e) {
    if (isNoDocument(e)) return null;
    if (strict) throw e;
    console.error(`${type}: falling back to the code's wording:`, e);
    return null;
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

/**
 * A rich-text field of paragraphs as plain text, one line per paragraph, for a
 * block that keeps its line breaks (white-space: pre-wrap). Spaces are kept as
 * typed, since such a block shows them. Empty, it is the code's wording.
 */
export function paragraphs(value: RichTextField | null | undefined, fallback: string): string {
  if (!isFilled.richText(value)) return fallback;
  const out = asText(value, { separator: "\n" });
  return out.trim() ? out : fallback;
}

/**
 * A repeatable group's rows, each read by `pick`, which returns null for a row
 * too empty to show. With no row to show, the code's rows: the list is
 * replaced whole, not merged row by row, so Marketing can reorder or shorten it.
 */
export function rows<R, T>(
  group: readonly R[] | null | undefined,
  pick: (row: R) => T | null,
  fallback: T[],
): T[] {
  const out = (group ?? []).map(pick).filter((r): r is T => r !== null);
  return out.length ? out : fallback;
}
