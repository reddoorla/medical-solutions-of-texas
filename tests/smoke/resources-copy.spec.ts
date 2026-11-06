import { test, expect } from "@playwright/test";
import { RESOURCES_COPY, resourcesCopy } from "../../src/lib/copy/resources";
import type { ResourcesPageDocument } from "../../prismicio-types";

// Resources' copy and files move into Prismic's `resources_page` singleton (the
// operator, 11-05: "all content should be in prismic, not in code"). Every
// field falls back to today's when the document leaves it empty, and a missing
// document changes nothing. Today's wording is written out here, not read from
// src/lib/copy/resources.ts, so a wrong value there fails.

const pdf = (url: string) => ({ link_type: "Media", url, kind: "document", name: "x.pdf" });
const doc = (data: Record<string, unknown>) => ({ data }) as unknown as ResourcesPageDocument;

test("resourcesCopy: no document is today's; a filled field wins, field by field", () => {
  const today = resourcesCopy(null, "36F797-25-D-0204");
  expect(today.heading).toBe("Resources");
  expect([today.charge_heading, today.charge_button, today.charge_file]).toEqual([
    "CHARGE SHEET",
    "DOWNLOAD",
    "/pdfs/MSOT_ChargeSheet.pdf",
  ]);
  expect(today.phone_label).toBe("Phone:");
  expect(today.service_email).toBe("customerservice@MedicalSolutionsofTX.com");
  expect(today.contact_button).toBe("Contact Us");
  expect([today.capabilities_heading, today.capabilities_button]).toEqual([
    "CAPABILITIES STATEMENT",
    "READ IT",
  ]);
  expect(today.catalogs_heading).toBe("Catalogs");
  expect(today.catalogs).toEqual([
    { title: "FSS Catalog (Contract # 36F797-25-D-0204)", file: "/pdfs/MSOT_FSSCatalog.pdf" },
    { title: "Commercial Catalog", file: "/pdfs/MSOT_CommercialCatalog.pdf" },
  ]);
  expect(today.suppliers_heading).toBe("Suppliers");
  expect(today.suppliers).toEqual([{ title: "Catalog", file: "/pdfs/MSOT_CommercialCatalog.pdf" }]);
  expect(today.guides_heading).toBe("Technique Guides");
  expect(today.guides).toEqual([{ title: "Technique Guide", file: "/" }]);
  // The FSS title follows settings' number.
  expect(resourcesCopy(null, "NEW-1").catalogs[0].title).toBe("FSS Catalog (Contract # NEW-1)");

  const some = resourcesCopy(
    doc({
      charge_file: pdf("https://msot.cdn.prismic.io/msot/charge.pdf"),
      service_email: "help@example.com",
      catalogs: [
        { title: "Titled and filed", file: pdf("https://msot.cdn.prismic.io/msot/a.pdf") },
        { title: "No file", file: { link_type: "Media" } },
        { title: "", file: pdf("https://msot.cdn.prismic.io/msot/b.pdf") },
      ],
    }),
    "36F797-25-D-0204",
  );
  expect(some.charge_file).toBe("https://msot.cdn.prismic.io/msot/charge.pdf");
  expect(some.service_email).toBe("help@example.com");
  // A row needs a title and a file; the rows replace the whole list.
  expect(some.catalogs).toEqual([
    { title: "Titled and filed", file: "https://msot.cdn.prismic.io/msot/a.pdf" },
  ]);
  expect(some.charge_heading).toBe("CHARGE SHEET");
  expect(some.suppliers).toEqual([{ title: "Catalog", file: "/pdfs/MSOT_CommercialCatalog.pdf" }]);
  expect(Object.keys(some).sort()).toEqual(Object.keys(RESOURCES_COPY).sort());
});

const visible = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

const body = (html: string) =>
  html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");

