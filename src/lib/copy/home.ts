// Home's copy (src/routes/[[preview=preview]]/+page.svelte), editable in Prismic's
// `home_page` document; see $lib/content for how the fallback works. The
// definition paragraph is the `settings` document's. The hero line and the
// three timelines' words were drawn as vector shapes until 11-05; they are live
// text now, laid out by $lib/home-timelines, with the operator's wording
// ("DoW + VA", decision 2026-11-05-2005; "The Clinician in Mind", §7).
import type { HomePageDocument } from "../../../prismicio-types";
import { lines, text } from "../content";

/** Today's wording, word for word: what the page shows with no home_page document. */
export const HOME_COPY = {
  hero_line: ["Connecting DoW + VA Hospitals with", "Med-Surg Suppliers"],
  hero_subtitle:
    "We bridge the gap between clinical demand and government procurement to support America’s Armed Services and our Veterans.",
  hero_line_phone: ["Connecting", "DoW + VA", "Hospitals", "w/ Med-Surg", "Suppliers"],
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
  timeline_1_heading: "Deployment overseas",
  timeline_1_text: "Critical medical supplies save lives in forward deployed environments.",
  timeline_label_1: "Start date: 18 y.o.",
  timeline_label_2: "Deployment overseas",
  timeline_label_3: "Raising a family",
  timeline_label_4: "Active Duty Service in the US",
  timeline_label_5: "Surgical procedure",
  timeline_label_6: "85 y.o. veteran & retiree",
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
  timeline_2_eyebrow: "The Clinician in Mind",
  timeline_2_heading: "Raising a family",
  timeline_2_text: "Medical care and procedures for service men, women and family members.",
  partner_heading: "Our Partner",
  start_heading_1: "Getting started",
  start_heading_2: "is simple with msot",
  step_1: ["establish", "goals"],
  step_2: ["Find Your", "access points"],
  step_3: ["Set pricing", "direct invoicing"],
  start_button: "Learn More",
  timeline_3_eyebrow: "The Clinician in Mind",
  timeline_3_heading: "Veteran & retiree",
  timeline_3_text: "Caring for our veterans after retirement",
  cta_line: "let’s get started",
  cta_contact_button: "Contact Us",
  cta_process_button: "Learn More",
};

export type HomeCopy = ReturnType<typeof homeCopy>;

/** The home_page document over today's wording, field by field. */
export function homeCopy(doc: HomePageDocument | null) {
  const d = doc?.data;
  return {
    hero_line: lines(d?.hero_line, HOME_COPY.hero_line),
    hero_subtitle: text(d?.hero_subtitle, HOME_COPY.hero_subtitle),
    hero_line_phone: lines(d?.hero_line_phone, HOME_COPY.hero_line_phone),
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
    timeline_1_heading: text(d?.timeline_1_heading, HOME_COPY.timeline_1_heading),
    timeline_1_text: text(d?.timeline_1_text, HOME_COPY.timeline_1_text),
    timeline_label_1: text(d?.timeline_label_1, HOME_COPY.timeline_label_1),
    timeline_label_2: text(d?.timeline_label_2, HOME_COPY.timeline_label_2),
    timeline_label_3: text(d?.timeline_label_3, HOME_COPY.timeline_label_3),
    timeline_label_4: text(d?.timeline_label_4, HOME_COPY.timeline_label_4),
    timeline_label_5: text(d?.timeline_label_5, HOME_COPY.timeline_label_5),
    timeline_label_6: text(d?.timeline_label_6, HOME_COPY.timeline_label_6),
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
    timeline_2_eyebrow: text(d?.timeline_2_eyebrow, HOME_COPY.timeline_2_eyebrow),
    timeline_2_heading: text(d?.timeline_2_heading, HOME_COPY.timeline_2_heading),
    timeline_2_text: text(d?.timeline_2_text, HOME_COPY.timeline_2_text),
    partner_heading: text(d?.partner_heading, HOME_COPY.partner_heading),
    start_heading_1: text(d?.start_heading_1, HOME_COPY.start_heading_1),
    start_heading_2: text(d?.start_heading_2, HOME_COPY.start_heading_2),
    step_1: lines(d?.step_1, HOME_COPY.step_1),
    step_2: lines(d?.step_2, HOME_COPY.step_2),
    step_3: lines(d?.step_3, HOME_COPY.step_3),
    start_button: text(d?.start_button, HOME_COPY.start_button),
    timeline_3_eyebrow: text(d?.timeline_3_eyebrow, HOME_COPY.timeline_3_eyebrow),
    timeline_3_heading: text(d?.timeline_3_heading, HOME_COPY.timeline_3_heading),
    timeline_3_text: text(d?.timeline_3_text, HOME_COPY.timeline_3_text),
    cta_line: text(d?.cta_line, HOME_COPY.cta_line),
    cta_contact_button: text(d?.cta_contact_button, HOME_COPY.cta_contact_button),
    cta_process_button: text(d?.cta_process_button, HOME_COPY.cta_process_button),
  };
}
