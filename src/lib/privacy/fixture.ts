// A privacy_page document for tests/smoke/privacy-copy.spec.ts, served only by
// `vite dev` behind the `msot-privacy-fixture` cookie (the server load checks
// `dev` first, which is false in every build). Each text field reads
// "Fixture <field>" ($lib/page-fixture), and each section body is a paragraph
// "Fixture <field>" with a link to "/?fixture=<field>", followed by a bulleted
// item "Fixture <field> item" and a paragraph naming the settings values as
// tokens, one misspelt: "Fixture <field> by {legal name} dba {Name}, at
// {email}, not {e-mail}.", so a page showing them can only have read the
// document. The effective date is 2030-01-02.
import { pageFixture } from "$lib/page-fixture";

export function privacyFixture(
  copy: Record<string, string>,
  bodies: readonly string[],
): { data: Record<string, unknown> } {
  const { data } = pageFixture(copy);
  for (const field of bodies) {
    const words = `Fixture ${field}`;
    data[field] = [
      {
        type: "paragraph",
        text: words,
        spans: [
          {
            type: "hyperlink",
            start: 0,
            end: words.length,
            data: { link_type: "Web", url: `/?fixture=${field}` },
          },
        ],
      },
      { type: "list-item", text: `${words} item`, spans: [] },
      {
        type: "paragraph",
        text: `${words} by {legal name} dba {Name}, at {email}, not {e-mail}.`,
        spans: [],
      },
    ];
  }
  data.effective_date = "2030-01-02";
  return { data };
}
