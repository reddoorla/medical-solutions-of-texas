// Resources' copy (src/routes/[[preview=preview]]/resources/+page.svelte),
// editable in Prismic's `resources_page` document; see $lib/content for how the
// fallback works. The files are content too: a row is a title and its file, and
// the charge sheet is a file field, so Marketing can replace a PDF. The address
// and phone number are the `settings` document's. "Contact Us" and "READ IT"
// link to the site's own pages, which stay in code.
import { isFilled, type LinkToMediaField } from "@prismicio/client";
import type { ResourcesPageDocument } from "../../../prismicio-types";
import { rows, text } from "../content";

/**
 * Today's wording and files: what the page shows with no resources_page
 * document. "{fss}" in a fallback title is the FSS contract number from
 * `settings`, as the page has always shown it.
 */
export const RESOURCES_COPY = {
  heading: "Resources",
  charge_heading: "CHARGE SHEET",
  charge_button: "DOWNLOAD",
  charge_file: "/pdfs/MSOT_ChargeSheet.pdf",
  phone_label: "Phone:",
  service_email: "customerservice@MedicalSolutionsofTX.com",
  contact_button: "Contact Us",
  capabilities_heading: "CAPABILITIES STATEMENT",
  capabilities_button: "READ IT",
  catalogs_heading: "Catalogs",
  catalogs: [
    { title: "FSS Catalog (Contract # {fss})", file: "/pdfs/MSOT_FSSCatalog.pdf" },
    { title: "Commercial Catalog", file: "/pdfs/MSOT_CommercialCatalog.pdf" },
  ],
  suppliers_heading: "Suppliers",
  suppliers: [{ title: "Catalog", file: "/pdfs/MSOT_CommercialCatalog.pdf" }],
  guides_heading: "Technique Guides",
  guides: [{ title: "Technique Guide", file: "/" }],
};

export type ResourcesCopy = ReturnType<typeof resourcesCopy>;

type Row = { title?: string | null; file?: LinkToMediaField };

/** A filled file field's address; else the code's file. */
const file = (field: LinkToMediaField | null | undefined, fallback: string) =>
  isFilled.linkToMedia(field) && field.url ? field.url : fallback;

/**
 * The resources_page document over today's wording, field by field. `fss` is
 * the FSS contract number (`settings`), for the code's FSS catalog title.
 */
export function resourcesCopy(doc: ResourcesPageDocument | null, fss: string) {
  const d = doc?.data;
  const list = (group: readonly Row[] | null | undefined, today: typeof RESOURCES_COPY.catalogs) =>
    rows(
      group,
      (r) => {
        const title = text(r.title, "");
        const href = file(r.file, "");
        return title && href ? { title, file: href } : null;
      },
      today.map((r) => ({ title: r.title.replace("{fss}", fss), file: r.file })),
    );
  return {
    heading: text(d?.heading, RESOURCES_COPY.heading),
    charge_heading: text(d?.charge_heading, RESOURCES_COPY.charge_heading),
    charge_button: text(d?.charge_button, RESOURCES_COPY.charge_button),
    charge_file: file(d?.charge_file, RESOURCES_COPY.charge_file),
    phone_label: text(d?.phone_label, RESOURCES_COPY.phone_label),
    service_email: text(d?.service_email, RESOURCES_COPY.service_email),
    contact_button: text(d?.contact_button, RESOURCES_COPY.contact_button),
    capabilities_heading: text(d?.capabilities_heading, RESOURCES_COPY.capabilities_heading),
    capabilities_button: text(d?.capabilities_button, RESOURCES_COPY.capabilities_button),
    catalogs_heading: text(d?.catalogs_heading, RESOURCES_COPY.catalogs_heading),
    catalogs: list(d?.catalogs, RESOURCES_COPY.catalogs),
    suppliers_heading: text(d?.suppliers_heading, RESOURCES_COPY.suppliers_heading),
    suppliers: list(d?.suppliers, RESOURCES_COPY.suppliers),
    guides_heading: text(d?.guides_heading, RESOURCES_COPY.guides_heading),
    guides: list(d?.guides, RESOURCES_COPY.guides),
  };
}
