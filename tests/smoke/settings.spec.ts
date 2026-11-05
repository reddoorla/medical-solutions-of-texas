import { test, expect } from "@playwright/test";
import { NotFoundError, RepositoryNotFoundError } from "@prismicio/client";
import {
  CODE_IDENTITY,
  contactDescription,
  loadIdentity,
  mergeIdentity,
  toE164,
} from "../../src/lib/identity";
import { PAGE_SEO, pageDescription } from "../../src/lib/seo";
import type { SettingsDocument } from "../../prismicio-types";

// MSOT's identity (§12a) moves into Prismic's `settings` singleton (the
// operator, 11-05: "all content should be in prismic, not in code"). Every
// field falls back to today's wording when the document leaves it empty, and
// a missing document changes nothing. The expected code values are written out
// here, not read from src/lib/identity.ts, so a wrong value there fails.

const doc = (data: Record<string, unknown>) => ({ data }) as unknown as SettingsDocument;
const client = (getSingle: () => Promise<unknown>) =>
  ({ getSingle }) as unknown as Parameters<typeof loadIdentity>[0];

test("no settings document: the API's NotFoundError leaves today's wording", async () => {
  const identity = await loadIdentity(
    client(async () => {
      throw new NotFoundError("No documents were returned", "", undefined);
    }),
    { strict: true },
  );
  expect(identity.phone).toBe("833.307.4418");
  expect(identity.phoneE164).toBe("+18333074418");
  expect(identity.name).toBe("Medical Solutions of Texas");
  expect(identity.notFoundTitle).toBe("Page not found | MSOT");
});

test("while building, any other error stops the build instead of shipping the code's values", async () => {
  const down = client(async () => {
    throw new Error("Prismic is down");
  });
  await expect(loadIdentity(down, { strict: true })).rejects.toThrow("Prismic is down");
  // A wrong repository name is a NotFoundError too, and must not pass as "no document".
  const wrongRepo = client(async () => {
    throw new RepositoryNotFoundError("Repository not found", "", undefined);
  });
  await expect(loadIdentity(wrongRepo, { strict: true })).rejects.toThrow("Repository not found");
});

test("at request time an error (an expired preview cookie, an outage) falls back to today's wording", async () => {
  const expired = client(async () => {
    throw new Error("This preview token has expired");
  });
  const identity = await loadIdentity(expired, { strict: false });
  expect(identity.phone).toBe("833.307.4418");
  expect(identity.name).toBe("Medical Solutions of Texas");
});

test("a filled field wins, field by field, and the E.164 phone follows the printed one", async () => {
  const identity = await loadIdentity(
    client(async () => doc({ phone: "512.555.0100", uei: "  NEWUEI  ", same_as: [] })),
    { strict: true },
  );
  expect(identity.phone).toBe("512.555.0100");
  expect(identity.phoneE164).toBe("+15125550100");
  expect(identity.uei).toBe("NEWUEI");
  // Untouched fields keep today's wording.
  expect(identity.cage).toBe("6ZM08");
  expect(identity.email).toBe("info@MedicalSolutionsofTX.com");
  expect(identity.address.street).toBe("4903 Golden Quail, Suite 120");
});

test("an empty or blank field falls back to today's wording", () => {
  const identity = mergeIdentity(
    doc({ name: "", tagline: "   ", phone: null, street: "", same_as: [] }),
  );
  expect(identity.name).toBe("Medical Solutions of Texas");
  expect(identity.tagline).toBe("Federal med-surg contracting for the VA and DoW");
  expect(identity.phone).toBe("833.307.4418");
  expect(identity.address.street).toBe("4903 Golden Quail, Suite 120");
});

test("today's four vehicles keep their names and take their own number fields; an added one needs both", () => {
  const identity = mergeIdentity(
    doc({
      ecat_jit: "NEW-JIT",
      ecat_dvd: null,
      dapa_med: "  ",
      dapa_equip: "NEW-EQUIP",
      more_contracts: [
        { label: "New vehicle", value: "NEW-1" },
        { label: "Half a row", value: "" },
        { label: null, value: "NO-NAME" },
      ],
      same_as: [],
    }),
  );
  expect(identity.contracts).toEqual([
    { label: "DLA ECAT Contract (Just in Time)", value: "NEW-JIT" },
    { label: "DLA ECAT Contract (Direct Vendor Delivery)", value: "SPE2DE-25-D-A011" },
    { label: "DAPA (Medical/Surgical)", value: "SP0200-11-H-0018" },
    { label: "DAPA (Equipment)", value: "NEW-EQUIP" },
    { label: "New vehicle", value: "NEW-1" },
  ]);
});

test("sameAs: the document's filled URLs when it has any, else today's two", () => {
  expect(mergeIdentity(doc({ same_as: [{ url: { link_type: "Any" } }] })).sameAs).toEqual([
    "https://www.linkedin.com/company/medical-solutions-of-texas",
    "https://www.gsaelibrary.gsa.gov/ElibMain/home.do/contractorInfo.do?contractNumber=36F79725D0204&contractorName=OJH+SERVICES,+INC.&executeQuery=YES",
  ]);
  expect(
    mergeIdentity(
      doc({
        same_as: [
          { url: { link_type: "Web", url: "https://example.com/msot" } },
          { url: { link_type: "Any" } },
        ],
      }),
    ).sameAs,
  ).toEqual(["https://example.com/msot"]);
});

