// Partners' copy (src/routes/[[preview=preview]]/partners/+page.svelte), editable
// in Prismic's `partners_page` document; see $lib/content for how the fallback
// works. The logos are part of the copy: each client row is a name and its
// logo, and the name is the logo's alt text, so who MSOT works with is text,
// not only pictures (Developer Brief Part 2, §14b). A row needs both. The code's
// logos are named here by file and resolved by the caller ($lib/copy/partners-logos).
// The hero picture stays in code, like every page's.
import { asImageSrc, isFilled, type ImageField } from "@prismicio/client";
import type { PartnersPageDocument } from "../../../prismicio-types";
import { rows, text } from "../content";

/** Today's wording and logos (by file name): what the page shows with no partners_page document. */
export const PARTNERS_COPY = {
  heading_left: "Our",
  heading_right: "Partners",
  testimonial_heading: "working with the best",
  testimonial_logo: "revogenLogo.svg",
  testimonial_name: "Revogen",
  testimonial_text:
    "MSOT made the process of getting our product into the DoD system easier than we ever thought possible. They're an invaluable partnership and wealth of knowledge when it comes to selling to the DoD and VA hospital systems.",
  partnerships_heading: "Successful Partnerships",
  partnerships_text:
    "Our most successful partnerships are with companies who are looking to expand their product offering into VA and DoW facilities, who have the flexibility and mindset to work with the government and who believe it's meaningful to be a part of offering the best healthcare possible to our active duty and veteran population in the United States.",
  clients_heading: "Our Clients",
  clients: [
    { name: "Revogen", logo: "revogen-duo.png" },
    { name: "Cibolo Spine", logo: "cibolo-spine_medium duo.png" },
    { name: "Caerus", logo: "caerus.png" },
    { name: "Aegis Spine", logo: "AEGIS-SPINE-logo-300x94.png" },
    { name: "Leith Medical", logo: "Leith.png" },
    { name: "Centinel Spine", logo: "centinel spine.png" },
    { name: "Spinal Simplicity", logo: "SpinalSimplicityLogo.Master.png" },
    { name: "EDGe Surgical", logo: "EDGe.png" },
    { name: "CTL Amedica", logo: "ctl.png" },
    { name: "4WEB Medical", logo: "4web.png" },
    { name: "Difusion Technologies", logo: "difusion.png" },
    { name: "Metalogix", logo: "Metalogix.png" },
    { name: "Expanding Innovations", logo: "expanding innovations.png" },
    { name: "Aurora", logo: "aurora.png" },
    { name: "Axial Biologics", logo: "axial_biologics_logo.png" },
    { name: "Bonebridge", logo: "bonebridge.png" },
    { name: "SIGNUS", logo: "SIGNUS.png" },
    { name: "Nexxt Spine", logo: "Nexxt-duo.png" },
  ],
};

export type PartnersCopy = ReturnType<typeof partnersCopy>;

/**
 * The partners_page document over today's wording, field by field. `logo`
 * turns one of the code's logo file names into the picture's address.
 */
export function partnersCopy(doc: PartnersPageDocument | null, logo: (file: string) => string) {
  const d = doc?.data;
  // A logo is sized for its slot (about 208 and 256 CSS px wide), at twice
  // that for sharp screens, as $lib/team does for headshots.
  const src = (field: ImageField, w: number) => asImageSrc(field, { w }) ?? field.url;
  // A logo's company name: the row's own name, else the alt text set on the
  // image in Prismic's media library.
  const named = (name: string | null | undefined, field: ImageField | null | undefined) =>
    text(name, "") || (isFilled.image(field) ? text(field.alt, "") : "");
  // The quote's logo and company name are one pair: both from the document, or
  // both today's, so a new logo is never announced with the old name.
  const quoted = named(d?.testimonial_name, d?.testimonial_logo);
  const pair = isFilled.image(d?.testimonial_logo) && quoted ? d.testimonial_logo : null;
  return {
    heading_left: text(d?.heading_left, PARTNERS_COPY.heading_left),
    heading_right: text(d?.heading_right, PARTNERS_COPY.heading_right),
    testimonial_heading: text(d?.testimonial_heading, PARTNERS_COPY.testimonial_heading),
    testimonial_logo: pair ? src(pair, 512) : logo(PARTNERS_COPY.testimonial_logo),
    testimonial_name: pair ? quoted : PARTNERS_COPY.testimonial_name,
    testimonial_text: text(d?.testimonial_text, PARTNERS_COPY.testimonial_text),
    partnerships_heading: text(d?.partnerships_heading, PARTNERS_COPY.partnerships_heading),
    partnerships_text: text(d?.partnerships_text, PARTNERS_COPY.partnerships_text),
    clients_heading: text(d?.clients_heading, PARTNERS_COPY.clients_heading),
    clients: rows(
      d?.clients,
      (r) => {
        const name = named(r.name, r.logo);
        return name && isFilled.image(r.logo) ? { name, logo: src(r.logo, 416) } : null;
      },
      PARTNERS_COPY.clients.map((c) => ({ name: c.name, logo: logo(c.logo) })),
    ),
  };
}
