// The Organization and WebSite JSON-LD for Home only (MSOT Marketing's
// Developer Brief Part 2, §13a; Google wants it on the home or About page, not
// every page). Built from $lib/identity, the same values the footer and Contact
// show, so the markup can't say something the page doesn't.
//
// Deliberately absent: foundingDate (§13a: the legal entity dates to 2004, the
// current owners to 2022), SearchAction (no site search), and the Service,
// FAQPage and Person markup Marketing also asked for, which Reddoor's response
// declines with sources (Google: "Structured data isn't required for
// generative AI search").
import { SITE_URL } from "$lib/site";
import { IDENTITY, DEFINITION } from "$lib/identity";

const HOME = `${SITE_URL}/`;
export const ORGANIZATION_ID = `${HOME}#organization`;
export const WEBSITE_ID = `${HOME}#website`;

/** "+18333074418" → "+1-833-307-4418", the form §13a gives. */
function dashedPhone(e164: string): string {
  const d = e164.replace(/\D/g, "");
  return `+${d[0]}-${d.slice(1, 4)}-${d.slice(4, 7)}-${d.slice(7)}`;
}

export function homeGraph() {
  const a = IDENTITY.address;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: IDENTITY.name,
        alternateName: IDENTITY.shortName,
        legalName: IDENTITY.legalName,
        url: HOME,
        // The site's khaki mark on its own dark brown, 640px: Google wants a
        // logo that reads on white, and the bare mark is pale on transparent.
        logo: `${SITE_URL}/msot-logo-organization.png`,
        description: DEFINITION,
        address: {
          "@type": "PostalAddress",
          streetAddress: a.street,
          addressLocality: a.city,
          addressRegion: a.region,
          postalCode: a.postalCode,
          addressCountry: a.country,
        },
        telephone: dashedPhone(IDENTITY.phoneE164),
        email: IDENTITY.email,
        naics: IDENTITY.naics,
        identifier: [
          { "@type": "PropertyValue", propertyID: "SAM UEI", value: IDENTITY.uei },
          { "@type": "PropertyValue", propertyID: "CAGE Code", value: IDENTITY.cage },
          { "@type": "PropertyValue", propertyID: "GSA FSS Contract", value: IDENTITY.fss },
          ...IDENTITY.contracts.map((c) => ({
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
        sameAs: [...IDENTITY.sameAs],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: HOME,
        name: IDENTITY.name,
        alternateName: IDENTITY.shortName,
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
