// Home's copy (src/routes/[[preview=preview]]/+page.svelte), editable in Prismic's
// `home_page` document; see $lib/content for how the fallback works. The hero's
// words are not here: on desktop they are drawn into an SVG, so they stay in
// code with it. The definition paragraph is the `settings` document's.
import type { HomePageDocument } from "../../../prismicio-types";
import { lines, text } from "../content";

/** Today's wording, word for word: what the page shows with no home_page document. */
export const HOME_COPY = {
  trusted_heading: "Your Trusted Partner",
  vosb_logo_alt: "Veteran-Owned Small Business (VOSB)",
  trusted_text:
    "Our expertise, VOSB (Veteran-Owned Small Business) status, and deep network of relationships allows us to offer solutions where others hit roadblocks.",
  contact_button: "Contact Us",
  capabilities_button: "Capabilities Statement",
  video_title: "background video",
  we_get_heading: "We'll Get You",
  we_get_1: ["Priority", "Access"],
  we_get_2: ["contract", "expertise"],
  we_get_3: ["Direct", "Results"],
  clinician_heading: "The Clinician in Mind",
  clinician_text:
    "MSOT makes medical care possible from the war fighter all the way to the retiree and all phases of service in between.",
  know_heading: "We Know What to Do",
  problem_heading: "Government Contracts Are",
  problem_1: "opaque",
  problem_2: "confusing",
  problem_3: "inaccessible",
  answer_heading: "What You’ll get With MSOT",
  answer_1: "transparency",
  answer_2: "understanding",
  answer_3: "access",
  help_heading: "We’re here to help",
  help_text: "Take the headache and confusion out of dealing with government healthcare",
  partner_heading: "Our Partner",
  partner_quote:
    "“MSOT made the process of getting our product into the DoD system easier than we ever thought possible. They're an invaluable partnership and wealth of knowledge when it comes to selling to the DoD and VA hospital systems.”",
  partner_logo_alt: "Revogen",
  start_heading_1: "Getting started",
  start_heading_2: "is simple with msot",
  step_1: ["establish", "goals"],
  step_2: ["Find Your", "access points"],
  step_3: ["Set pricing", "direct invoicing"],
  start_button: "Learn More",
  cta_line: "let’s get started",
  cta_contact_button: "Contact Us",
  cta_process_button: "Learn More",
};

export type HomeCopy = ReturnType<typeof homeCopy>;

/** The home_page document over today's wording, field by field. */
export function homeCopy(doc: HomePageDocument | null) {
  const d = doc?.data;
  return {
    trusted_heading: text(d?.trusted_heading, HOME_COPY.trusted_heading),
    vosb_logo_alt: text(d?.vosb_logo_alt, HOME_COPY.vosb_logo_alt),
    trusted_text: text(d?.trusted_text, HOME_COPY.trusted_text),
    contact_button: text(d?.contact_button, HOME_COPY.contact_button),
    capabilities_button: text(d?.capabilities_button, HOME_COPY.capabilities_button),
    video_title: text(d?.video_title, HOME_COPY.video_title),
    we_get_heading: text(d?.we_get_heading, HOME_COPY.we_get_heading),
    we_get_1: lines(d?.we_get_1, HOME_COPY.we_get_1),
    we_get_2: lines(d?.we_get_2, HOME_COPY.we_get_2),
    we_get_3: lines(d?.we_get_3, HOME_COPY.we_get_3),
    clinician_heading: text(d?.clinician_heading, HOME_COPY.clinician_heading),
    clinician_text: text(d?.clinician_text, HOME_COPY.clinician_text),
    know_heading: text(d?.know_heading, HOME_COPY.know_heading),
    problem_heading: text(d?.problem_heading, HOME_COPY.problem_heading),
    problem_1: text(d?.problem_1, HOME_COPY.problem_1),
    problem_2: text(d?.problem_2, HOME_COPY.problem_2),
    problem_3: text(d?.problem_3, HOME_COPY.problem_3),
    answer_heading: text(d?.answer_heading, HOME_COPY.answer_heading),
    answer_1: text(d?.answer_1, HOME_COPY.answer_1),
    answer_2: text(d?.answer_2, HOME_COPY.answer_2),
    answer_3: text(d?.answer_3, HOME_COPY.answer_3),
    help_heading: text(d?.help_heading, HOME_COPY.help_heading),
    help_text: text(d?.help_text, HOME_COPY.help_text),
    partner_heading: text(d?.partner_heading, HOME_COPY.partner_heading),
    partner_quote: text(d?.partner_quote, HOME_COPY.partner_quote),
    partner_logo_alt: text(d?.partner_logo_alt, HOME_COPY.partner_logo_alt),
    start_heading_1: text(d?.start_heading_1, HOME_COPY.start_heading_1),
    start_heading_2: text(d?.start_heading_2, HOME_COPY.start_heading_2),
    step_1: lines(d?.step_1, HOME_COPY.step_1),
    step_2: lines(d?.step_2, HOME_COPY.step_2),
    step_3: lines(d?.step_3, HOME_COPY.step_3),
    start_button: text(d?.start_button, HOME_COPY.start_button),
    cta_line: text(d?.cta_line, HOME_COPY.cta_line),
    cta_contact_button: text(d?.cta_contact_button, HOME_COPY.cta_contact_button),
    cta_process_button: text(d?.cta_process_button, HOME_COPY.cta_process_button),
  };
}
