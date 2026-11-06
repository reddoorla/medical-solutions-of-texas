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
// The same, with each group as one row of empty fields: Prismic's other shape
// for a group nobody filled.
const withRows = (id: string) => {
  const m = model(id);
  const d = emptyDocument(m);
  for (const tab of Object.values(m.json))
    for (const [k, f] of Object.entries(tab))
      if (f.type === "Group")
        d.data[k] = [emptyDocument({ id: k, json: { row: f.config?.fields ?? {} } }).data];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return d as any;
};

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

test("a group sent as one row of empty fields reads as today's too", () => {
  const logo = (file: string) => `/code/${file}`;
  expect(aboutCopy(withRows("about_page"))).toEqual(aboutCopy(null));
  expect(capabilitiesCopy(withRows("capabilities_page"))).toEqual(capabilitiesCopy(null));
  expect(contactCopy(withRows("contact_page"))).toEqual(contactCopy(null));
  expect(homeCopy(withRows("home_page"))).toEqual(homeCopy(null));
  expect(partnersCopy(withRows("partners_page"), logo)).toEqual(partnersCopy(null, logo));
  expect(privacyCopy(withRows("privacy_page"))).toEqual(privacyCopy(null));
  expect(processCopy(withRows("process_page"))).toEqual(processCopy(null));
  expect(resourcesCopy(withRows("resources_page"), "FSS-1")).toEqual(resourcesCopy(null, "FSS-1"));
  expect(chromeCopy(withRows("settings"))).toEqual(chromeCopy(null));
  expect(mergeIdentity(withRows("settings"))).toEqual(mergeIdentity(null));
});
