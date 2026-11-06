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

const TOKEN = /\{([^{}]+)\}/g;

/** A token's name as `values` keys it: "{ Legal_Name }" is "legal name". */
const tokenKey = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, " ");

/**
 * A field's wording with its {tokens} filled: "{legal name}" becomes the
 * value named "legal name". Case, spaces and underscores in a token are
 * forgiven ("{Legal_Name}", "{ legal name }"). A token with no value is left
 * as typed, so a misspelt one shows on the page instead of vanishing.
 */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(TOKEN, (all, name: string) => {
    const key = tokenKey(name);
    return Object.hasOwn(values, key) ? values[key] : all;
  });
}

/**
 * A rich-text field with its {tokens} filled, each as `fill` fills it, in
 * every block of text. Bold, italic and link spans move with the words around
 * them, and one that starts or ends inside a token takes in its whole value. A
 * token named in `links` (by its key, "email") also becomes a link, to
 * links[key](value), unless the editor already linked it.
 */
export function fillRichText(
  field: RichTextField,
  values: Record<string, string>,
  links: Record<string, (value: string) => string> = {},
): RichTextField {
  return field.map((block) => {
    if (!("text" in block)) return block;
    // Each filled token: where it was typed (from, to) and where its value is (at, end).
    const filled: { from: number; to: number; at: number; end: number; key: string }[] = [];
    let text = "";
    let last = 0;
    for (const m of block.text.matchAll(TOKEN)) {
      const value = fill(m[0], values);
      if (value === m[0]) continue;
      text += block.text.slice(last, m.index);
      filled.push({
        from: m.index,
        to: m.index + m[0].length,
        at: text.length,
        end: text.length + value.length,
        key: tokenKey(m[1]),
      });
      text += value;
      last = m.index + m[0].length;
    }
    if (!filled.length) return block;
    text += block.text.slice(last);
    // A typed offset in the filled text. One inside a token goes to its value's
    // start, as a span's start, or its end, as a span's end.
    const move = (p: number, edge: "start" | "end") => {
      let shift = 0;
      for (const f of filled) {
        if (p >= f.to) shift = f.end - f.to;
        else if (p > f.from) return edge === "start" ? f.at : f.end;
        else break;
      }
      return p + shift;
    };
    const spans = block.spans.map((s) => ({
      ...s,
      start: move(s.start, "start"),
      end: move(s.end, "end"),
    }));
    for (const f of filled) {
      const link = links[f.key];
      if (!link || f.end === f.at) continue;
      if (spans.some((s) => s.type === "hyperlink" && s.start < f.end && s.end > f.at)) continue;
      spans.push({
        type: "hyperlink",
        start: f.at,
        end: f.end,
        data: { link_type: "Web", url: link(text.slice(f.at, f.end)) },
      });
    }
    return { ...block, text, spans } as typeof block;
  }) as RichTextField;
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
 * typed, since such a block shows them; empty paragraphs at either end are
 * dropped. Empty, it is the code's wording.
 */
export function paragraphs(value: RichTextField | null | undefined, fallback: string): string {
  if (!isFilled.richText(value)) return fallback;
  // An empty paragraph at either end would show as a blank line.
  const out = asText(value, { separator: "\n" }).replace(/^\n+|\n+$/g, "");
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
