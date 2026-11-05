// Two team_member documents for the smoke test of the About page's Prismic
// path (tests/smoke/team.spec.ts), served only by `vite dev` at
// /about?team-fixture. The prerendered site never reads it: the load function
// checks `dev` first, which is false in every build.
import type { TeamMemberDocument } from "../../prismicio-types";

export const TEAM_FIXTURE = [
  {
    data: {
      name: "Jon Hood",
      job_title: "CEO",
      headshot: {},
      bio: [{ type: "paragraph", text: "Fixture bio for Jon Hood.", spans: [] }],
      linkedin: { link_type: "Web", url: "https://www.linkedin.com/in/fixture-jon-hood" },
      order: null,
    },
  },
  {
    data: {
      name: "Fixture New Hire",
      job_title: "Government Accounts Coordinator",
      headshot: {},
      bio: [],
      linkedin: { link_type: "Any" },
      order: 6,
    },
  },
] as unknown as TeamMemberDocument[];
