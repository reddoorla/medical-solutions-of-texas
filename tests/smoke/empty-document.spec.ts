import { readFileSync, readdirSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { emptyDocument, type Model } from "../../src/lib/empty-document";
import { aboutCopy } from "../../src/lib/copy/about";
import { capabilitiesCopy } from "../../src/lib/copy/capabilities";
import { chromeCopy } from "../../src/lib/copy/chrome";
import { contactCopy } from "../../src/lib/copy/contact";
import { homeCopy } from "../../src/lib/copy/home";
import { partnersCopy } from "../../src/lib/copy/partners";
import { privacyCopy } from "../../src/lib/copy/privacy";
import { processCopy } from "../../src/lib/copy/process";
import { resourcesCopy } from "../../src/lib/copy/resources";
import { mergeIdentity } from "../../src/lib/identity";

const model = (id: string): Model =>
  JSON.parse(readFileSync(`customtypes/${id}/index.json`, "utf8")) as Model;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const doc = (id: string) => emptyDocument(model(id)) as any;

test("every field of every model is in its empty document, in Prismic's empty shape", () => {
  const shape: Record<string, unknown> = {
    StructuredText: [],
    Group: [],
    Slices: [],
    Image: {},
    Link: { link_type: "Any" },
  };
  for (const id of readdirSync("customtypes")) {
    const m = model(id);
    const { data } = emptyDocument(m);
    const fields = Object.values(m.json).flatMap((tab) =>
      Object.entries(tab).filter(([, f]) => f.type !== "UID"),
    );
    expect(Object.keys(data).sort(), id).toEqual(fields.map(([k]) => k).sort());
    for (const [k, f] of fields) expect(data[k], `${id}.${k}`).toEqual(shape[f.type] ?? null);
  }
});

test("each page's copy from its empty document is today's, the same as no document", () => {
  const logo = (file: string) => `/code/${file}`;
  expect(aboutCopy(doc("about_page"))).toEqual(aboutCopy(null));
  expect(capabilitiesCopy(doc("capabilities_page"))).toEqual(capabilitiesCopy(null));
  expect(contactCopy(doc("contact_page"))).toEqual(contactCopy(null));
  expect(homeCopy(doc("home_page"))).toEqual(homeCopy(null));
  expect(partnersCopy(doc("partners_page"), logo)).toEqual(partnersCopy(null, logo));
  expect(privacyCopy(doc("privacy_page"))).toEqual(privacyCopy(null));
  expect(processCopy(doc("process_page"))).toEqual(processCopy(null));
  expect(resourcesCopy(doc("resources_page"), "FSS-1")).toEqual(resourcesCopy(null, "FSS-1"));
  expect(chromeCopy(doc("settings"))).toEqual(chromeCopy(null));
  expect(mergeIdentity(doc("settings"))).toEqual(mergeIdentity(null));
});
