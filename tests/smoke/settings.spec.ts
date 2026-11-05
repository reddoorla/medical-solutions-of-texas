import { test, expect } from "@playwright/test";
import { NotFoundError } from "@prismicio/client";
import { CODE_IDENTITY, loadIdentity, mergeIdentity, toE164 } from "../../src/lib/identity";
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
  );
  expect(identity.phone).toBe("833.307.4418");
  expect(identity.phoneE164).toBe("+18333074418");
  expect(identity.name).toBe("Medical Solutions of Texas");
  expect(identity.notFoundTitle).toBe("Page not found | MSOT");
});

test("any other Prismic error stops the build instead of shipping the code's values", async () => {
  await expect(
    loadIdentity(
      client(async () => {
        throw new Error("Prismic is down");
      }),
    ),
  ).rejects.toThrow("Prismic is down");
});

test("a filled field wins, field by field, and the E.164 phone follows the printed one", async () => {
  const identity = await loadIdentity(
    client(async () =>
      doc({ phone: "512.555.0100", uei: "  NEWUEI  ", contracts: [], same_as: [] }),
    ),
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
    doc({ name: "", tagline: "   ", phone: null, street: "", contracts: [], same_as: [] }),
  );
  expect(identity.name).toBe("Medical Solutions of Texas");
  expect(identity.tagline).toBe("Federal med-surg contracting for the VA and DoW");
  expect(identity.phone).toBe("833.307.4418");
  expect(identity.address.street).toBe("4903 Golden Quail, Suite 120");
});

test("contract rows merge by position; a new row needs both its label and number", () => {
  const identity = mergeIdentity(
    doc({
      contracts: [
        { label: "", value: "NEW-JIT" },
        { label: null, value: null },
        { label: "DAPA (Medical/Surgical)", value: "" },
        { label: "DAPA (Equipment)", value: "SP0200-11-H-0003" },
        { label: "New vehicle", value: "NEW-1" },
        { label: "Half a row", value: "" },
      ],
      same_as: [],
    }),
  );
  expect(identity.contracts).toEqual([
    { label: "DLA ECAT Contract (Just in Time)", value: "NEW-JIT" },
    { label: "DLA ECAT Contract (Direct Vendor Delivery)", value: "SPE2DE-25-D-A011" },
    { label: "DAPA (Medical/Surgical)", value: "SP0200-11-H-0018" },
    { label: "DAPA (Equipment)", value: "SP0200-11-H-0003" },
    { label: "New vehicle", value: "NEW-1" },
  ]);
});

test("sameAs: the document's filled URLs when it has any, else today's two", () => {
  expect(mergeIdentity(doc({ contracts: [], same_as: [{ url: "" }] })).sameAs).toEqual([
    "https://www.linkedin.com/company/medical-solutions-of-texas",
    "https://www.gsaelibrary.gsa.gov/ElibMain/home.do/contractorInfo.do?contractNumber=36F79725D0204&contractorName=OJH+SERVICES,+INC.&executeQuery=YES",
  ]);
  expect(
    mergeIdentity(
      doc({ contracts: [], same_as: [{ url: "https://example.com/msot" }, { url: "" }] }),
    ).sameAs,
  ).toEqual(["https://example.com/msot"]);
});

test("toE164 gives today's hard-coded form for today's phone", () => {
  expect(toE164(CODE_IDENTITY.phone)).toBe("+18333074418");
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

  expect(text(await get("/about"))).toContain("Fixture definition for About.");

  // "Phone:" is the Contact page's own line; the footer prints the bare number.
  expect(text(await get("/contact"))).toContain("Phone: 512.555.0100");

  // The vehicles table is the page's own; the footer carries no contracts.
  const caps = text(await get("/capabilities"));
  expect(caps).toContain("FIXTURE-ECAT-JIT");
  // dt/dd order: the footer reads "UEI … · CAGE", the page "UEI … CAGE".
  expect(caps).toContain("UEI FIXTUREUEI01 CAGE 6ZM08");

  await page
    .context()
    .addCookies([{ name: "msot-settings-fixture", value: "1", url: baseURL ?? "" }]);
  await page.goto("/no-such-page");
  await expect(page).toHaveTitle("Fixture not found | MSOT");
});
