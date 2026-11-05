// Where the words sit on Home's three "service member's life" timelines. The
// pictures used to draw their words as vector shapes; they are now a text-free
// back layer, the words as live text, and a front layer of the photos that sit
// over the step labels (the workspace's briefs/2026-11-05-msot-text-in-images/
// handoff.md, measured from Figma and calibrated to the live pictures). This
// file is layout, not copy: the words are the `home_page` document's
// ($lib/copy/home), and the step numerals are fixed.
//
// Units are the picture's own: 1440×650 on desktop, 359×650 on phones, scaled
// with the picture in HomeTimeline.svelte. x/y/w are the text box's left, top
// and width; a label is rotated 90° clockwise about its top-left corner.

const PRISMIC = "https://images.prismic.io/msot/";

/** Text-free layers in Prismic's media library, tagged `text-free` and `home-timeline`. */
const layer = (file: string) => `${PRISMIC}${file}?auto=format,compress`;

export type Box = { x: number; y: number; w: number };
export type Place = { desktop?: Box; phone?: Box };

/** The six steps' numerals, shared by all three timelines. */
export const STEP_NUMERALS = ["01", "02", "03", "04", "05", "06"] as const;

const PHONE_LABELS: Box[] = [
  { x: 59.5, y: 463.19, w: 187 },
  { x: 103.5, y: 463.19, w: 173 },
  { x: 147.5, y: 463.19, w: 214 },
  { x: 206.5, y: 463.19, w: 136.65 },
  { x: 250.5, y: 463.19, w: 175.5 },
  { x: 310.5, y: 463.19, w: 105.2 },
];

const DESKTOP_LABELS: Box[] = [
  { x: 237, y: 462.73, w: 187 },
  { x: 431, y: 462.73, w: 173 },
  { x: 629, y: 462.73, w: 214 },
  { x: 823.13, y: 462.73, w: 136.65 },
  { x: 1020.25, y: 462.73, w: 175.5 },
  { x: 1217, y: 462.73, w: 124.27 },
];

const PHONE_HEADING: Box = { x: 36.25, y: 73.62, w: 266 };
const PHONE_BODY: Box = { x: 36.25, y: 111.62, w: 266 };

export type TimelineLayout = {
  /** The step this picture tells: its heading's numeral, and the label it leaves out on desktop. */
  step: number;
  back: { desktop: string; phone: string };
  /** Timeline 2 has no front layer on phones: its phone version has no photo. */
  front: { desktop: string; phone: string | null };
  eyebrow?: Box;
  heading: Place;
  body: Place;
  /** Each step's label, desktop and phone; a missing side hides it there. */
  labels: Place[];
  /** Timeline 3's own last label on desktop, behind the veteran's photo. */
  hiddenLabel?: Box;
};

const labelsWithout = (step: number, last = DESKTOP_LABELS[5]): Place[] =>
  PHONE_LABELS.map((phone, i) => ({
    phone,
    desktop: i + 1 === step ? undefined : i === 5 ? last : DESKTOP_LABELS[i],
  }));

export const TIMELINES: TimelineLayout[] = [
  {
    step: 2,
    back: {
      desktop: layer("HYY7DQJO0gDNU4c5_msot-home-timeline1-back-textfree%402x.png"),
      phone: layer("59KKrU4Gt-uu5jrz_msot-home-timeline1_mobile-back-textfree%402x.png"),
    },
    front: {
      desktop: layer("UWoFXrGKyLIjFXTh_msot-home-timeline1-front-textfree%402x.png"),
      phone: layer("ibNv994GqcfJmfNo_msot-home-timeline1_mobile-front-textfree%402x.png"),
    },
    heading: { desktop: { x: 607, y: 105, w: 266 }, phone: PHONE_HEADING },
    body: { desktop: { x: 607, y: 139, w: 266 }, phone: PHONE_BODY },
    labels: labelsWithout(2),
  },
  {
    step: 3,
    back: {
      desktop: layer("N-noPMHFKZ9mL1Tf_msot-home-timeline2-back-textfree%402x.png"),
      phone: layer("xEftzWtREA_ye5L3_msot-home-timeline2_mobile-back-textfree%402x.png"),
    },
    front: {
      desktop: layer("IH_DUQVIJ-_cY63F_msot-home-timeline2-front-textfree%402x.png"),
      phone: null,
    },
    eyebrow: { x: 147, y: 34, w: 334.35 },
    heading: { desktop: { x: 814.72, y: 103.24, w: 266 }, phone: PHONE_HEADING },
    body: { desktop: { x: 814.72, y: 137.24, w: 266 }, phone: PHONE_BODY },
    labels: labelsWithout(3, { x: 1217, y: 463, w: 126.43 }),
  },
  {
    step: 6,
    back: {
      desktop: layer("iLxJ_WP9IqBMR73k_msot-home-timeline3-back-textfree%402x.png"),
      phone: layer("ETr2hjPS2lH-RCuq_msot-home-timeline3_mobile-back-textfree%402x.png"),
    },
    front: {
      desktop: layer("2nzn7SY9C9dtA8zU_msot-home-timeline3-front-textfree%402x.png"),
      phone: layer("VX9cQuUKcL4tEElb_msot-home-timeline3_mobile-front-textfree%402x.png"),
    },
    eyebrow: { x: 148, y: 36, w: 334.35 },
    heading: { desktop: { x: 838.09, y: 103.24, w: 266 }, phone: PHONE_HEADING },
    body: { desktop: { x: 838.09, y: 137.24, w: 266 }, phone: PHONE_BODY },
    // On desktop the sixth label is this picture's own words (hiddenLabel); on
    // phones all six show, as on the other two.
    labels: PHONE_LABELS.map((phone, i) => ({
      phone,
      desktop: i === 5 ? undefined : DESKTOP_LABELS[i],
    })),
    hiddenLabel: { x: 1217, y: 463, w: 136 },
  },
];
