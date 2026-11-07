// Each page's <title> and meta description, from MSOT Marketing's Developer
// Brief Part 2, §12e table, word for word. Every title is 60 characters or
// fewer and every description 160 or fewer (tests/smoke/meta.spec.ts checks).
//
// Order of precedence in +layout.svelte: a filled Prismic `meta_title` /
// `meta_description` wins, then these, then the Prismic document title. On
// 2026-11-04 every published `page` document had both SEO fields empty and a
// title like "MSOT | About", so these are what the site shows.
import { SITE_URL } from "./site.js";
import { CODE_IDENTITY, contactDescription, type Identity } from "./identity";

type PageSeo = { title: string; description: string };

export const PAGE_SEO: Record<string, PageSeo> = {
  "/": {
    title: "VA and DoW Healthcare Contracting for Medical Vendors | MSOT",
    description:
      "MSOT is a San Antonio VOSB that helps med-surg manufacturers get on ECAT, FSS and DAPA contracts and into VA and DoW facilities.",
  },
  "/about": {
    title: "About MSOT · Veteran-Owned Small Business, San Antonio",
    description:
      "Who MSOT is: a VOSB founded by Air Force logistics and medical sales veterans to connect med-surg suppliers with VA and DoW contracts.",
  },
  "/process": {
    title: "How MSOT Gets Manufacturers on Federal Contract",
    description:
      "How MSOT takes med-surg manufacturers from first call to an ECAT, FSS or DAPA contract, with timelines and common questions.",
  },
  "/partners": {
    title: "MSOT Partners · Manufacturers Selling to the VA and DoW",
    description:
      "The manufacturers MSOT works with, and what makes a successful VA and DoW partnership.",
  },
  "/resources": {
    title: "MSOT Resources · FSS Catalog, Capabilities Statement, Guides",
    description:
      "MSOT's FSS catalog, capabilities statement, technique guides and federal procurement guides for manufacturers.",
  },
  "/contact": {
    title: "Contact MSOT · San Antonio, TX",
    // Built from the identity, so a changed address or phone changes it too;
    // pageDescription() gives the merged identity's version.
    description: contactDescription(CODE_IDENTITY),
  },
  // Not in Marketing's table: from the Capabilities Statement's own words.
  "/capabilities": {
    title: "Capabilities Statement | MSOT",
    description:
      "MSOT's capabilities, contract vehicles (ECAT, FSS, DAPA), company data and designations: connecting VA and DoW treatment facilities with med-surg suppliers.",
  },
  // Not in Marketing's table: titled like the others, described in the
  // policy's own opening words.
  "/privacy": {
    title: "Privacy Policy | MSOT",
    description:
      "What information the Medical Solutions of Texas website collects, why, who else receives it, and the choices you have.",
  },
};

/** A route's description from the table, with /contact's from `identity`. */
export function pageDescription(route: string, identity: Identity): string | undefined {
  return route === "/contact" ? contactDescription(identity) : PAGE_SEO[route]?.description;
}

/** The route without the optional `/preview` segment or a trailing slash. */
export function routeKey(pathname: string): string {
  const p = pathname.replace(/^\/preview(?=\/|$)/, "").replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

/** Self-referencing canonical URL on the apex origin, no trailing slash (§12e). */
export function canonicalUrl(pathname: string): string {
  const key = routeKey(pathname);
  return key === "/" ? SITE_URL : `${SITE_URL}${key}`;
}
