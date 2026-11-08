// Contact's copy (src/routes/[[preview=preview]]/contact/+page.svelte and
// $lib/components/FullWidth/ContactForm.svelte), editable in Prismic's
// `contact_page` document; see $lib/content for how the fallback works. The
// address, phone and email are the `settings` document's. Kept in code: the
// untouched menu's sent value ("Select Interest"), the hidden bot trap's
// label, and the error lines, which are the shared forms package's.
import type { ContactPageDocument } from "../../../prismicio-types";
import { rows, text } from "../content";

/** Today's wording, word for word: what the page shows with no contact_page document. */
export const CONTACT_COPY = {
  heading: "CONTACT US",
  intro: "We’d love to hear from you.",
  phone_label: "Phone:",
  email_label: "Email",
  name_label: "Your Name / Company",
  interest_label: "Interest",
  interest_placeholder: "Select Interest",
  interests: [{ option: "VA Contracts" }, { option: "DoW Contracts" }, { option: "Both" }],
  message_label: "Your Message",
  submit_button: "Submit",
  sending_button: "Sending…",
  success_heading: "Thank you — your message has been sent.",
  success_text: "We’ll be in touch shortly.",
};

export type ContactCopy = ReturnType<typeof contactCopy>;

/** The contact_page document over today's wording, field by field. */
export function contactCopy(doc: ContactPageDocument | null) {
  const d = doc?.data;
  return {
    heading: text(d?.heading, CONTACT_COPY.heading),
    intro: text(d?.intro, CONTACT_COPY.intro),
    phone_label: text(d?.phone_label, CONTACT_COPY.phone_label),
    email_label: text(d?.email_label, CONTACT_COPY.email_label),
    name_label: text(d?.name_label, CONTACT_COPY.name_label),
    interest_label: text(d?.interest_label, CONTACT_COPY.interest_label),
    interest_placeholder: text(d?.interest_placeholder, CONTACT_COPY.interest_placeholder),
    interests: rows(
      d?.interests,
      (r) => {
        const option = text(r.option, "");
        return option ? { option } : null;
      },
      CONTACT_COPY.interests,
    ),
    message_label: text(d?.message_label, CONTACT_COPY.message_label),
    submit_button: text(d?.submit_button, CONTACT_COPY.submit_button),
    sending_button: text(d?.sending_button, CONTACT_COPY.sending_button),
    success_heading: text(d?.success_heading, CONTACT_COPY.success_heading),
    success_text: text(d?.success_text, CONTACT_COPY.success_text),
  };
}