test("toE164 gives today's hard-coded form for today's phone, and drops an extension", () => {
  expect(toE164(CODE_IDENTITY.phone)).toBe("+18333074418");
  expect(toE164("833.307.4418 ext. 2")).toBe("+18333074418");
  expect(toE164("833-307-4418 x12")).toBe("+18333074418");
  expect(toE164("1 (833) 307-4418")).toBe("+18333074418");
  for (const odd of [
    "833.307.4418 extension 2",
    "833.307.4418 Ext: 2",
    "833.307.4418 (ext. 2)",
    "833.307.4418 ext 2.",
    "833.307.4418, press 2",
    "833.307.4418 / 210.744.9686",
    "+1 833 307 4418",
  ]) {
    expect(toE164(odd), odd).toBe("+18333074418");
  }
});

// The contact page's Prismic `meta_description` (published 11-05) wins over
// this; it is the fallback when that field is emptied.
test("/contact's fallback description is Marketing's wording, built from the identity", () => {
  expect(contactDescription(CODE_IDENTITY)).toBe(
    "Contact MSOT at 4903 Golden Quail, Suite 120, San Antonio, TX 78240, or call 833.307.4418.",
  );
  const moved = mergeIdentity(doc({ phone: "512.555.0100", same_as: [] }));
  expect(pageDescription("/contact", moved)).toBe(
    "Contact MSOT at 4903 Golden Quail, Suite 120, San Antonio, TX 78240, or call 512.555.0100.",
  );
  expect(pageDescription("/about", moved)).toBe(PAGE_SEO["/about"].description);
});

// `vite dev` serves a fixture document to a request carrying the
// `msot-settings-fixture` cookie (src/lib/settings-fixture.ts). Each page must
// show its values, which proves the page reads the merged identity rather than
// the code's. The page text is read with every <script> stripped: SvelteKit
// serializes the layout's data into one, so raw HTML would hold the fixture's
// values even on a page that never shows them.
const text = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
const jsonLd = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .join("");

test("the pages read the document: footer, Home, JSON-LD, About, Contact, /capabilities, 404", async ({
  page,
  request,
  baseURL,
}) => {
  const headers = { cookie: "msot-settings-fixture=1" };
  const get = async (path: string) => (await request.get(path, { headers })).text();

  const home = await get("/");
  expect(home).toContain('href="tel:+15125550100"');
  expect(text(home)).toContain("512.555.0100");
  expect(text(home)).toContain("UEI FIXTUREUEI01");
  expect(text(home)).toContain("Fixture definition for Home.");
  const ld = jsonLd(home);
  expect(ld).toContain('"telephone":"+1-512-555-0100"');
  expect(ld).toContain('"description":"Fixture definition for Home."');
  expect(ld).toContain('"value":"FIXTURE-ECAT-JIT"');

  const about = text(await get("/about"));
  expect(about).toContain("Fixture definition for About.");
  expect(about).toContain("Fixture works-with for About.");
  expect(ld).toContain('"sameAs":["https://example.com/fixture-msot"]');

  // "Phone:" is the Contact page's own line; the footer prints the bare number.
  expect(text(await get("/contact"))).toContain("Phone: 512.555.0100");
  expect(text(await get("/resources"))).toContain("Phone: 512.555.0100");

  // The vehicles table is the page's own; the footer carries no contracts.
  const caps = text(await get("/capabilities"));
  expect(caps).toContain("FIXTURE-ECAT-JIT");
  // dt/dd order: the footer reads "UEI … · CAGE", the page "UEI … CAGE".
  expect(caps).toContain("UEI FIXTUREUEI01 CAGE 6ZM08");
  expect(caps).toContain("Fixture Vehicle FIXTURE-NEW-1");

  // The privacy policy's contact address is the document's email too.
  const privacy = await get("/privacy");
  expect(privacy).toContain('href="mailto:fixture@example.com"');
  expect(privacy).not.toContain("mailto:info@MedicalSolutionsofTX.com");

  // No page mixes the document's phone with today's. The <meta> tags are left
  // out, and so is SvelteKit's serialized page data, which carries the same
  // field: /contact's description is its Prismic page document's own field
  // (published 11-05), which wins over code, and states the phone; the
  // settings model's phone and street labels say to edit it too.
  for (const path of ["/", "/about", "/contact", "/resources", "/capabilities", "/privacy"]) {
    const html = (await get(path))
      .replace(/<meta\b[^>]*>/g, "")
      .replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>/gi, "");
    expect(html, path).not.toContain("833.307.4418");
    expect(html, path).not.toContain("+18333074418");
    expect(html, path).not.toContain("833-307-4418");
  }

  await page
    .context()
    .addCookies([{ name: "msot-settings-fixture", value: "1", url: baseURL ?? "" }]);
  await page.goto("/no-such-page");
  await expect(page).toHaveTitle("Fixture not found | MSOT");
});
