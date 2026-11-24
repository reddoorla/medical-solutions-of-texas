// Marketing's five new Process FAQ answers (Developer Brief Part 2, §14a), from
// "MSOT Process Page FAQ — Answers 1–5 (Final, Nov 23, 2026)", as the rows the
// process_page document's `faq` group holds, in Prismic's rich-text shape, with
// her bullet lists and her three bold lead-ins ("ECAT", "FSS", "A DAPA"). Two
// edits from the file, both formatting: the questions lose their "1." to "5."
// (the page numbers none), and "SAM.gov" in answer 4 is plain text, not the
// link Word made of it (Marketing, Nov 23: no SAM.gov links yet). Served only by
// `vite dev`, behind `msot-process-fixture=answers-2026-11-23`, after the two
// questions already on the page: tests/smoke/process-faq-answers.spec.ts checks
// the page shows these words, written out there a second time.
type Span = { type: "strong"; start: number; end: number };
type Block = { type: "paragraph" | "list-item"; text: string; spans: Span[] };
const p = (text: string): Block => ({ type: "paragraph", text, spans: [] });
/** A bullet; `bold` is the words her file sets in bold at its start. */
const li = (text: string, bold = ""): Block => {
  if (!text.startsWith(bold)) throw new Error(`fixture: "${text}" does not start "${bold}"`);
  return {
    type: "list-item",
    text,
    spans: bold ? [{ type: "strong", start: 0, end: bold.length }] : [],
  };
};

export const PROCESS_FAQ_2026_11_23: { question: string; answer: Block[] }[] = [
  {
    question: "What does MSOT do for medical manufacturers?",
    answer: [
      p(
        "Medical Solutions of Texas (MSOT), a Veteran-Owned Small Business (VOSB), helps medical and surgical manufacturers get their products on federal contract and into VA and Department of War (DoW) treatment facilities. MSOT already holds ECAT, FSS and DAPA contracts, so your products can be added to contracts that are in place rather than starting from scratch. MSOT reviews your products and picks the right path, prepares and submits the paperwork, then handles orders, invoicing and delivery.",
      ),
    ],
  },
  {
    question: "What's the difference between ECAT, FSS and DAPA?",
    answer: [
      p(
        "They're three different federal buying routes. ECAT and DAPA serve mainly DoW buyers through the Defense Logistics Agency (DLA), and FSS serves VA and other federal buyers.",
      ),
      li(
        "ECAT is DLA's Electronic Catalog, an online ordering system. It lets DoW and other federal buyers, including VA medical centers, browse approved suppliers' catalogs and order at negotiated discounts.",
        "ECAT",
      ),
      li(
        "FSS is the VA Federal Supply Schedule, run by the VA National Acquisition Center. MSOT's FSS contract is under Schedule 65 II A, Medical Equipment and Supplies.",
        "FSS",
      ),
      li(
        "A DAPA (Distribution and Pricing Agreement) is DLA's pricing agreement for products distributed through the DoW Medical/Surgical Prime Vendor program.",
        "A DAPA",
      ),
      p("MSOT picks the right path for your products: ECAT, FSS, DAPA or a mix."),
    ],
  },
  {
    question: "How long does it take to get on a federal contract with MSOT?",
    answer: [
      p(
        "Typically 45 working days or less, compared with an industry average of 120+ days. Once approved, products roll out to DoW bases and VA facilities in about 7 days.",
      ),
    ],
  },
  {
    question: "What does a manufacturer need before it can sell to the VA or DoW?",
    answer: [
      p(
        "You don't need a federal contract, SAM.gov registration, Unique Entity ID (UEI) or CAGE code of your own. MSOT's account team walks you through onboarding. You'll need:",
      ),
      li(
        "Products that comply with the Trade Agreements Act (TAA) for VA FSS, or the Buy American Act (BAA) for ECAT",
      ),
      li("FDA registration or clearance where your product requires it"),
      li("Product data: part numbers, descriptions, units of measure and packaging"),
      li(
        "Your commercial price list, plus your Most Favored Customer (MFC) and Most Similar Customer (MSC) pricing",
      ),
      p(
        "You enter your product details during onboarding, and MSOT verifies compliance once you submit them. MSOT's proven pricing narrative template makes the pricing step straightforward.",
      ),
    ],
  },
  {
    question: "Does MSOT sell directly to clinicians or the public?",
    answer: [
      p(
        "No. MSOT sells only to VA and DoW, through its ECAT, FSS and DAPA contracts. MSOT doesn't sell to the public or to individual patients.",
      ),
    ],
  },
];
