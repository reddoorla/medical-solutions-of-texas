// The Capabilities Statement's copy (src/routes/capabilities/+page.svelte),
// editable in Prismic's `capabilities_page` document; see $lib/content for how
// the fallback works. The names, numbers, phone, email and address are the
// `settings` document's. The SEO title and description have no `page`
// document here, so they are this type's: empty, the layout keeps $lib/seo's.
import type { CapabilitiesPageDocument } from "../../../prismicio-types";
import { rows, text } from "../content";

/** Today's wording, word for word: what the page shows with no capabilities_page document. */
export const CAPABILITIES_COPY = {
  // The SEO pair is never a fallback here (capabilitiesCopy gives null, and the
  // layout falls back to $lib/seo): it copies PAGE_SEO["/capabilities"] only so
  // pageFixture fills the two fields. Edit $lib/seo, then these, together.
  meta_title: "Capabilities Statement | MSOT",
  meta_description:
    "MSOT's capabilities, contract vehicles (ECAT, FSS, DAPA), company data and designations: connecting VA and DoW treatment facilities with med-surg suppliers.",
  eyebrow: "Veteran-Owned Small Business",
  heading: "Capabilities Statement",
  mission_heading: "Mission",
  mission_line: "Connecting VA and DoW treatment facilities with med-surg suppliers.",
  mission_text:
    "We bridge the gap between clinical demand and government procurement to support service members and veterans. Our expertise, VOSB (Veteran-Owned Small Business) status and deep network of relationships let us offer solutions where others hit roadblocks.",
  numbers_heading: "By the numbers",
  numbers: [
    { figure: "45 working days or less", line: "to contract. Industry average: 120+" },
    { figure: "39 federal locations", line: "served across 16 states" },
    { figure: "8,579 med-surg line items", line: "added to ECAT each month" },
  ],
  capabilities_heading: "Core capabilities",
  capabilities: [
    { item: "Federal contract access through ECAT, FSS and DAPA" },
    { item: "Government sales strategy for VA and DoW" },
    { item: "Product marketing and contracting" },
    { item: "Clinical product evaluation and approval support" },
    { item: "Pricing strategy and direct invoicing" },
    { item: "Dedicated Government Account Coordinators" },
  ],
  vehicles_heading: "Contract vehicles",
  ecat_jit_name: "ECAT",
  ecat_jit_note: "Just in Time",
  ecat_dvd_name: "ECAT",
  ecat_dvd_note: "Direct Vendor Delivery",
  fss_name: "FSS",
  fss_note: "VA Schedule 65 II A",
  dapa_medical_name: "DAPA",
  dapa_medical_note: "Medical/Surgical",
  dapa_equipment_name: "DAPA",
  dapa_equipment_note: "Equipment",
  company_heading: "Company data",
  legal_name_label: "Legal name",
  dba: "DBA",
  uei_label: "UEI",
  cage_label: "CAGE",
  naics_label: "NAICS",
  naics_primary: "(primary)",
  naics_secondary: "339112, 339113",
  designations_heading: "Designations",
  designations: [
    { scope: "Federal", items: "VOSB (Veteran-Owned Small Business) · Small Business" },
    {
      scope: "SCTRCA",
      items:
        "VBE: Veteran Business Enterprise · ESBE: Emerging Small Business · SBE: Small Business Entity",
    },
  ],
  different_heading: "What makes us different",
  different_text:
    "We are defined by expertise and experience. With 20 years of Air Force logistics and nearly 50 years in medical device sales on our leadership team, we know the VA and Department of War (DoW) healthcare landscape better than anyone. We help med-surg suppliers find and access opportunities they couldn't reach alone.",
  contact_heading: "Contact",
  domain: "medicalsolutionsoftx.com",
  contact_link: "Contact us",
};

export type CapabilitiesCopy = ReturnType<typeof capabilitiesCopy>;

/**
 * The capabilities_page document over today's wording, field by field. The SEO
 * fields are null when empty, so the layout's own fallback ($lib/seo) applies.
 */
