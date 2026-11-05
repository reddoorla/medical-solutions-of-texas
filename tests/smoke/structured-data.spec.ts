import { test, expect, type APIRequestContext } from "@playwright/test";

// MSOT Marketing's Developer Brief Part 2, §13a: one Organization + WebSite
// graph, on Home only, in the server HTML. The expected values are written
// out, not imported from $lib/identity, so a wrong value there fails here.
const PAGES = ["/", "/about", "/partners", "/process", "/resources", "/contact", "/privacy"];

async function blocks(request: APIRequestContext, path: string) {
  const html = await (await request.get(path)).text();
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1]),
  );
}

test("Home carries exactly one JSON-LD graph: Organization and WebSite, with §13a's values", async ({
  request,
}) => {
  const found = await blocks(request, "/");
  expect(found).toHaveLength(1);
  const graph = found[0];
  expect(graph["@context"]).toBe("https://schema.org");
  const [org, site] = graph["@graph"];
  expect(graph["@graph"].map((n: { "@type": string }) => n["@type"])).toEqual([
    "Organization",
    "WebSite",
  ]);

  expect(org).toEqual({
    "@type": "Organization",
    "@id": "https://medicalsolutionsoftx.com/#organization",
    name: "Medical Solutions of Texas",
    alternateName: "MSOT",
    legalName: "OJH Services, Inc.",
    url: "https://medicalsolutionsoftx.com/",
    logo: "https://medicalsolutionsoftx.com/msot-logo-organization.png",
    description:
      "Medical Solutions of Texas (MSOT) is a San Antonio–based Veteran-Owned Small Business (VOSB) that helps medical and surgical manufacturers get their products on federal contract (ECAT, FSS and DAPA) and into VA and Department of War (DoW) treatment facilities.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "4903 Golden Quail, Suite 120",
      addressLocality: "San Antonio",
      addressRegion: "TX",
      postalCode: "78240",
      addressCountry: "US",
    },
    telephone: "+1-833-307-4418",
    email: "info@MedicalSolutionsofTX.com",
    naics: "423450",
    areaServed: { "@type": "Country", name: "United States" },
    identifier: org.identifier,
    knowsAbout: org.knowsAbout,
    sameAs: org.sameAs,
  });
  expect(org.identifier).toEqual(
    [
      ["SAM UEI", "Z7Q8TN9HMRC4"],
      ["CAGE Code", "6ZM08"],
      ["GSA FSS Contract", "36F797-25-D-0204"],
      ["DLA ECAT Contract (Just in Time)", "SPE2DE-25-D-A012"],
      ["DLA ECAT Contract (Direct Vendor Delivery)", "SPE2DE-25-D-A011"],
      ["DAPA (Medical/Surgical)", "SP0200-11-H-0018"],
      ["DAPA (Equipment)", "SP0200-11-H-0003"],
    ].map(([propertyID, value]) => ({ "@type": "PropertyValue", propertyID, value })),
  );
  expect(org.knowsAbout).toEqual([
    "Federal healthcare contracting",
    "VA Federal Supply Schedule (FSS)",
    "DLA Electronic Catalog (ECAT)",
    "Distribution and Pricing Agreements (DAPA)",
    "Department of Veterans Affairs medical procurement",
    "Department of War (DoW) medical procurement",
    "Department of Defense (DoD) medical procurement",
    "Veteran-Owned Small Business (VOSB) contracting",
    "Medical-surgical product distribution",
  ]);
  expect(org.sameAs).toEqual([
    "https://www.linkedin.com/company/medical-solutions-of-texas",
    "https://www.gsaelibrary.gsa.gov/ElibMain/home.do/contractorInfo.do?contractNumber=36F79725D0204&contractorName=OJH+SERVICES,+INC.&executeQuery=YES",
  ]);
  for (const absent of ["foundingDate", "potentialAction"]) expect(org).not.toHaveProperty(absent);

  expect(site).toEqual({
    "@type": "WebSite",
    "@id": "https://medicalsolutionsoftx.com/#website",
    url: "https://medicalsolutionsoftx.com/",
    name: "Medical Solutions of Texas",
    alternateName: "MSOT",
    publisher: { "@id": "https://medicalsolutionsoftx.com/#organization" },
  });
  expect(site).not.toHaveProperty("potentialAction");
});

test("the logo the markup names is a real PNG of at least 112px", async ({ request }) => {
  const [graph] = await blocks(request, "/");
  const logo: string = graph["@graph"][0].logo;
  const res = await request.get(logo.replace("https://medicalsolutionsoftx.com", ""));
  expect(res.status()).toBe(200);
  const png = await res.body();
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect(png.readUInt32BE(16)).toBeGreaterThanOrEqual(112);
  expect(png.readUInt32BE(20)).toBeGreaterThanOrEqual(112);
  // Colour type 2 (RGB, no alpha): it reads on a white background.
  expect(png[25]).toBe(2);
});

for (const path of PAGES.filter((p) => p !== "/")) {
  test(`${path}: no JSON-LD (Organization lives on Home only)`, async ({ request }) => {
    expect(await blocks(request, path)).toHaveLength(0);
  });
}
