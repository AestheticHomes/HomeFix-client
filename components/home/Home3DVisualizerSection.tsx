"use client";
/**
 * Home3DVisualizerSection
 *
 * What: Highlights the 3D walkthrough/visualizer offering with CTAs.
 * Where: Homepage, placed after the modular store rail.
 * Layout/SEO: Collapsible 3D explainer stacked above the UniversalPreview card; keeps the cosmic card styling.
 */

import Link from "next/link";
import { useState } from "react";

import OldHeroPreview from "@/components/home/OldHeroPreview";

export default function Home3DVisualizerSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      aria-labelledby="visualize-3d-heading"
      className="px-3 sm:px-4 lg:px-8 xl:px-12 py-8 sm:py-10 rounded-3xl bg-[var(--surface-card)] shadow-[0_18px_50px_rgba(15,23,42,0.15)] border border-[var(--border-subtle)]"
    >
      <div className="mx-auto w-full max-w-[1360px] flex flex-col gap-5 sm:gap-6">
        <div className="space-y-3">
          <h2
            id="visualize-3d-heading"
            className="text-base sm:text-lg md:text-xl font-semibold text-[var(--text-primary)]"
          >
            See your home in 3D before you build.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Get a quick 3D walkthrough of your kitchen or full home before any demolition or carpentry starts.
          </p>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs font-semibold text-[var(--accent-primary)] underline underline-offset-4 hover:text-[color-mix(in_srgb,var(--accent-primary)85%,white)] transition-colors"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Hide details ↑" : "Show details ↓"}
          </button>

          {isExpanded && (
            <div className="space-y-3">
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Get a 3D interior walkthrough of your kitchen or full home before any demolition or carpentry starts, so you avoid costly mistakes, rework and material waste.
              </p>

              <ul className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
                  <span>Upload your 2D floor plan and get a full 3D model of your home or dream kitchen.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
                  <span>Preview layouts, finishes and storage options before spending on materials or labour.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
                  <span>Finalise your design with a transparent BOQ and execution schedule.</span>
                </li>
              </ul>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                No 2D drawing yet? Our design expert can visit your home, measure every room and prepare the layout from scratch, then convert it into 3D.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2">
            <Link
              href="/instant-quote"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 bg-[var(--accent-primary)] text-primary-foreground text-sm font-semibold shadow-[0_10px_24px_rgba(0,0,0,0.18)] hover:brightness-110 transition"
            >
              Create my layout in 3D
            </Link>
            <Link
              href="/instant-quote"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 border border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--surface-card)] text-sm font-semibold hover:bg-[var(--surface-hover)] transition"
            >
              I already have a 2D layout
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Don’t have a 2D drawing? Just use our estimator to sketch your space and generate the 3D model. Still stuck? We’re one call away.
          </p>
          <Link
            href="/consultation"
            className="inline-flex text-[11px] sm:text-sm font-semibold text-[var(--accent-primary)] hover:text-[color-mix(in_srgb,var(--accent-primary)85%,white)]"
          >
            Still confused? Talk to a 3D design expert →
          </Link>
        </div>

        <div className="w-full flex justify-center">
          <OldHeroPreview />
        </div>
      </div>
    </section>
  );
}
