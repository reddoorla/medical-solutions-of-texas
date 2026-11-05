import { CODE_IDENTITY, type Identity } from "../identity";

// Final, by the operator's call (decision 2207, answer 2(b), 11-04): the
// LinkedIn section is added and the DRAFT banner and noindex come off.
export const PRIVACY_POLICY_DRAFT = false;

/** "OJH Services, Inc., doing business as Medical Solutions of Texas". */
export function privacyOwner(identity: Identity): string {
  return `${identity.legalName}, doing business as ${identity.name}`;
}

export const PRIVACY_PATH = "/privacy";

export const PRIVACY_VALUES = {
  // The owner, from the same identity as the footer's legal line. The page
  // itself reads privacyOwner() over the site's merged identity.
  legalName: privacyOwner(CODE_IDENTITY),
  contactEmail: "info@MedicalSolutionsofTX.com",
  effectiveDate: "2026-11-04",
};

export type PrivacyService =
  "forms" | "turnstile" | "ga4" | "gtm" | "linkedin" | "adobeFonts" | "vimeo" | "netlify";

export const PRIVACY_SERVICES: PrivacyService[] = [
  "forms",
  "turnstile",
  "ga4",
  "gtm",
  "linkedin",
  "adobeFonts",
  "vimeo",
  "netlify",
];

export function formatEffectiveDate(iso: string | undefined): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
