// Who MSOT is, stated once (MSOT Marketing's Developer Brief Part 2, §12a).
// The footer, the Contact page and the Organization JSON-LD all read these
// values, so the facts a visitor sees and the facts in the markup can't drift
// apart. Every value is Marketing's confirmed wording.
//
// Marketing edits them in Prismic's `settings` document (the operator, 11-05:
// "all content should be in prismic, not in code"; the workspace's
// decisions/2026-11-05-1856-msot-content-to-prismic-models-route.md). This
// reverses the earlier call that "a Prismic singleton was weighed and not
// used": every page is prerendered, so the fetch happens once per build, not
// per visitor. The values below stay as the fallback, field by field: an empty
// field in the document shows today's wording, so the model can land before
// the document exists, and a half-filled document changes only what was filled.
import {
  isFilled,
  NotFoundError,
  RepositoryNotFoundError,
  type Client,
  type LinkField,
} from "@prismicio/client";
import type { SettingsDocument } from "../../prismicio-types";

export const IDENTITY = {
  name: "Medical Solutions of Texas",
  shortName: "MSOT",
  legalName: "OJH Services, Inc.",
  businessType: "Veteran-Owned Small Business (VOSB)",
  tagline: "Federal med-surg contracting for the VA and DoW",
  address: {
    street: "4903 Golden Quail, Suite 120",
    city: "San Antonio",
    region: "TX",
    postalCode: "78240",
    country: "US",
  },
  /** As printed. Never 210.744.9686 on the site (Marketing, 2026-10-21). */
  phone: "833.307.4418",
  phoneE164: "+18333074418",
  /** The public address. customerservice@ stays where it already appears. */
  email: "info@MedicalSolutionsofTX.com",
  uei: "Z7Q8TN9HMRC4",
  cage: "6ZM08",
  fss: "36F797-25-D-0204",
  /** Primary NAICS; the Capabilities Statement also lists 339112 and 339113. */
  naics: "423450",
  /** Contract vehicles, as on the Capabilities Statement (2026). */
  contracts: [
    { label: "DLA ECAT Contract (Just in Time)", value: "SPE2DE-25-D-A012" },
    { label: "DLA ECAT Contract (Direct Vendor Delivery)", value: "SPE2DE-25-D-A011" },
    { label: "DAPA (Medical/Surgical)", value: "SP0200-11-H-0018" },
    { label: "DAPA (Equipment)", value: "SP0200-11-H-0003" },
  ],
  /** Pages specifically about MSOT (§13a), never a registry's home page. */
  sameAs: [
    "https://www.linkedin.com/company/medical-solutions-of-texas",
    "https://www.gsaelibrary.gsa.gov/ElibMain/home.do/contractorInfo.do?contractNumber=36F79725D0204&contractorName=OJH+SERVICES,+INC.&executeQuery=YES",
  ],
} as const;

/** §12b, word for word: the first paragraph on Home. */
export const DEFINITION =
  "Medical Solutions of Texas (MSOT) is a San Antonio–based Veteran-Owned Small Business (VOSB) that helps medical and surgical manufacturers get their products on federal contract (ECAT, FSS and DAPA) and into VA and Department of War (DoW) treatment facilities.";

/** §12b with the §12f bridge: About's first sentence, the page's first mention of DoW. */
export const DEFINITION_ABOUT =
  "Medical Solutions of Texas (MSOT) is a San Antonio–based Veteran-Owned Small Business (VOSB) that helps medical and surgical manufacturers get their products on federal contract (ECAT, FSS and DAPA) and into VA and Department of War (DoW), formerly the Department of Defense (DoD), treatment facilities.";

/** §12c: the end of About's "Who we are". */
export const WORKS_WITH =
  "Medical Solutions of Texas (MSOT) works with medical-surgical manufacturers and federal healthcare facilities.";

/** "Page not found | MSOT" and its kin: the titles the layout gives an error page. */
export const NOT_FOUND_TITLE = "Page not found | MSOT";
export const ERROR_TITLE = "Something went wrong | MSOT";