/** The page's own sections: after the site's nav, before the shared footer's band. */
const main = (html: string) => {
  const b = body(html);
  return b.slice(b.indexOf('<section class="h-96'), b.indexOf('<section class="bg-[#998B6A]'));
};

test("Resources reads the document: every field, in page order, each file on its row", async ({
  request,
}) => {
  const html = await (
    await request.get("/resources", { headers: { cookie: "msot-resources-fixture=1" } })
  ).text();
  const shown = visible(main(html));
  const words = [
    "Fixture heading",
    "Fixture charge_heading",
    "Fixture charge_button",
    "Fixture phone_label",
    "Fixture service_email",
    "Fixture contact_button",
    "Fixture capabilities_heading",
    "Fixture capabilities_button",
    "Fixture catalogs_heading",
    "Fixture catalogs 1 title",
    "Fixture catalogs 2 title",
    "Fixture suppliers_heading",
    "Fixture suppliers 1 title",
    "Fixture guides_heading",
    "Fixture guides 1 title",
  ];
  for (const w of words) expect(shown, w).toMatch(new RegExp(`${w}(?!\\w)`));
  const at = (w: string) => shown.search(new RegExp(`${w}(?!\\w)`));
  expect(
    [...words].sort((a, b) => at(a) - at(b)),
    "fields in page order",
  ).toEqual(words);

  // Each row's title and download icon link to that row's own file.
  const page = main(html);
  for (const [list, n] of [
    ["catalogs", 2],
    ["suppliers", 1],
    ["guides", 1],
  ] as const) {
    for (let i = 1; i <= n; i++) {
      const href = `/favicon.svg?fixture=${list}-${i}-file`;
      const links = [...page.matchAll(new RegExp(`<a href="${href.replace(/[?]/g, "\\?")}"`, "g"))];
      expect(links, `${list} ${i}`).toHaveLength(2);
      expect(page).toMatch(
        new RegExp(
          `<a href="${href.replace(/[?]/g, "\\?")}"[^>]*>\\s*<h4[^>]*>\\s*Fixture ${list} ${i} title`,
        ),
      );
    }
  }
  expect(page).toMatch(
    /<a[^>]*href="\/favicon\.svg\?fixture=charge_file"[^>]*>[\s\S]*?Fixture charge_button/,
  );

  // No section still shows today's words or files.
  for (const today of [
    "Resources",
    "CHARGE SHEET",
    "DOWNLOAD",
    "Phone:",
    "customerservice",
    "Contact Us",
    "CAPABILITIES STATEMENT",
    "READ IT",
    "Catalogs",
    "FSS Catalog",
    "Commercial Catalog",
    "Suppliers",
    "Technique Guide",
  ]) {
    expect(shown, today).not.toContain(today);
  }
  expect(page).not.toMatch(/\/pdfs\/MSOT_/);
});

test("with no document, Resources shows today's words and files", async ({ request }) => {
  const html = await (await request.get("/resources")).text();
  const shown = visible(main(html));
  for (const w of [
    "Resources",
    "CHARGE SHEET",
    "DOWNLOAD",
    "Phone:",
    "customerservice­@MedicalSolutionsofTX.com",
    "Contact Us",
    "CAPABILITIES STATEMENT",
    "READ IT",
    "Catalogs",
    "FSS Catalog (Contract # 36F797-25-D-0204)",
    "Commercial Catalog",
    "Suppliers",
    "Catalog",
    "Technique Guides",
    "Technique Guide",
  ]) {
    expect(shown, w).toContain(w);
  }
  const page = main(html);
  expect(page).toMatch(/href="\/pdfs\/MSOT_ChargeSheet\.pdf"[^>]*>[\s\S]*?DOWNLOAD/);
  expect([...page.matchAll(/href="\/pdfs\/MSOT_FSSCatalog\.pdf"/g)]).toHaveLength(2);
  expect([...page.matchAll(/href="\/pdfs\/MSOT_CommercialCatalog\.pdf"/g)]).toHaveLength(4);
});
