// The words around every page: the menu (src/routes/+layout.svelte) and the
// footer (Footer.svelte, FooterIdentity.svelte), editable in the `settings`
// document's Menu and Footer tabs; see $lib/content for how the fallback works.
// The links' addresses stay in code. Home's own footer call to action is the
// home_page document's. The footer's lines around the identity values, the
// title of a Prismic page with none, and the error page's words are fields too
// (the operator, 11-06, on the "which strings stay in code" decision: move
// them). The footer lines and the untitled title are templates: {name},
// {short name}, {legal name}, {business type}, {tagline}, {uei}, {cage},
// {fss}, {year} and {page} are filled in ($lib/content's fill).
import type { SettingsDocument } from "../../../prismicio-types";
import { fill, text } from "../content";

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
  footer_name_line: "{name} ({short name})",
  footer_type_line: "{business type} · {tagline}",
  footer_ids_line: "UEI {uei} · CAGE {cage} · FSS {fss}",
  footer_copyright: "©{year} {legal name} dba {name} |",
  untitled_title: "MSOT | {page}",
  not_found_text: "Page not found",
  home_link: "Back to home",
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
    footer_name_line: text(d?.footer_name_line, CHROME_COPY.footer_name_line),
    footer_type_line: text(d?.footer_type_line, CHROME_COPY.footer_type_line),
    footer_ids_line: text(d?.footer_ids_line, CHROME_COPY.footer_ids_line),
    footer_copyright: text(d?.footer_copyright, CHROME_COPY.footer_copyright),
    untitled_title: text(d?.untitled_title, CHROME_COPY.untitled_title),
    not_found_text: text(d?.not_found_text, CHROME_COPY.not_found_text),
    home_link: text(d?.home_link, CHROME_COPY.home_link),
  };
}

// Home's title if it had none; it never reaches the screen, since $lib/seo
// titles "/", so it stays in code rather than become a field no edit can show.
const SITE_NAME = "Medical Solutions of Texas";

/**
 * The browser-tab title of a Prismic page with no title of its own, from its
 * address, so it is still unique and readable ("/rep-login" is "MSOT | Rep
 * Login") rather than empty or a duplicate.
 */
export function untitledTitle(
  chrome: Pick<ChromeCopy, "untitled_title">,
  pathname: string,
): string {
  const seg = pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .pop();
  if (!seg) return SITE_NAME;
  const label = seg
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return fill(chrome.untitled_title, { page: label });
}