/**
 * Last-resort description, derived from the real homepage copy (VOSB status +
 * navigating government healthcare contracting for the VA and DoW).
 */
export const DEFAULT_DESCRIPTION =
  "Medical Solutions of Texas is a Veteran-Owned Small Business that helps medical vendors navigate government healthcare contracting for the VA and DoW.";

export type Identity = {
  name: string;
  shortName: string;
  legalName: string;
  businessType: string;
  tagline: string;
  address: { street: string; city: string; region: string; postalCode: string; country: string };
  phone: string;
  phoneE164: string;
  email: string;
  uei: string;
  cage: string;
  fss: string;
  naics: string;
  contracts: { label: string; value: string }[];
  sameAs: string[];
  definition: string;
  definitionAbout: string;
  worksWith: string;
  notFoundTitle: string;
  errorTitle: string;
  defaultDescription: string;
};

/** The one-line address the footer and /capabilities print. */
export const addressLine = (a: Identity["address"]) =>
  `${a.street}, ${a.city}, ${a.region} ${a.postalCode}`;

export const ADDRESS_LINE = addressLine(IDENTITY.address);

/**
 * "833.307.4418" → "+18333074418": the first North American number in the
 * field, so an extension in any wording ("ext. 2", "extension 2", "press 2")
 * or a second number is not dialled. A North American area code and exchange
 * never start with 0 or 1, so a number missing a digit cannot be read as one
 * with its "1" taken for the area code. A number written with its own "+"
 * country code ("+44 20 7946 0958") keeps it, if it has 8 to 15 digits, does
 * not start "+1" (a "+1" number that is not North American is a typo), and is
 * not ten digits shaped like a North American number.
 * Anything else ("TBD", a typo with a digit too many or too few) gives "":
 * the pages then print the phone with no call link, rather than a link that
 * dials the wrong number.
 */
export function toE164(phone: string): string {
  const m = phone.match(/^[^\d+]*(?:\+?1\D*)?([2-9]\d{2})\D*([2-9]\d{2})\D*(\d{4})(?!\d)/);
  // A leading "+" other than "+1" never matches: [^\d+]* cannot pass it.
  if (m) return `+1${m[1]}${m[2]}${m[3]}`;
  if (!/^\+[\d\s().-]{7,}$/.test(phone.trim())) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("1") || digits.length < 8 || digits.length > 15) return "";
  // "+833.307.4418" is a North American number missing its "1", not a call
  // abroad: ten digits shaped like one get no link rather than a wrong one.
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits) ? "" : `+${digits}`;
}

/** Today's wording, every field: what the site shows with no `settings` document. */
export const CODE_IDENTITY: Identity = {
  ...IDENTITY,
  address: { ...IDENTITY.address },
  contracts: IDENTITY.contracts.map((c) => ({ ...c })),
  sameAs: [...IDENTITY.sameAs],
  definition: DEFINITION,
  definitionAbout: DEFINITION_ABOUT,
  worksWith: WORKS_WITH,
  notFoundTitle: NOT_FOUND_TITLE,
  errorTitle: ERROR_TITLE,
  defaultDescription: DEFAULT_DESCRIPTION,
};

/** A filled web link's URL, or "". */
const linkUrl = (link: LinkField | null | undefined) =>
  isFilled.link(link) && "url" in link && link.url ? link.url.trim() : "";

/** A filled text field, trimmed; else the fallback. */
const pick = (value: string | null | undefined, fallback: string) =>
  isFilled.keyText(value) && value.trim() ? value.trim() : fallback;

/**
 * The `settings` document over today's wording, field by field. Today's four
 * contract vehicles keep their names and take their numbers from four fields,
 * because /capabilities reads them in order; an added vehicle counts only with
 * both its name and number. The
 * `sameAs` list is the document's filled URLs when it has any, else today's.
 * The phone's E.164 form follows the printed phone.
 */
