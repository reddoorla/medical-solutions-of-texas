// The words around every page: the menu (src/routes/+layout.svelte) and the
// footer (Footer.svelte, FooterIdentity.svelte), editable in the `settings`
// document's Menu and Footer tabs; see $lib/content for how the fallback works.
// The links' addresses stay in code. Home's own footer call to action is the
// home_page document's. Left in code on purpose, and on the operator's batched
// question (workspace decisions/, "which strings stay in code"): the footer's
// " dba ", "UEI ", "CAGE ", "FSS " and the punctuation (· © | and the
// short name's parentheses) between identity values; the layout's
// SITE_NAME and fallbackTitle's "MSOT | " (a Prismic page with no title); and
// the error page's "Page not found" and "Back to home".
import type { SettingsDocument } from "../../../prismicio-types";
import { text } from "../content";

/** Today's wording, word for word: what every page shows with no settings document. */
export const CHROME_COPY = {
  nav_about: "About",
  nav_partners: "Partners",
  nav_process: "Process",
  nav_resources: "Resources",
  nav_contact: "Contact",
  logo_alt: "msot logo",
  open_menu: "Open menu",
  close_menu: "Close menu",
  footer_cta: "let’s get started",
  footer_contact_button: "Contact Us",
  footer_process_button: "Learn More",
  footer_logo_alt: "Medical Solutions of Texas home",
  vosb_alt: "Veteran-Owned Small Business (VOSB)",
  company_details: "Company details",
  privacy_link: "Privacy Policy",
};

export type ChromeCopy = ReturnType<typeof chromeCopy>;

/** The settings document's Menu and Footer fields over today's wording, field by field. */
export function chromeCopy(doc: SettingsDocument | null) {
  const d = doc?.data;
  return {
    nav_about: text(d?.nav_about, CHROME_COPY.nav_about),
    nav_partners: text(d?.nav_partners, CHROME_COPY.nav_partners),
    nav_process: text(d?.nav_process, CHROME_COPY.nav_process),
    nav_resources: text(d?.nav_resources, CHROME_COPY.nav_resources),
    nav_contact: text(d?.nav_contact, CHROME_COPY.nav_contact),
    logo_alt: text(d?.logo_alt, CHROME_COPY.logo_alt),
    open_menu: text(d?.open_menu, CHROME_COPY.open_menu),
    close_menu: text(d?.close_menu, CHROME_COPY.close_menu),
    footer_cta: text(d?.footer_cta, CHROME_COPY.footer_cta),
    footer_contact_button: text(d?.footer_contact_button, CHROME_COPY.footer_contact_button),
    footer_process_button: text(d?.footer_process_button, CHROME_COPY.footer_process_button),
    footer_logo_alt: text(d?.footer_logo_alt, CHROME_COPY.footer_logo_alt),
    vosb_alt: text(d?.vosb_alt, CHROME_COPY.vosb_alt),
    company_details: text(d?.company_details, CHROME_COPY.company_details),
    privacy_link: text(d?.privacy_link, CHROME_COPY.privacy_link),
  };
}
