// components/home/HomeProcessSection.tsx
"use client";

import { useState } from "react";

type Step = {
  id: number;
  label: string;
  title: string;
  description: string;
  bullets: string[];
};

const STEPS: Step[] = [
  {
    id: 1,
    label: "STEP 1 · MEASUREMENT",
    title: "On-site measurement",
    description:
      "A HomeFix designer documents every room, niche, and existing service line so the plan starts with reality.",
    bullets: [
      "Certified designers on every visit",
      "No advance payment at this stage",
    ],
  },
  {
    id: 2,
    label: "STEP 2 · LAYOUT PLAN",
    title: "Initial layout plan",
    description:
      "Furniture and service layouts mapped to how you live, with circulation and storage tuned to your home.",
    bullets: ["Shared digitally for comments", "Optimised for light and ventilation"],
  },
  {
    id: 3,
    label: "STEP 3 · 3D & REVISIONS",
    title: "3D renders & revisions",
    description:
      "Key rooms are visualised in 3D so proportions, finishes, and lighting are easy to sign off.",
    bullets: [
      "Multiple revision cycles baked in",
      "Realistic material and lighting previews",
    ],
  },
  {
    id: 4,
    label: "STEP 4 · FACTORY BUILD",
    title: "Factory build & quality checks",
    description:
      "Cabinets, shutters, and components are precision-cut and finished in a controlled factory setup.",
    bullets: [
      "Panel cuts on calibrated machinery",
      "Dedicated pre-dispatch quality checks",
    ],
  },
  {
    id: 5,
    label: "STEP 5 · SITE EXECUTION",
    title: "On-site execution",
    description:
      "Project team installs, coordinates other trades, and keeps the site running to plan with transparent updates.",
    bullets: [
      "Sequenced schedule shared upfront",
      "Daily progress tracked against BOQ",
    ],
  },
  {
    id: 6,
    label: "STEP 6 · HANDOVER",
    title: "Final handover",
    description:
      "We walk you through every detail, fix snags, and document warranties and care for every module.",
    bullets: ["Formal snag list and closure", "Warranties and care notes documented"],
  },
];

export function HomeProcessSection() {
  const [activeId, setActiveId] = useState<number>(1);
  const activeStep = STEPS.find((s) => s.id === activeId) ?? STEPS[0];

  return (
    <section
      aria-label="How your HomeFix project moves from first measurement to final handover"
      className="relative overflow-hidden bg-background py-12 md:py-16"
    >
      {/* subtle cosmic backdrop – kept light so content stays readable */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.22),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_60%)]" />

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
            Each stage is documented, quality-checked, and coordinated so you always
            know where your interior project stands.
          </p>
        </header>

        {/* TIMELINE ICON ROW – scrollable on mobile, hover/click on desktop */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-slate-200/60 dark:bg-slate-700/60" />

          <div className="relative flex snap-x snap-mandatory overflow-x-auto pb-4 pt-2 md:justify-between md:overflow-visible">
            {STEPS.map((step) => {
              const isActive = step.id === activeId;
              return (
                <button
                  key={step.id}
                  type="button"
                  className="group relative mx-3 flex min-w-[120px] snap-center flex-col items-center gap-1 md:min-w-0"
                  onClick={() => setActiveId(step.id)}
                  onMouseEnter={() => setActiveId(step.id)}
                >
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-slate-900 text-white shadow-md transition-all",
                      isActive
                        ? "border-indigo-400 shadow-[0_0_24px_rgba(129,140,248,0.6)]"
                        : "border-slate-700/70 opacity-80 group-hover:border-indigo-300",
                    ].join(" ")}
                  >
                    <span className="text-xs font-semibold">{step.id}</span>
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

        {/* ACTIVE STEP DETAIL CARD */}
        <div className="mx-auto mb-6 max-w-3xl">
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm md:p-6 dark:border-slate-700/80 dark:bg-slate-900/80">
            <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              {activeStep.label}
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

        {/* REASSURANCE PILLS */}
        <div className="grid gap-3 text-xs md:text-sm md:grid-cols-3">
          <Pill label="Free consultation and designer site visit" />
          <Pill label="Factory-built modules and transparent BOQ" />
          <Pill label="Single point of contact and formal handover" />
        </div>
      </div>
    </section>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-slate-800 shadow-sm backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100">
      <span className="h-2 w-2 rounded-full bg-sky-500 dark:bg-sky-400" />
      <span className="text-xs text-slate-800 dark:text-slate-100 md:text-sm">{label}</span>
    </div>
  );
}
