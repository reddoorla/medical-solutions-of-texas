export const PRIVACY_POLICY_DRAFT = true;

export const PRIVACY_PATH = "/privacy";

export const PRIVACY_VALUES = {
  legalName: "Medical Solutions of Texas",
  contactEmail: "info@MedicalSolutionsofTX.com",
  effectiveDate: "2026-10-14",
};

export type PrivacyService = "forms" | "turnstile" | "ga4" | "adobeFonts" | "vimeo" | "netlify";

export const PRIVACY_SERVICES: PrivacyService[] = [
  "forms",
  "turnstile",
  "ga4",
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
