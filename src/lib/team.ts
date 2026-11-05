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

export const teamAlt = (name: string, title: string) =>
  title ? `${name}, ${title}, Medical Solutions of Texas.` : `${name}, Medical Solutions of Texas.`;

/**
 * The team: today's cards in their order, each replaced by a Prismic document
 * with the same name, plus any new people. A document's `order` places it (1
 * is first); a card with no document keeps its place in today's list; ties go
 * by name. A document with no name is skipped. A person whose headshot hasn't
 * come in keeps the image the site already shows for them (§8: "keep their
 * current image until it does"), else the placeholder: never an empty card.
 */
export function buildTeam(
  docs: TeamMemberDocument[],
  current: CurrentCard[],
  placeholder: string,
): TeamCard[] {
  const cards = new Map<string, TeamCard & { order: number }>();
  current.forEach((c, i) => {
    cards.set(c.name, { ...c, alt: teamAlt(c.name, c.title), order: i + 1 });
  });
  for (const d of docs) {
    const name = d.data.name?.trim();
    if (!name) continue;
    const today = cards.get(name);
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
    cards.set(name, {
      name,
      title,
      headshot,
      alt: teamAlt(name, title),
      bio: isFilled.richText(d.data.bio) ? d.data.bio : undefined,
      linkedin: isFilled.link(d.data.linkedin) ? (d.data.linkedin.url ?? undefined) : undefined,
      order: d.data.order ?? today?.order ?? Infinity,
    });
  }
  return [...cards.values()]
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map(({ order: _order, ...card }) => card);
}
