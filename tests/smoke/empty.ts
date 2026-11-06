// The cookie that makes `vite dev` serve each named page singleton, and always
// `settings`, as a published document with every field empty
// ($lib/empty-fixture). The "with every field empty" checks send it so that
// they pin the code's wording whatever is published in Prismic: before, they
// read live Prismic and assumed no document (#160 item 3, #165 item 2).
export const empty = (...pages: string[]) => ({
  cookie: ["settings", ...pages].map((p) => `msot-${p}-fixture=empty`).join("; "),
});
