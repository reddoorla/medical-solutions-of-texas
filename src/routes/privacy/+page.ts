import { PRIVACY_POLICY_DRAFT } from "$lib/privacy/policy";
import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = () => ({
  title: "MSOT | Privacy Policy",
  meta_title: "Privacy Policy",
  noindex: PRIVACY_POLICY_DRAFT,
});
