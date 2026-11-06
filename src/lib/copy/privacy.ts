// The privacy policy's copy (src/routes/privacy/+page.svelte), editable in
// Prismic's `privacy_page` document; see $lib/content for how the fallback
// works. Each section's body is one rich-text field: empty, the page keeps
// today's wording for that section, which names the `settings` document's
// legal name and email; filled, the field replaces the section's body whole.
// The page has no `page` document, so its SEO title and description are this
// type's: empty, they are null and the layout keeps $lib/seo's.
import { isFilled, type RichTextField } from "@prismicio/client";
import type { PrivacyPageDocument } from "../../../prismicio-types";
import { text } from "../content";
import { PRIVACY_VALUES } from "../privacy/policy";

/** Today's wording, word for word: what the page shows with no privacy_page document. */
export const PRIVACY_COPY = {
  meta_title: "Privacy Policy | MSOT",
  meta_description:
    "What information the Medical Solutions of Texas website collects, why, who else receives it, and the choices you have.",
  heading: "Privacy Policy",
  effective_label: "Effective",
  collect_heading: "What we collect",
  use_heading: "How we use it",
  others_heading: "Who else receives it",
  dnt_heading: "Do Not Track",
  children_heading: "Children",
  choices_heading: "Your choices",
  changes_heading: "Changes to this policy",
};

/** The rich-text fields, each one section's body. */
export const PRIVACY_BODIES = [
  "intro",
  "collect_body",
  "use_body",
  "others_body",
  "dnt_body",
  "children_body",
  "choices_body",
  "changes_body",
] as const;

/** A filled rich-text field, or null: the page then shows today's section. */
function body(value: RichTextField | null | undefined): RichTextField | null {
  return isFilled.richText(value) ? value : null;
}

export type PrivacyCopy = ReturnType<typeof privacyCopy>;

/** The privacy_page document over today's wording, field by field. */
export function privacyCopy(doc: PrivacyPageDocument | null) {
  const d = doc?.data;
  return {
    meta_title: text(d?.meta_title, "") || null,
    meta_description: text(d?.meta_description, "") || null,
    heading: text(d?.heading, PRIVACY_COPY.heading),
    effective_label: text(d?.effective_label, PRIVACY_COPY.effective_label),
    collect_heading: text(d?.collect_heading, PRIVACY_COPY.collect_heading),
    use_heading: text(d?.use_heading, PRIVACY_COPY.use_heading),
    others_heading: text(d?.others_heading, PRIVACY_COPY.others_heading),
    dnt_heading: text(d?.dnt_heading, PRIVACY_COPY.dnt_heading),
    children_heading: text(d?.children_heading, PRIVACY_COPY.children_heading),
    choices_heading: text(d?.choices_heading, PRIVACY_COPY.choices_heading),
    changes_heading: text(d?.changes_heading, PRIVACY_COPY.changes_heading),
    effective_date: isFilled.date(d?.effective_date)
      ? d.effective_date
      : PRIVACY_VALUES.effectiveDate,
    intro: body(d?.intro),
    collect_body: body(d?.collect_body),
    use_body: body(d?.use_body),
    others_body: body(d?.others_body),
    dnt_body: body(d?.dnt_body),
    children_body: body(d?.children_body),
    choices_body: body(d?.choices_body),
    changes_body: body(d?.changes_body),
  };
}
