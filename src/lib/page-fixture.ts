// A page singleton document for a smoke test of that page's Prismic path,
// served only by `vite dev` to a request carrying the page's fixture cookie
// (`msot-<page>-fixture`). The prerendered site never reads it: each server
// load checks `dev` first, which is false in every build. Every text field
// reads "Fixture <field>", a heading's lines "Fixture <field> 1", "… 2", and a
// group's rows "Fixture <group> <row> <field>", so a page showing one can only
// have read the document. An image field named in `images` is a picture at
// "/favicon.svg?fixture=<field>" (in a group, "?fixture=<group>-<row>-<field>"),
// a real file whose address names the field. (Home's predates this:
// $lib/home-fixture.)
type Copy = Record<string, string | string[] | Record<string, string>[]>;

const para = (text: string) => [{ type: "paragraph", text, spans: [] }];
const picture = (name: string) => ({
  url: `/favicon.svg?fixture=${name}`,
  alt: null,
  copyright: null,
  dimensions: { width: 48, height: 48 },
  id: name,
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
});

/**
 * `rich` names the group fields that are rich text (a paragraphs field), and
 * `images` the fields, top-level or in a group, that are image fields.
 */
export function pageFixture(
  copy: Copy,
  rich: string[] = [],
  images: string[] = [],
): { data: Record<string, unknown> } {
  return {
    data: Object.fromEntries(
      Object.entries(copy).map(([field, today]) => {
        if (typeof today === "string")
          return [field, images.includes(field) ? picture(field) : `Fixture ${field}`];
        if (today.every((v) => typeof v === "string"))
          return [field, para(today.map((_, i) => `Fixture ${field} ${i + 1}`).join("\n"))];
        return [
          field,
          (today as Record<string, string>[]).map((row, i) =>
            Object.fromEntries(
              Object.keys(row).map((k) => [
                k,
                images.includes(k)
                  ? picture(`${field}-${i + 1}-${k}`)
                  : rich.includes(k)
                    ? para(`Fixture ${field} ${i + 1} ${k}`)
                    : `Fixture ${field} ${i + 1} ${k}`,
              ]),
            ),
          ),
        ];
      }),
    ),
  };
}
