/**
 * Projects listing — canonical metadata + breadcrumb JSON-LD.
 */
import Link from "next/link";
import type { Metadata } from "next";

import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN, PARENT_ORG_NAME } from "@/lib/seoConfig";

// SEO: Canonical metadata for projects listing.
export const metadata: Metadata = buildMetadata({
  title: "HomeFix Projects | Completed Homes Across Chennai",
  description:
    `See our delivered interior projects powered by ${PARENT_ORG_NAME} across Chennai.`,
  url: `${CANONICAL_ORIGIN}/projects`,
});

export default function ProjectsPage() {
  const projects = [
    { title: "3BHK Full Home, Adyar", href: "/projects/adyar-3bhk" },
    { title: "Modular Kitchen + Wardrobes, OMR", href: "/projects/omr-kitchen-wardrobes" },
    { title: "Living + Dining Remodel, Velachery", href: "/projects/velachery-living" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <BreadcrumbJsonLd
        items={[{ name: "Projects", url: `${CANONICAL_ORIGIN}/projects` }]}
      />
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">Case Studies</p>
        <h1 className="text-3xl font-semibold text-foreground">
          Completed interior projects across Chennai
        </h1>
        <p className="text-muted max-w-2xl">
          Full home interiors, modular kitchens, wardrobes, bathrooms, and civil work —
          executed with transparent BOQ, 3D design, and documented handover.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground hover:bg-[var(--surface-hover)] transition-colors"
          >
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="text-sm text-muted mt-1">Full home interiors · Transparent BOQ</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
