// A `settings` document for the smoke test of the identity's Prismic path
// (tests/smoke/settings.spec.ts), served only by `vite dev` to a request
// carrying the `msot-settings-fixture` cookie. The prerendered site never reads it: the root
// layout checks `dev` first, which is false in every build. Its values are
// obviously not MSOT's, so a page showing them can only have read the document.
import type { SettingsDocument } from "../../prismicio-types";

export const SETTINGS_FIXTURE = {
  data: {
    phone: "512.555.0100",
    uei: "FIXTUREUEI01",
    definition: "Fixture definition for Home.",
    definition_about: "Fixture definition for About.",
    works_with: "Fixture works-with for About.",
    not_found_title: "Fixture not found | MSOT",
    email: "fixture@example.com",
    ecat_jit: "FIXTURE-ECAT-JIT",
    more_contracts: [{ label: "Fixture Vehicle", value: "FIXTURE-NEW-1" }],
    same_as: [{ url: { link_type: "Web", url: "https://example.com/fixture-msot" } }],
    // One Footer-tab word, so a test sees the menu and footer read this document too.
    privacy_link: "Fixture privacy link",
  },
} as unknown as SettingsDocument;
