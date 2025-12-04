/**
 * HomeFix — HomeProcessTimeline
 *
 * Purpose:
 *   - Visualise the 6-step HomeFix project process as a horizontal timeline.
 *   - Show a single expanded detail card for the active step.
 * Interaction:
 *   - Hover/click on steps to change the active step.
 *   - Auto-progresses based on scroll position through the section.
 * Notes:
 *   - Maintains strong contrast in both light/dark themes.
 *   - Uses framer-motion for smooth transform/opacity animations.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollThrottle = useRef<number | null>(null);

  const activeStep = useMemo(
    () => STEPS.find((step) => step.id === activeId) ?? STEPS[0],
    [activeId]
  );

  const handleSetActive = useCallback((id: number, viaUser = false) => {
    setActiveId(id);
    if (viaUser) setUserInteracted(true);
  }, []);

  // Scroll-driven auto-progress
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      if (userInteracted) return;
      if (scrollThrottle.current) return;
      scrollThrottle.current = window.setTimeout(() => {
        scrollThrottle.current = null;
        const rect = el.getBoundingClientRect();
        if (rect.height <= 0) return;
        const viewHeight =
          window.innerHeight || document.documentElement.clientHeight;
        if (rect.bottom < 0 || rect.top > viewHeight) return;

        const progress = Math.min(
          1,
          Math.max(
            0,
            1 -
              (rect.bottom - viewHeight * 0.2) /
                (rect.height + viewHeight * 0.4)
          )
        );
        const bucket = Math.min(
          STEPS.length - 1,
          Math.max(0, Math.floor(progress * STEPS.length))
        );
        const nextId = STEPS[bucket].id;
        if (nextId !== activeId) setActiveId(nextId);
      }, 120);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollThrottle.current) {
        clearTimeout(scrollThrottle.current);
        scrollThrottle.current = null;
      }
    };
  }, [activeId, userInteracted]);

  return (
    <section
      aria-label="How your HomeFix project moves from first measurement to final handover"
      ref={sectionRef}
      className="relative overflow-hidden bg-(--surface-base) py-12 md:py-16 text-(--text-primary)"
    >
      <CosmicBackground />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <header className="mb-8 text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-(--text-secondary)">
            Interior projects · Process
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-(--text-primary) md:text-3xl">
            How your HomeFix project moves from{" "}
            <span className="text-(--accent-primary)">
              first measurement
            </span>{" "}
            to{" "}
            <span className="text-(--accent-primary)">
              final handover
            </span>
            .
          </h2>
          <p className="mt-3 text-sm text-(--text-secondary) md:text-base">
            Each stage is measured, documented, and quality-checked so you know
            exactly where your project stands.
          </p>
        </header>

        <div className="relative mb-6">
          {/* Baseline under steps */}
          <div className="pointer-events-none absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-(--border-soft)" />

          {/* Active progress line under steps */}
          <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2">
            <div
              className="h-0.5 rounded-full bg-(--accent-primary) transition-all duration-300 ease-out"
              style={{
                width: `${
                  ((activeId - 1) / Math.max(STEPS.length - 1, 1)) * 100
                }%`,
              }}
            />
          </div>

          <div className="relative flex snap-x snap-mandatory overflow-x-auto pb-4 pt-2 md:justify-between md:overflow-visible">
            {STEPS.map((step) => {
              const isActive = step.id === activeId;
              return (
                <button
                  key={step.id}
                  type="button"
                  className="group relative mx-3 flex min-w-[120px] snap-center flex-col items-center gap-1 md:mx-0 md:min-w-0"
                  onClick={() => handleSetActive(step.id, true)}
                  onMouseEnter={() => setHoverId(step.id)}
                  onMouseLeave={() => setHoverId(null)}
                  aria-pressed={isActive}
                  aria-current={isActive}
                >
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-(--surface-strong) text-(--text-primary) shadow-md"
                    initial={false}
                    animate={
                      isActive
                        ? {
                            scale: 1.08,
                            boxShadow:
                              "0 0 28px color-mix(in srgb,var(--accent-primary)55%,transparent)",
                          }
                        : {
                            scale: 1,
                            boxShadow: "0 0 0 color-mix(in srgb,var(--accent-primary)0%,transparent)",
                          }
                    }
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  >
                    <StepIcon name={step.iconName} className="h-4 w-4" />
                  </motion.div>
                  <span className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-(--text-secondary)">
                    Step {step.id}
                  </span>
                  <span
                    className={[
                      "text-xs font-medium text-(--text-primary) text-center",
                      isActive || hoverId === step.id ? "" : "opacity-70",
                    ].join(" ")}
                  >
                    {step.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mb-6 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-3xl border border-(--border-soft) bg-(--surface-card) bg-opacity-95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-md md:p-6"
            >
              <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-(--text-secondary)">
                STEP {activeStep.id} · {activeStep.shortLabel.toUpperCase()}
              </p>
              <h3 className="mb-2 text-base font-semibold text-(--text-primary) md:text-lg">
                {activeStep.title}
              </h3>
              <p className="mb-3 text-xs text-(--text-secondary) md:text-sm">
                {activeStep.description}
              </p>
              <ul className="space-y-1.5 md:space-y-2">
                {activeStep.bullets.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-(--text-primary) md:text-sm"
                  >
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-(--accent-primary)" />
                    <span className="text-(--text-primary)">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
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
    <div className="flex items-center gap-2 rounded-full border border-(--border-soft) bg-(--surface-card)/85 px-3 py-2 text-(--text-primary) shadow-sm backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-(--accent-primary)" />
      <span className="text-xs text-(--text-primary) md:text-sm">
        {label}
      </span>
    </div>
  );
}

function CosmicBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--accent-primary)25%,transparent),transparent_55%),radial-gradient(circle_at_bottom,color-mix(in_srgb,var(--accent-secondary,var(--accent-primary))20%,transparent),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--accent-primary)28%,transparent),transparent_55%),radial-gradient(circle_at_bottom,color-mix(in_srgb,var(--accent-secondary,var(--accent-primary))24%,transparent),transparent_60%)]"
    />
  );
}
