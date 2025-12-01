"use client";

import Link from "next/link";

import OldHeroPreview from "@/components/home/OldHeroPreview";

export default function Home3DVisualizerSection() {
  return (
    <section
      aria-labelledby="visualize-3d-heading"
      className="px-3 sm:px-4 lg:px-8 xl:px-12 py-10 sm:py-12 rounded-3xl bg-[var(--surface-card)] shadow-[0_18px_50px_rgba(15,23,42,0.15)] border border-[var(--border-subtle)] mt-10"
    >
      <div className="mx-auto w-full max-w-[1360px] grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] gap-8 items-center">
        <div className="space-y-4">
          <h2
            id="visualize-3d-heading"
            className="text-base sm:text-lg md:text-xl font-semibold text-[var(--text-primary)]"
          >
            See your home in 3D before you build.
          </h2>
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

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/consultation"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 bg-[var(--accent-primary)] text-primary-foreground text-sm font-semibold shadow-[0_10px_24px_rgba(0,0,0,0.18)] hover:brightness-110 transition"
            >
              Talk to a 3D design expert
            </Link>
            <Link
              href="/instant-quote"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 border border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--surface-card)] text-sm font-semibold hover:bg-[var(--surface-hover)] transition"
            >
              Upload my layout
            </Link>
          </div>
        </div>

        <div className="w-full flex lg:justify-end">
          <OldHeroPreview />
        </div>
      </div>
    </section>
  );
}
