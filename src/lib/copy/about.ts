// About's copy (src/routes/[[preview=preview]]/about/+page.svelte), editable in
// Prismic's `about_page` document; see $lib/content for how the fallback works.
// The definition paragraph and the "works with" line are the `settings`
// document's, and the team cards are `team_member` documents ($lib/team).
import type { AboutPageDocument } from "../../../prismicio-types";
import { paragraphs, rows, text } from "../content";

/** Today's wording, word for word: what the page shows with no about_page document. */
export const ABOUT_COPY = {
  heading_left: "About",
  heading_right: "MSOT",
  differentiates_heading: "what differentiates us",
  defined_text: "We are defined by expertise and experience.",
  experience_text:
    "With 20 years’ worth of experience in Air Force logistics and nearly 50 years in medical device sales on our leadership team, we know the VA and DoW healthcare landscape better than anyone. We enable med-surg suppliers to find and access opportunities that they wouldn’t have been able to tap into alone.",
  services_heading: "What We Do For You",
  services: [
    {
      label: "Sign DAPAs",
      answer:
        "Distribution and pricing agreements allow you to set prices and gain direct access to the military market.",
    },
    {
      label: "Get Listed in the ECAT",
      answer:
        "Getting listed in an e-catalog gives you the advantage of increased reach, better customer engagement, the ability to collect valuable customer data, and a more streamlined way to showcase products with updated information readily available, ultimately boosting sales potential.",
    },
    {
      label: "Win FSS Contracts",
      answer:
        "You'll have access to be awarded to the nine VA FSS programs: \n65 I B Drugs, Pharmaceuticals, & Hematology Related Products\n65 II A    Medical Equipment & Supplies\n65 II C    Dental Equipment & Supplies\n65 II F    Patient Mobility Devices\n65 V A    X-Ray Equipment & Supplies\n65 VII    Invitro Diagnostics, Reagents, Test Kits, & Test Sets\n66 III    Cost-Per-Test, Clinical Laboratory Analyzers\n621 I    Professional & Allied Healthcare Staffing Services\n621 II    Medical Laboratory Testing & Analysis Services",
    },
    {
      label: "Figure out where to start",
      answer:
        "With our team's combined experience in medical sales and government contracting, we're the perfect partner to point you in the right direction. Let's get started.",
    },
  ],
  who_eyebrow: "Who We Are",
  who_heading: "We have what you’re looking for",
  who_text_1:
    "MSOT was founded by a team of medical sales experts in 2022. With a career running Air Force logistics on bases in the continental United States and at forward deployment locations overseas, we have the experience to know how to work within the complex system of military contracts and procurement.",
  who_text_2:
    "We spent our careers grappling with the difficulties in getting and keeping VA hospitals and DoW bases equipped with med-surg supplies, from the side of a logistics officer and the side of the medical sales. And so we formed MSOT, pairing experts on both sides to build an organization uniquely suited to connect med-surg suppliers with VA and DoW contracts.",
  team_heading: "The Team",
};

export type AboutCopy = ReturnType<typeof aboutCopy>;

/** The about_page document over today's wording, field by field. */
export function aboutCopy(doc: AboutPageDocument | null) {
  const d = doc?.data;
  return {
    heading_left: text(d?.heading_left, ABOUT_COPY.heading_left),
    heading_right: text(d?.heading_right, ABOUT_COPY.heading_right),
    differentiates_heading: text(d?.differentiates_heading, ABOUT_COPY.differentiates_heading),
    defined_text: text(d?.defined_text, ABOUT_COPY.defined_text),
    experience_text: text(d?.experience_text, ABOUT_COPY.experience_text),
    services_heading: text(d?.services_heading, ABOUT_COPY.services_heading),
    services: rows(
      d?.services,
      (r) => {
        const row = { label: text(r.label, ""), answer: paragraphs(r.answer, "") };
        return row.label ? row : null;
      },
      ABOUT_COPY.services,
    ),
    who_eyebrow: text(d?.who_eyebrow, ABOUT_COPY.who_eyebrow),
    who_heading: text(d?.who_heading, ABOUT_COPY.who_heading),
    who_text_1: text(d?.who_text_1, ABOUT_COPY.who_text_1),
    who_text_2: text(d?.who_text_2, ABOUT_COPY.who_text_2),
    team_heading: text(d?.team_heading, ABOUT_COPY.team_heading),
  };
}
