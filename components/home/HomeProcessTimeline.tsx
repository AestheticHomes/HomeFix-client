// components/home/HomeProcessTimeline.tsx
"use client";

import { useState } from "react";
import {
  Factory,
  HardHat,
  KeyRound,
  PanelsTopLeft,
  Ruler,
  Shapes,
} from "lucide-react";

type StepIconName =
  | "tape"
  | "blueprint"
  | "render"
  | "factory"
  | "site"
  | "key";

type Step = {
  id: number;
  shortLabel: string;
  title: string;
  description: string;
  bullets: string[];
  iconName: StepIconName;
};

const STEPS: Step[] = [
  {
    id: 1,
    shortLabel: "Measurement",
    title: "On-site measurement",
    description:
      "Certified designer visits your home, measures every wall, niche, and existing service line.",
    bullets: [
      "Handled by certified designers",
      "No advance payment at this stage",
      "Digital notes fed directly into layout tools",
    ],
    iconName: "tape",
  },
  {
    id: 2,
    shortLabel: "Layout plan",
    title: "Initial layout plan",
    description:
      "We prepare furniture and service layouts mapped to your lifestyle and circulation.",
    bullets: ["Shared digitally for comments", "Optimised for light and ventilation"],
    iconName: "blueprint",
  },
  {
    id: 3,
    shortLabel: "3D & revisions",
    title: "3D renders & revisions",
    description:
      "Core rooms are visualised in 3D so you can see proportions, finishes, and lighting.",
    bullets: [
      "Multiple revision cycles baked into the process",
      "Realistic material and lighting previews",
    ],
    iconName: "render",
  },
  {
    id: 4,
    shortLabel: "Factory build",
    title: "Factory build & quality checks",
    description:
      "Cabinets, shutters, and components are cut and finished in a controlled factory setup.",
    bullets: [
      "Panel cuts on calibrated machinery",
      "Dedicated pre-dispatch quality checks",
    ],
    iconName: "factory",
  },
  {
    id: 5,
    shortLabel: "Site execution",
    title: "On-site execution",
    description:
      "Our project team installs, coordinates other trades, and keeps the site running to plan.",
    bullets: [
      "Sequenced schedule shared upfront",
      "Daily progress tracked against BOQ",
    ],
    iconName: "site",
  },
  {
    id: 6,
    shortLabel: "Handover",
    title: "Final handover",
    description:
      "We walk you through every detail, fix snags, and document warranties and care.",
    bullets: [
      "Formal snag list and closure",
      "Warranties and care notes documented",
    ],
    iconName: "key",
  },
];

export function HomeProcessTimeline() {
  const [activeId, setActiveId] = useState<number>(1);
  const activeStep = STEPS.find((step) => step.id === activeId) ?? STEPS[0];

  return (
    <section
      aria-label="How your HomeFix project moves from first measurement to final handover"
      className="relative overflow-hidden bg-background py-12 md:py-16"
    >
      <CosmicBackground />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <header className="mb-8 text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            Interior projects · Process
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50 md:text-3xl">
            How your HomeFix project moves from{" "}
            <span className="text-indigo-500 dark:text-indigo-300">first measurement</span> to{" "}
            <span className="text-indigo-500 dark:text-indigo-300">final handover</span>.
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-100 md:text-base">
            Each stage is measured, documented, and quality-checked so you know
            exactly where your project stands.
          </p>
        </header>

        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-slate-200/60 dark:bg-slate-700/60" />
          <div className="relative flex snap-x snap-mandatory overflow-x-auto pb-4 pt-2 md:justify-between md:overflow-visible">
            {STEPS.map((step) => {
              const isActive = step.id === activeId;
              return (
                <button
                  key={step.id}
                  type="button"
                  className="group relative mx-3 flex min-w-[120px] snap-center flex-col items-center gap-1 md:mx-0 md:min-w-0"
                  onClick={() => setActiveId(step.id)}
                  onMouseEnter={() => setActiveId(step.id)}
                  aria-pressed={isActive}
                >
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-slate-900 text-white shadow-md transition-all",
                      isActive
                        ? "border-indigo-400 shadow-[0_0_24px_rgba(129,140,248,0.6)]"
                        : "border-slate-700/70 opacity-80 group-hover:border-indigo-300",
                    ].join(" ")}
                  >
                    <StepIcon name={step.iconName} className="h-4 w-4" />
                  </div>
                  <span className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                    Step {step.id}
                  </span>
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-50">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mb-6 max-w-3xl">
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm md:p-6 dark:border-slate-700/80 dark:bg-slate-900/80">
            <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              STEP {activeStep.id} · {activeStep.shortLabel.toUpperCase()}
            </p>
            <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-50 md:text-lg">
              {activeStep.title}
            </h3>
            <p className="mb-3 text-xs text-slate-600 dark:text-slate-100 md:text-sm">
              {activeStep.description}
            </p>
            <ul className="space-y-1.5 md:space-y-2">
              {activeStep.bullets.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-100 md:text-sm"
                >
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
                  <span className="text-slate-800 dark:text-slate-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-3 text-xs md:grid-cols-3 md:text-sm">
          <Pill label="Free consultation and designer site visit" />
          <Pill label="Factory-built modules and transparent BOQ" />
          <Pill label="Single point of contact and formal handover" />
        </div>
      </div>
    </section>
  );
}

function StepIcon({
  name,
  className,
}: {
  name: StepIconName;
  className?: string;
}) {
  const shared = className ?? "h-4 w-4";

  switch (name) {
    case "tape":
      return <Ruler className={shared} />;
    case "blueprint":
      return <PanelsTopLeft className={shared} />;
    case "render":
      return <Shapes className={shared} />;
    case "factory":
      return <Factory className={shared} />;
    case "site":
      return <HardHat className={shared} />;
    case "key":
    default:
      return <KeyRound className={shared} />;
  }
}

function Pill({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-slate-800 shadow-sm backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100">
      <span className="h-2 w-2 rounded-full bg-sky-500 dark:bg-sky-400" />
      <span className="text-xs text-slate-800 dark:text-slate-100 md:text-sm">{label}</span>
    </div>
  );
}

function CosmicBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.22),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_60%)]"
    />
  );
}
