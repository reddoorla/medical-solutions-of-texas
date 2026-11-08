// Process's copy (src/routes/[[preview=preview]]/process/+page.svelte),
// editable in Prismic's `process_page` document; see $lib/content for how the
// fallback works. The timeline is Marketing's approved steps (Developer Brief
// Part 2, §14b, Oct 29, 2026), word for word but one: step 03's line puts VA
// first, the house order Marketing set in §12e. They replaced timeline.svg,
// whose words were shapes and which said "Manufacturer Alpha" and 30–90 days.
// The step numerals (01, 02, …) are the page's, not fields.
import type { ProcessPageDocument } from "../../../prismicio-types";
import { paragraphs, rows, text } from "../content";

/** Today's wording, word for word: what the page shows with no process_page document. */
export const PROCESS_COPY = {
  heading_left: "Our",
  heading_right: "Process",
  simplifying_heading: "Simplifying Complexity",
  complex_line: "Government Contracting is Complex...",
  complex_text:
    "…and often feels like continuously slamming your head into a wall. We know, we’ve been there. You find your access is expired. Late payments, inability to collect a PO, supply chain delays or mismanagement. You’re always “almost there” to get that next contract, but never quite get across the finish line. This isn’t the way things should be.",
  simplify_line: "Let’s Simplify It…",
  simplify_text:
    "...and make things work. We’ve done this for years, with many partners and many situations and will help get you where you need to be. With experience comes procedure, with procedure comes consistency, efficiency, and results.",
  video_title: "background video",
  video_heading: "OUR PROCESS",
  step_1_title: "Refine",
  step_1_text: "We’ll isolate the best contracts and options for your company",
  step_2_title: "Guide",
  step_2_text: "We’ll guide you through the bureaucracy and paperwork, and get your application in",
  step_3_title: "Connect",
  step_3_text:
    "We’ll get you in the room with the right people to help you build further relationships",
  timeline_heading: "What does a typical timeline look like?",
  timeline: [
    {
      timing: "Week 1",
      title: "Kickoff and contract plan",
      text: "MSOT reviews your products and picks the right path: ECAT, FSS, DAPA or a mix.",
    },
    {
      timing: "Typically 45 working days or less",
      title: "Approval and ECAT listing",
      text: "MSOT prepares and submits the paperwork, and your products appear on ECAT once approved.",
    },
    {
      timing: "About 7 days",
      title: "Rollout to DoW bases and VA facilities",
      text: "Your products become available to order at DoW and VA treatment facilities.",
    },
    {
      timing: "Ongoing",
      title: "Orders and cases ship",
      text: "MSOT handles orders, invoicing and delivery from this point on.",
    },
    {
      timing: "As needed",
      title: "Contract maintenance",
      text: "MSOT keeps your contracts current with price updates, new items and renewals.",
    },
  ],
  faq_heading: "Common Questions & Our Answers",
  faq: [
    {
      question: "Why does VOSB status give priority for winning VA and DoW contracts?",
      answer:
        "In the 2016 Kingdomware Techs., Inc. v. United States case, the Supreme Court unanimously affirmed the Rule of Two provision of a 2006 federal law. The Rule of Two mandates that VA contracts shall be set aside for veteran-owned small businesses if at least two such businesses exist that can perform the work at a reasonable price. This results in a wide swath of contracts set aside specifically for veteran-owned businesses, ones that VOSBs, like MSOT, have priority in winning.",
    },
    {
      question: "What does our typical timeline look like after winning a contract?",
      answer:
        "The timeline for this process begins with a medical manufacturer getting approval on the ECAT, typically 45 working days or less. The next critical step is ensuring compliance and readiness for the rollout phase. Once approved, the rollout to VA facilities and military bases takes place within a concise period of seven days, making the product accessible where it is most needed. Following the initial product deployment, the process transitions into a phase med-surg equipment can be provided, ensuring smooth operations and ongoing support. Finally, the timeline extends into a phase of ongoing contract maintenance, which is carried out as needed to uphold quality and reliability throughout the duration of the agreement.",
    },
  ],
};

export type ProcessCopy = ReturnType<typeof processCopy>;

/** The process_page document over today's wording, field by field. */
export function processCopy(doc: ProcessPageDocument | null) {
  const d = doc?.data;
  return {
    heading_left: text(d?.heading_left, PROCESS_COPY.heading_left),
    heading_right: text(d?.heading_right, PROCESS_COPY.heading_right),
    simplifying_heading: text(d?.simplifying_heading, PROCESS_COPY.simplifying_heading),
    complex_line: text(d?.complex_line, PROCESS_COPY.complex_line),
    complex_text: text(d?.complex_text, PROCESS_COPY.complex_text),
    simplify_line: text(d?.simplify_line, PROCESS_COPY.simplify_line),
    simplify_text: text(d?.simplify_text, PROCESS_COPY.simplify_text),
    video_title: text(d?.video_title, PROCESS_COPY.video_title),
    video_heading: text(d?.video_heading, PROCESS_COPY.video_heading),
    step_1_title: text(d?.step_1_title, PROCESS_COPY.step_1_title),
    step_1_text: text(d?.step_1_text, PROCESS_COPY.step_1_text),
    step_2_title: text(d?.step_2_title, PROCESS_COPY.step_2_title),
    step_2_text: text(d?.step_2_text, PROCESS_COPY.step_2_text),
    step_3_title: text(d?.step_3_title, PROCESS_COPY.step_3_title),
    step_3_text: text(d?.step_3_text, PROCESS_COPY.step_3_text),
    timeline_heading: text(d?.timeline_heading, PROCESS_COPY.timeline_heading),
    timeline: rows(
      d?.timeline,
      (r) => {
        const row = {
          timing: text(r.timing, ""),
          title: text(r.title, ""),
          text: text(r.text, ""),
        };
        return row.title ? row : null;
      },
      PROCESS_COPY.timeline,
    ),
    faq_heading: text(d?.faq_heading, PROCESS_COPY.faq_heading),
    faq: rows(
      d?.faq,
      (r) => {
        const row = { question: text(r.question, ""), answer: paragraphs(r.answer, "") };
        return row.question ? row : null;
      },
      PROCESS_COPY.faq,
    ),
  };
}
