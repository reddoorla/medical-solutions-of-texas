// Prismic's Route Resolver: the address of each document type that has a page
// of its own, so Prismic's Preview button and a rich-text link to a document
// land on its page. Without a route a type resolves to "/", and Marketing
// previewing an About draft would see Home. /api/preview prefixes the address
// with "/preview", the server-rendered copy of each page under
// src/routes/[[preview=preview]]/.
//
// A page singleton's route is fixed: one document, one address. `settings`,
// `team_member` and `form_replies` have none, as no page is theirs alone.
// Prismic accepts a route for a type it does not know yet (checked 11-05
// against msot's API), so these can ship before the models reach Prismic.
// Kept apart from $lib/prismicio, which needs Vite, so
// tests/smoke/preview-routes.spec.ts can read it.
//
// {@link https://prismic.io/docs/route-resolver#route-resolver}

import { PRIVACY_PATH } from "./privacy/policy";

/** @type {import("@prismicio/client").Route[]} */
export const PRISMIC_ROUTES = [
  {
    type: "page",
    uid: "home",
    path: "/",
  },
  {
    type: "page",
    path: "/:uid",
  },
  { type: "home_page", path: "/" },
  { type: "about_page", path: "/about" },
  { type: "process_page", path: "/process" },
  { type: "partners_page", path: "/partners" },
  { type: "resources_page", path: "/resources" },
  { type: "contact_page", path: "/contact" },
  { type: "capabilities_page", path: "/capabilities" },
  { type: "privacy_page", path: PRIVACY_PATH },
];
