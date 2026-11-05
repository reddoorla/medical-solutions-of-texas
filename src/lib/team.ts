// The About page's team (MSOT Marketing's Developer Brief Part 1, §8 and §9).
// Marketing edits names, titles, headshots, bios and LinkedIn links in
// Prismic's `team_member` documents, with no code change. The model reaches
// Prismic when this lands on `main` (the site's prismic-models workflow pushes
// on merge to main only).
//
// Today's cards stay until each person's document exists: a document replaces
// the card with the same name, or adds a new one, and the rest stay as they
// are. So Marketing can publish people one at a time without the others
// dropping off the page. Taking someone off the page is a code change here.
import { asImageSrc, isFilled, type RichTextField } from "@prismicio/client";
import type { TeamMemberDocument } from "../../prismicio-types";

export type TeamCard = {
  name: string;
  title: string;
  headshot: string;
  /** §8: "[Full name], [Title], Medical Solutions of Texas." */
  alt: string;
  /** Shown under the card's name, only when Marketing has written one. */
  bio?: RichTextField;
  linkedin?: string;
};

export type CurrentCard = { name: string; title: string; headshot: string };

/** Case, spacing and pasted non-breaking spaces don't make a different person. */
const cleanName = (name: string) =>
  name
    .replace(/[\u200b-\u200d\u2060\ufeff]/g, "")
    .trim()
    .replace(/\s+/g, " ");
const nameKey = (name: string) => cleanName(name).toLowerCase();

export const teamAlt = (name: string, title: string) =>
  title ? `${name}, ${title}, Medical Solutions of Texas.` : `${name}, Medical Solutions of Texas.`;

/**
 * The team: today's cards in their order, each replaced by a Prismic document
 * with the same name (ignoring case, spacing and zero-width characters), plus
 * any new people. A document's `order` is its position: 1 is first, 2 is
 * second, whoever else has a document. The documents with an order are placed
 * by it; everyone else fills the remaining places: today's cards in today's
 * order (a document with no order keeps its person's place), then new people
 * with no order. Documents with the
 * same order go by name. A document with no name is skipped, and of two with
 * the same name the first in the API's order (by `order`) wins. A person whose
 * headshot hasn't come in keeps the image the site already shows for them
 * (§8: "keep their current image until it does"), else the placeholder: never
 * an empty card.
 */
export function buildTeam(
  docs: TeamMemberDocument[],
  current: CurrentCard[],
  placeholder: string,
): TeamCard[] {
  const cards = new Map<string, TeamCard & { order: number; placed: boolean; fromDoc: boolean }>();
  current.forEach((c, i) => {
    cards.set(nameKey(c.name), {
      ...c,
      alt: teamAlt(c.name, c.title),
      order: i + 1,
      placed: false,
      fromDoc: false,
    });
  });
  for (const d of docs) {
    const name = d.data.name ? cleanName(d.data.name) : "";
    if (!name) continue;
    const key = nameKey(name);
    const today = cards.get(key);
    if (today?.fromDoc) continue;
    const title = d.data.job_title?.trim() || today?.title || "";
    const headshot =
      asImageSrc(d.data.headshot, {
        w: 768,
        h: 768,
        fit: "crop",
        auto: ["format", "compress"],
      }) ??
      today?.headshot ??
      placeholder;
    cards.set(key, {
      name,
      title,
      headshot,
      alt: teamAlt(name, title),
      bio: isFilled.richText(d.data.bio) ? d.data.bio : undefined,
      linkedin: isFilled.link(d.data.linkedin) ? (d.data.linkedin.url ?? undefined) : undefined,
      // A document with no order keeps the person's place in today's list.
      order: d.data.order ?? today?.order ?? Infinity,
      placed: d.data.order != null,
      fromDoc: true,
    });
  }
  const all = [...cards.values()];
  const placed = all
    .filter((c) => c.placed)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  const rest = all
    .filter((c) => !c.placed)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  // Insert in ascending order, so "order N" lands in place N. A tie goes right
  // after the person it ties with; an order past the end goes last.
  let prev = -1;
  for (const c of placed) {
    const at = Math.min(Math.max(Math.ceil(c.order - 1), prev + 1, 0), rest.length);
    rest.splice(at, 0, c);
    prev = at;
  }
  return rest.map(({ order: _order, placed: _placed, fromDoc: _fromDoc, ...card }) => card);
}
