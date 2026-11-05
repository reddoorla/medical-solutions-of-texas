// Who MSOT is, stated once (MSOT Marketing's Developer Brief Part 2, §12a).
// The footer, the Contact page and the Organization JSON-LD all read these
// values, so the facts a visitor sees and the facts in the markup can't drift
// apart. Every value is Marketing's confirmed wording; change one here only on
// their say. A Prismic singleton was weighed and not used: these change about
// once a year, and a typed file needs no CMS fetch on every page.
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

export const ADDRESS_LINE = `${IDENTITY.address.street}, ${IDENTITY.address.city}, ${IDENTITY.address.region} ${IDENTITY.address.postalCode}`;