export function capabilitiesCopy(doc: CapabilitiesPageDocument | null) {
  const d = doc?.data;
  return {
    meta_title: text(d?.meta_title, "") || null,
    meta_description: text(d?.meta_description, "") || null,
    eyebrow: text(d?.eyebrow, CAPABILITIES_COPY.eyebrow),
    heading: text(d?.heading, CAPABILITIES_COPY.heading),
    mission_heading: text(d?.mission_heading, CAPABILITIES_COPY.mission_heading),
    mission_line: text(d?.mission_line, CAPABILITIES_COPY.mission_line),
    mission_text: text(d?.mission_text, CAPABILITIES_COPY.mission_text),
    numbers_heading: text(d?.numbers_heading, CAPABILITIES_COPY.numbers_heading),
    numbers: rows(
      d?.numbers,
      (r) => {
        const row = { figure: text(r.figure, ""), line: text(r.line, "") };
        return row.figure ? row : null;
      },
      CAPABILITIES_COPY.numbers,
    ),
    capabilities_heading: text(d?.capabilities_heading, CAPABILITIES_COPY.capabilities_heading),
    capabilities: rows(
      d?.capabilities,
      (r) => {
        const row = { item: text(r.item, "") };
        return row.item ? row : null;
      },
      CAPABILITIES_COPY.capabilities,
    ),
    vehicles_heading: text(d?.vehicles_heading, CAPABILITIES_COPY.vehicles_heading),
    ecat_jit_name: text(d?.ecat_jit_name, CAPABILITIES_COPY.ecat_jit_name),
    ecat_jit_note: text(d?.ecat_jit_note, CAPABILITIES_COPY.ecat_jit_note),
    ecat_dvd_name: text(d?.ecat_dvd_name, CAPABILITIES_COPY.ecat_dvd_name),
    ecat_dvd_note: text(d?.ecat_dvd_note, CAPABILITIES_COPY.ecat_dvd_note),
    fss_name: text(d?.fss_name, CAPABILITIES_COPY.fss_name),
    fss_note: text(d?.fss_note, CAPABILITIES_COPY.fss_note),
    dapa_medical_name: text(d?.dapa_medical_name, CAPABILITIES_COPY.dapa_medical_name),
    dapa_medical_note: text(d?.dapa_medical_note, CAPABILITIES_COPY.dapa_medical_note),
    dapa_equipment_name: text(d?.dapa_equipment_name, CAPABILITIES_COPY.dapa_equipment_name),
    dapa_equipment_note: text(d?.dapa_equipment_note, CAPABILITIES_COPY.dapa_equipment_note),
    company_heading: text(d?.company_heading, CAPABILITIES_COPY.company_heading),
    legal_name_label: text(d?.legal_name_label, CAPABILITIES_COPY.legal_name_label),
    dba: text(d?.dba, CAPABILITIES_COPY.dba),
    uei_label: text(d?.uei_label, CAPABILITIES_COPY.uei_label),
    cage_label: text(d?.cage_label, CAPABILITIES_COPY.cage_label),
    naics_label: text(d?.naics_label, CAPABILITIES_COPY.naics_label),
    naics_primary: text(d?.naics_primary, CAPABILITIES_COPY.naics_primary),
    naics_secondary: text(d?.naics_secondary, CAPABILITIES_COPY.naics_secondary),
    designations_heading: text(d?.designations_heading, CAPABILITIES_COPY.designations_heading),
    designations: rows(
      d?.designations,
      (r) => {
        const row = { scope: text(r.scope, ""), items: text(r.items, "") };
        return row.scope ? row : null;
      },
      CAPABILITIES_COPY.designations,
    ),
    different_heading: text(d?.different_heading, CAPABILITIES_COPY.different_heading),
    different_text: text(d?.different_text, CAPABILITIES_COPY.different_text),
    contact_heading: text(d?.contact_heading, CAPABILITIES_COPY.contact_heading),
    domain: text(d?.domain, CAPABILITIES_COPY.domain),
    contact_link: text(d?.contact_link, CAPABILITIES_COPY.contact_link),
  };
}
