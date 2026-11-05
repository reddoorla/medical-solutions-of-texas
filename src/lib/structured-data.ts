// The Organization and WebSite JSON-LD for Home only (MSOT Marketing's
// Developer Brief Part 2, §13a; Google wants it on the home or About page, not
// every page). Built from the site's identity ($lib/identity), the same values the footer and Contact
// show, so the markup can't say something the page doesn't.
//
// Deliberately absent: foundingDate (§13a: the legal entity dates to 2004, the
// current owners to 2022), SearchAction (no site search), and the Service,
// FAQPage and Person markup Marketing also asked for, which Reddoor's response
// declines with sources (Google: "Structured data isn't required for
// generative AI search").
import { SITE_URL } from "./site.js";
import type { Identity } from "./identity";

const HOME = `${SITE_URL}/`;
export const ORGANIZATION_ID = `${HOME}#organization`;
export const WEBSITE_ID = `${HOME}#website`;

/**
 * "+18333074418" → "+1-833-307-4418", the form §13a gives. Any other country's
 * number stays in its E.164 form, since its grouping differs.
 */
export function dashedPhone(e164: string): string {
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `+1-${m[1]}-${m[2]}-${m[3]}` : e164;
}

export function homeGraph(identity: Identity) {
  const a = identity.address;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: identity.name,
        alternateName: identity.shortName,
        legalName: identity.legalName,
        url: HOME,
        // The site's khaki mark on its own dark brown, 640px: Google wants a
        // logo that reads on white, and the bare mark is pale on transparent.
        logo: `${SITE_URL}/msot-logo-organization.png`,
        description: identity.definition,
        address: {
          "@type": "PostalAddress",
          streetAddress: a.street,
          addressLocality: a.city,
          addressRegion: a.region,
          postalCode: a.postalCode,
          addressCountry: a.country,
        },
        // No telephone at all when the phone field holds no dialable number.
        ...(identity.phoneE164 ? { telephone: dashedPhone(identity.phoneE164) } : {}),
        email: identity.email,
        naics: identity.naics,
        identifier: [
          { "@type": "PropertyValue", propertyID: "SAM UEI", value: identity.uei },
          { "@type": "PropertyValue", propertyID: "CAGE Code", value: identity.cage },
          { "@type": "PropertyValue", propertyID: "GSA FSS Contract", value: identity.fss },
          ...identity.contracts.map((c) => ({
            "@type": "PropertyValue",
            propertyID: c.label,
            value: c.value,
          })),
        ],
        areaServed: { "@type": "Country", name: "United States" },
        knowsAbout: [
          "Federal healthcare contracting",
          "VA Federal Supply Schedule (FSS)",
          "DLA Electronic Catalog (ECAT)",
          "Distribution and Pricing Agreements (DAPA)",
          "Department of Veterans Affairs medical procurement",
          "Department of War (DoW) medical procurement",
          "Department of Defense (DoD) medical procurement",
          "Veteran-Owned Small Business (VOSB) contracting",
          "Medical-surgical product distribution",
        ],
        sameAs: [...identity.sameAs],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: HOME,
        name: identity.name,
        alternateName: identity.shortName,
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

/** A <script> tag safe to place with {@html}: "<" is escaped inside the JSON. */
export function jsonLdScript(data: unknown): string {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}