export function mergeIdentity(
  doc: SettingsDocument | null,
  code: Identity = CODE_IDENTITY,
): Identity {
  if (!doc) return code;
  const d = doc.data;
  const phone = pick(d.phone, code.phone);
  // Today's four vehicles keep their names; their numbers have a field each.
  const numbers = [d.ecat_jit, d.ecat_dvd, d.dapa_med, d.dapa_equip];
  const contracts = code.contracts.map((c, i) => ({
    label: c.label,
    value: pick(numbers[i], c.value),
  }));
  // A vehicle Marketing adds needs both its name and its number.
  for (const r of d.more_contracts ?? []) {
    const label = pick(r.label, "");
    const value = pick(r.value, "");
    if (label && value) contracts.push({ label, value });
  }
  const sameAs = (d.same_as ?? []).map((r) => linkUrl(r.url)).filter(Boolean);
  return {
    name: pick(d.name, code.name),
    shortName: pick(d.short_name, code.shortName),
    legalName: pick(d.legal_name, code.legalName),
    businessType: pick(d.business_type, code.businessType),
    tagline: pick(d.tagline, code.tagline),
    address: {
      street: pick(d.street, code.address.street),
      city: pick(d.city, code.address.city),
      region: pick(d.region, code.address.region),
      postalCode: pick(d.postal_code, code.address.postalCode),
      country: pick(d.country, code.address.country),
    },
    phone,
    phoneE164: toE164(phone),
    email: pick(d.email, code.email),
    uei: pick(d.uei, code.uei),
    cage: pick(d.cage, code.cage),
    fss: pick(d.fss, code.fss),
    naics: pick(d.naics, code.naics),
    contracts,
    sameAs: sameAs.length ? sameAs : code.sameAs,
    definition: pick(d.definition, code.definition),
    definitionAbout: pick(d.definition_about, code.definitionAbout),
    worksWith: pick(d.works_with, code.worksWith),
    notFoundTitle: pick(d.not_found_title, code.notFoundTitle),
    errorTitle: pick(d.error_title, code.errorTitle),
    defaultDescription: pick(d.default_description, code.defaultDescription),
  };
}

/**
 * True only for getSingle's "No documents were returned": a NotFoundError the
 * client throws itself, with no API response attached (@prismicio/client 7.23,
 * `dist/Client.js` line 200). Any other 404 from the Content API carries its
 * response, and a wrong repository name (RepositoryNotFoundError, which also
 * has none) is a misconfiguration; neither means "no document yet".
 */
export const isNoDocument = (e: unknown) =>
  e instanceof NotFoundError && !(e instanceof RepositoryNotFoundError) && e.response === undefined;

/**
 * The site's identity. With no `settings` document yet (the model reaches
 * Prismic only when it merges to `main`, and Marketing publishes after that),
 * the API answers "No documents were returned" and today's wording stands.
 *
 * `strict` is set while building: any other error then stops the build rather
 * than quietly ship the code's values into a prerendered page. A wrong
 * repository name (RepositoryNotFoundError, a kind of NotFoundError) is such
 * an error. At request time (the 404 page, Contact's form, /slice-simulator,
 * any /preview page) an error falls back to today's wording and is logged: an
 * editor's expired preview cookie or a Prismic outage must not turn every
 * server-rendered page into a 500.
 */
export async function loadIdentity(
  client: Pick<Client, "getSingle">,
  { strict }: { strict: boolean },
): Promise<Identity> {
  try {
    return mergeIdentity((await client.getSingle("settings")) as SettingsDocument);
  } catch (e) {
    if (isNoDocument(e)) return CODE_IDENTITY;
    if (strict) throw e;
    console.error("settings: falling back to the code's identity:", e);
    return CODE_IDENTITY;
  }
}

/** /contact's meta description (Marketing's §12e wording), from the identity. */
export const contactDescription = (identity: Identity) =>
  `Contact MSOT at ${addressLine(identity.address)}, or call ${identity.phone}.`;
