// The About page's team, from Prismic's `team_member` documents when any exist,
// else today's cards (MSOT Marketing's Developer Brief Part 1, §8 and §9).
// Marketing edits names, titles, headshots, bios and LinkedIn links in Prismic,
// with no code change. The model reaches Prismic when this lands on `main`
// (the site's prismic-models workflow pushes on merge to main only).
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

export const teamAlt = (name: string, title: string) =>
  `${name}, ${title}, Medical Solutions of Texas.`;

/**
 * Prismic's team, in its `order` (documents with no order go last, then by
 * name). A document with no name is skipped. A person whose headshot hasn't
 * come in keeps the image the site already shows for them (§8: "keep their
 * current image until it does"), else the placeholder: never an empty card.
 */
export function teamFromPrismic(
  docs: TeamMemberDocument[],
  currentHeadshots: Record<string, string>,
  placeholder: string,
): TeamCard[] {
  return docs
    .filter((d) => isFilled.keyText(d.data.name))
    .map((d) => ({ d, name: d.data.name!.trim(), order: d.data.order ?? Infinity }))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map(({ d, name }) => {
      const title = d.data.job_title?.trim() ?? "";
      const headshot =
        asImageSrc(d.data.headshot, {
          w: 768,
          h: 768,
          fit: "crop",
          auto: ["format", "compress"],
        }) ??
        currentHeadshots[name] ??
        placeholder;
      return {
        name,
        title,
        headshot,
        alt: teamAlt(name, title),
        bio: isFilled.richText(d.data.bio) ? d.data.bio : undefined,
        linkedin: isFilled.link(d.data.linkedin) ? (d.data.linkedin.url ?? undefined) : undefined,
      };
    });
}
