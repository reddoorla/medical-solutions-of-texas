import { test, expect } from "@playwright/test";
import { fixtureCookie } from "./empty";
import { paragraphs } from "../../src/lib/content";

// Marketing's five new Process FAQ answers (Developer Brief Part 2, §14a; the
// file "MSOT Process Page FAQ — Answers 1–5 (Final, Nov 23, 2026)"). They go
// into Prismic as she wrote them; $lib/fixtures/process-faq-2026-11-23 holds
// the same rows for `vite dev`. Her words are written out here a second time,
// so a changed word in either place fails, and the page must show each line,
// with its bullet where her file has one, inside its own question's <details>.

const ANSWERS: [question: string, lines: string[]][] = [
  [
    "What does MSOT do for medical manufacturers?",
    [
      "Medical Solutions of Texas (MSOT), a Veteran-Owned Small Business (VOSB), helps medical and surgical manufacturers get their products on federal contract and into VA and Department of War (DoW) treatment facilities. MSOT already holds ECAT, FSS and DAPA contracts, so your products can be added to contracts that are in place rather than starting from scratch. MSOT reviews your products and picks the right path, prepares and submits the paperwork, then handles orders, invoicing and delivery.",
    ],
  ],
  [
    "What's the difference between ECAT, FSS and DAPA?",
    [
      "They're three different federal buying routes. ECAT and DAPA serve mainly DoW buyers through the Defense Logistics Agency (DLA), and FSS serves VA and other federal buyers.",
      "• ECAT is DLA's Electronic Catalog, an online ordering system. It lets DoW and other federal buyers, including VA medical centers, browse approved suppliers' catalogs and order at negotiated discounts.",
      "• FSS is the VA Federal Supply Schedule, run by the VA National Acquisition Center. MSOT's FSS contract is under Schedule 65 II A, Medical Equipment and Supplies.",
      "• A DAPA (Distribution and Pricing Agreement) is DLA's pricing agreement for products distributed through the DoW Medical/Surgical Prime Vendor program.",
      "MSOT picks the right path for your products: ECAT, FSS, DAPA or a mix.",
    ],
  ],
  [
    "How long does it take to get on a federal contract with MSOT?",
    [
      "Typically 45 working days or less, compared with an industry average of 120+ days. Once approved, products roll out to DoW bases and VA facilities in about 7 days.",
    ],
  ],
  [
    "What does a manufacturer need before it can sell to the VA or DoW?",
    [
      "You don't need a federal contract, SAM.gov registration, Unique Entity ID (UEI) or CAGE code of your own. MSOT's account team walks you through onboarding. You'll need:",
      "• Products that comply with the Trade Agreements Act (TAA) for VA FSS, or the Buy American Act (BAA) for ECAT",
      "• FDA registration or clearance where your product requires it",
      "• Product data: part numbers, descriptions, units of measure and packaging",
      "• Your commercial price list, plus your Most Favored Customer (MFC) and Most Similar Customer (MSC) pricing",
      "You enter your product details during onboarding, and MSOT verifies compliance once you submit them. MSOT's proven pricing narrative template makes the pricing step straightforward.",
    ],
  ],
  [
    "Does MSOT sell directly to clinicians or the public?",
    [
      "No. MSOT sells only to VA and DoW, through its ECAT, FSS and DAPA contracts. MSOT doesn't sell to the public or to individual patients.",
    ],
  ],
];

const decode = (s: string) =>
  s
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

test("paragraphs: a bullet-list item is its own line, led by a bullet", () => {
  const field = [
    { type: "paragraph", text: "Lead.", spans: [] },
    { type: "list-item", text: "One", spans: [] },
    { type: "list-item", text: "Two", spans: [] },
    { type: "paragraph", text: "After.", spans: [] },
  ] as never;
  expect(paragraphs(field, "fallback")).toBe("Lead.\n• One\n• Two\nAfter.");
});

test("Process shows Marketing's five Nov 23 answers word for word, each in its question", async ({
  request,
}) => {
  const headers = fixtureCookie("process");
  headers.cookie = headers.cookie.replace(
    "msot-process-fixture=1",
    "msot-process-fixture=answers-2026-11-23",
  );
  const html = decode(
    (await (await request.get("/process", { headers })).text())
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, ""),
  );
  // The FAQ's own <details> (the Accordian's), not the footer's "Company details".
  const items = [
    ...html.matchAll(/<details[^>]*class="accordian[^"]*"[^>]*>([\s\S]*?)<\/details>/g),
  ].map((m) => m[1]);
  // Today's two questions, then her five, in her order.
  const questions = items.map((d) =>
    (d.match(/<h4[^>]*>([\s\S]*?)<\/h4>/)?.[1] ?? "").replace(/\s+/g, " ").trim(),
  );
  expect(questions).toEqual([
    "Why does VOSB status give priority for winning VA and DoW contracts?",
    "What does our typical timeline look like after winning a contract?",
    ...ANSWERS.map(([q]) => q),
  ]);
  for (const [i, [question, lines]] of ANSWERS.entries()) {
    const answer = items[i + 2].match(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/)?.[1].trim();
    expect(answer, question).toBe(lines.join("\n"));
  }
  // No SAM.gov link (Marketing, Nov 23: none until SAM.gov is corrected).
  expect(html).not.toMatch(/href="[^"]*sam\.gov/i);
});
