import { test, expect } from "@playwright/test";
import { fixtureCookie } from "./empty";

// Marketing's five new Process FAQ answers (Developer Brief Part 2, §14a; the
// file "MSOT Process Page FAQ — Answers 1–5 (Final, Nov 23, 2026)"). They go
// into Prismic as she wrote them; $lib/fixtures/process-faq-2026-11-23 holds
// the same rows for `vite dev`. Her words are written out here a second time,
// so a changed word in either place fails, and the page must show each block
// as she set it (paragraph, bullet list, bold lead-in) inside its own
// question's <details>.

// Each block: a paragraph, or a bullet with the words her file sets in bold at
// its start.
type Block = ["p", string] | ["li", string, string?];
const ANSWERS: [question: string, blocks: Block[]][] = [
  [
    "What does MSOT do for medical manufacturers?",
    [
      [
        "p",
        "Medical Solutions of Texas (MSOT), a Veteran-Owned Small Business (VOSB), helps medical and surgical manufacturers get their products on federal contract and into VA and Department of War (DoW) treatment facilities. MSOT already holds ECAT, FSS and DAPA contracts, so your products can be added to contracts that are in place rather than starting from scratch. MSOT reviews your products and picks the right path, prepares and submits the paperwork, then handles orders, invoicing and delivery.",
      ],
    ],
  ],
  [
    "What's the difference between ECAT, FSS and DAPA?",
    [
      [
        "p",
        "They're three different federal buying routes. ECAT and DAPA serve mainly DoW buyers through the Defense Logistics Agency (DLA), and FSS serves VA and other federal buyers.",
      ],
      [
        "li",
        "ECAT is DLA's Electronic Catalog, an online ordering system. It lets DoW and other federal buyers, including VA medical centers, browse approved suppliers' catalogs and order at negotiated discounts.",
        "ECAT",
      ],
      [
        "li",
        "FSS is the VA Federal Supply Schedule, run by the VA National Acquisition Center. MSOT's FSS contract is under Schedule 65 II A, Medical Equipment and Supplies.",
        "FSS",
      ],
      [
        "li",
        "A DAPA (Distribution and Pricing Agreement) is DLA's pricing agreement for products distributed through the DoW Medical/Surgical Prime Vendor program.",
        "A DAPA",
      ],
      ["p", "MSOT picks the right path for your products: ECAT, FSS, DAPA or a mix."],
    ],
  ],
  [
    "How long does it take to get on a federal contract with MSOT?",
    [
      [
        "p",
        "Typically 45 working days or less, compared with an industry average of 120+ days. Once approved, products roll out to DoW bases and VA facilities in about 7 days.",
      ],
    ],
  ],
  [
    "What does a manufacturer need before it can sell to the VA or DoW?",
    [
      [
        "p",
        "You don't need a federal contract, SAM.gov registration, Unique Entity ID (UEI) or CAGE code of your own. MSOT's account team walks you through onboarding. You'll need:",
      ],
      [
        "li",
        "Products that comply with the Trade Agreements Act (TAA) for VA FSS, or the Buy American Act (BAA) for ECAT",
      ],
      ["li", "FDA registration or clearance where your product requires it"],
      ["li", "Product data: part numbers, descriptions, units of measure and packaging"],
      [
        "li",
        "Your commercial price list, plus your Most Favored Customer (MFC) and Most Similar Customer (MSC) pricing",
      ],
      [
        "p",
        "You enter your product details during onboarding, and MSOT verifies compliance once you submit them. MSOT's proven pricing narrative template makes the pricing step straightforward.",
      ],
    ],
  ],
  [
    "Does MSOT sell directly to clinicians or the public?",
    [
      [
        "p",
        "No. MSOT sells only to VA and DoW, through its ECAT, FSS and DAPA contracts. MSOT doesn't sell to the public or to individual patients.",
      ],
    ],
  ],
];

/** Her blocks as the page's HTML: paragraphs, one list per run of bullets, bold lead-ins. */
const html = (blocks: Block[]) =>
  blocks
    .map(([kind, text, bold], i) => {
      if (kind === "p") return `<p>${text}</p>`;
      const item = `<li>${bold ? `<strong>${bold}</strong>${text.slice(bold.length)}` : text}</li>`;
      const before = blocks[i - 1]?.[0] === "li" ? "" : "<ul>";
      const after = blocks[i + 1]?.[0] === "li" ? "" : "</ul>";
      return before + item + after;
    })
    .join("");

/** The rendered HTML with comments, entities and the space between tags undone. */
const squash = (s: string) =>
  decode(s.replace(/<!--[\s\S]*?-->/g, ""))
    .replace(/>\s+</g, "><")
    .trim();

const decode = (s: string) =>
  s
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

test("Process shows Marketing's five Nov 23 answers word for word, each in its question", async ({
  request,
}) => {
  const headers = fixtureCookie("process");
  headers.cookie = headers.cookie.replace(
    "msot-process-fixture=1",
    "msot-process-fixture=answers-2026-11-23",
  );
  const page = (await (await request.get("/process", { headers })).text())
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  // The FAQ's own <details> (the Accordian's), not the footer's "Company details".
  const items = [
    ...page.matchAll(/<details[^>]*class="accordian[^"]*"[^>]*>([\s\S]*?)<\/details>/g),
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
  for (const [i, [question, blocks]] of ANSWERS.entries()) {
    const rich = items[i + 2].match(/<div class="faq-rich[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    expect(rich, `${question}: a rich answer`).toBeTruthy();
    expect(squash(rich!), question).toBe(html(blocks));
  }
  // No SAM.gov link (Marketing, Nov 23: none until SAM.gov is corrected).
  expect(page).not.toMatch(/href="[^"]*sam\.gov/i);
});
