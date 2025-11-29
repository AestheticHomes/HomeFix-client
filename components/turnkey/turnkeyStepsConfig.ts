// components/turnkey/turnkeyStepsConfig.ts
// Turnkey process configuration.
// All step copy and structure lives here so future admin tooling
// or AI agents can manage it without touching the UI components.

export type TurnkeyStepId =
  | "measurement"
  | "layout"
  | "renders"
  | "factory"
  | "execution"
  | "handover";

export type TurnkeyIconName =
  | "tape"
  | "blueprint"
  | "render"
  | "factory"
  | "site"
  | "key";

export interface TurnkeyStep {
  id: TurnkeyStepId;
  order: number;
  title: string;
  shortLabel: string;
  description: string;
  reassurance: string[];
  iconName: TurnkeyIconName;
}

export const TURNKEY_STEPS: TurnkeyStep[] = [
  {
    id: "measurement",
    order: 1,
    title: "On-site measurement",
    shortLabel: "Measurement",
    description:
      "Certified designer visits your home, measures every wall, niche, and existing service line.",
    reassurance: [
      "Handled by certified designers",
      "No advance payment at this stage",
      "Digital notes fed directly into layout tools",
    ],
    iconName: "tape",
  },
  {
    id: "layout",
    order: 2,
    title: "Initial layout plan",
    shortLabel: "Layout plan",
    description:
      "We prepare furniture and service layouts mapped to your lifestyle and circulation.",
    reassurance: [
      "Shared digitally for comments",
      "Optimised for light and ventilation",
    ],
    iconName: "blueprint",
  },
  {
    id: "renders",
    order: 3,
    title: "3D renders & revisions",
    shortLabel: "3D & revisions",
    description:
      "Core rooms are visualised in 3D so you can see proportions, finishes, and lighting.",
    reassurance: [
      "Multiple revision cycles baked into the process",
      "Realistic material and lighting previews",
    ],
    iconName: "render",
  },
  {
    id: "factory",
    order: 4,
    title: "Factory build & quality checks",
    shortLabel: "Factory build",
    description:
      "Cabinets, shutters, and components are cut and finished in a controlled factory setup.",
    reassurance: [
      "Panel cuts on calibrated machinery",
      "Dedicated pre-dispatch quality checks",
    ],
    iconName: "factory",
  },
  {
    id: "execution",
    order: 5,
    title: "On-site execution",
    shortLabel: "Site execution",
    description:
      "Our project team installs, coordinates other trades, and keeps the site running to plan.",
    reassurance: [
      "Sequenced schedule shared upfront",
      "Daily progress tracked against BOQ",
    ],
    iconName: "site",
  },
  {
    id: "handover",
    order: 6,
    title: "Final handover",
    shortLabel: "Handover",
    description:
      "We walk you through every detail, fix snags, and document warranties and care.",
    reassurance: [
      "Formal snag list and closure",
      "Warranties and care notes documented",
    ],
    iconName: "key",
  },
];
