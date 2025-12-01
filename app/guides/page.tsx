import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HomeFix Interior Guides | Planning Full Home Interiors in Chennai",
  description:
    "Expert guides on planning full home interiors in Chennai: budgeting, transparent BOQ, 3D design, site execution, and warranties for kitchens, wardrobes, and more.",
};

const guides = [
  { title: "Full Home Interiors Checklist", href: "/guides/full-home-interiors-checklist" },
  { title: "Transparent BOQ: How We Price", href: "/guides/transparent-boq" },
  { title: "3D Renders to Site Execution", href: "/guides/3d-to-site" },
];

export default function GuidesPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">Guides & Education</p>
        <h1 className="text-3xl font-semibold text-foreground">
          Plan your full home interiors with confidence
        </h1>
        <p className="text-muted max-w-2xl">
          Learn how HomeFix handles measurement, transparent BOQ, 3D design, factory build, and site handover for Chennai homes.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {guides.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground hover:bg-[var(--surface-hover)] transition-colors"
          >
            <h2 className="text-lg font-semibold">{g.title}</h2>
            <p className="text-sm text-muted mt-1">Full home interiors · Chennai</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
