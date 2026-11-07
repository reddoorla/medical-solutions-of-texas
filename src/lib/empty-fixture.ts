// The empty document of a custom type ($lib/empty-document), served by
// `vite dev` alone to a request whose fixture cookie reads "empty"
// (`msot-<page>-fixture=empty`, `msot-settings-fixture=empty`). Every server load
// checks `dev` first, which is false in every build, so the prerendered site
// never reads it. Vite-only (import.meta.glob); the specs use $lib/empty-document.
import { emptyDocument, type Model } from "$lib/empty-document";

const MODELS = import.meta.glob<Model>("/customtypes/*/index.json", {
  eager: true,
  import: "default",
});

export function emptyFixture<T>(type: string): T {
  const model = MODELS[`/customtypes/${type}/index.json`];
  if (!model) throw new Error(`empty fixture: no model customtypes/${type}`);
  return emptyDocument(model) as T;
}
