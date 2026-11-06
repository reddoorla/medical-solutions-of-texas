// The privacy policy's copy (src/routes/[[preview=preview]]/privacy/+page.svelte),
// editable in Prismic's `privacy_page` document; see $lib/content for how the
// fallback works. Every heading is a field, and so is every section's body,
// the opening's included: empty, a body keeps today's text; filled, it
// replaces that section's text whole (the operator, 11-06, on the "which
// strings stay in code" decision: "Field per section, tokens"). Today's
// opening and its four sections What we collect, How we use it, Who else
// receives it and Your choices are written by the page from PRIVACY_SERVICES
// and the `settings` document's names and email. A filled body is typed: it
// shows the settings values only where it names them as {legal name}, {name}
// and {email}, and it no longer follows PRIVACY_SERVICES.
// The page has no `page` document, so its SEO title and description are this
// type's: empty, they are null and the layout keeps $lib/seo's.
import { asText, isFilled, type RichTextField } from "@prismicio/client";
import type { PrivacyPageDocument } from "../../../prismicio-types";
import { fillRichText, text } from "../content";
import type { Identity } from "../identity";
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

/** The rich-text fields, each one section's body, in page order. */
export const PRIVACY_BODIES = [
  "opening_body",
  "collect_body",
  "use_body",
  "others_body",
  "dnt_body",
  "children_body",
  "choices_body",
  "changes_body",
] as const;

/** The settings values a body may name, as {tokens} ($lib/content's fill). */
export function privacyTokens(identity: Identity): Record<string, string> {
  return { "legal name": identity.legalName, name: identity.name, email: identity.email };
}

/** A filled body as the page shows it: its {tokens} filled, and {email} a mailto link. */
export function privacyBody(field: RichTextField, identity: Identity): RichTextField {
  return fillRichText(field, privacyTokens(identity), { email: (address) => `mailto:${address}` });
}

/**
 * A rich-text field with words in it, or null: the page then shows today's
 * section. isFilled.richText alone counts any two blocks as filled, so two
 * empty paragraphs (Enter, then delete) would blank the section.
 */
function body(value: RichTextField | null | undefined): RichTextField | null {
  return isFilled.richText(value) && asText(value).trim() ? value : null;
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
    opening_body: body(d?.opening_body),
    collect_body: body(d?.collect_body),
    use_body: body(d?.use_body),
    others_body: body(d?.others_body),
    dnt_body: body(d?.dnt_body),
    children_body: body(d?.children_body),
    choices_body: body(d?.choices_body),
    changes_body: body(d?.changes_body),
  };
}
