// A document of a custom type with every field empty, as Prismic's API sends a
// published document whose fields nobody filled: Text, Select, Number and Date
// are null, rich text, groups and slice zones are [], an image is {}, a link
// is { link_type: "Any" }. Built from the model's JSON (customtypes/<id>/index.json),
// so a field added to the model is in it too.
//
// The smoke tests' "with no document" checks read this, through
// $lib/empty-fixture, rather than live Prismic: they pinned the code's wording
// on the assumption that no document was published, which stops holding once
// Marketing publishes (reddoorla/medical-solutions-of-texas#160 item 3, #165
// item 2). Pure, so the specs can call it outside Vite.
type Field = { type: string; config?: { fields?: Record<string, Field> } };
export type Model = { id: string; json: Record<string, Record<string, Field>> };

function empty(field: Field): unknown {
  switch (field.type) {
    case "StructuredText":
    case "Group":
    case "Slices":
      return [];
    case "Image":
      return {};
    case "Link":
      return { link_type: "Any" };
    default:
      return null;
  }
}

/** Every field of the model, by API id, empty. The UID is not a data field. */
export function emptyDocument(model: Model): { type: string; data: Record<string, unknown> } {
  const data: Record<string, unknown> = {};
  for (const tab of Object.values(model.json))
    for (const [id, field] of Object.entries(tab))
      if (field.type !== "UID") data[id] = empty(field);
  return { type: model.id, data };
}
