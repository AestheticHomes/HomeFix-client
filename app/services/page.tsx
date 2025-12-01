import Link from "next/link";
import Image from "next/image";
import SafeViewport from "@/components/layout/SafeViewport";
import { fetchServicesConfig, type ServiceDefinition } from "@/lib/servicesConfig";

export const metadata = {
  title: "Services | HomeFix",
  description:
    "Book essential home services with transparent pricing. Painters, electricians, and more from HomeFix.",
};

function EssentialGrid({ services }: { services: ServiceDefinition[] }) {
  if (!services.length) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((svc) => {
        const thumb =
          svc.projects?.[0]?.media?.[0]?.src ||
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=60";
        return (
          <article
            key={svc.slug}
            className="flex flex-col rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] shadow-sm overflow-hidden"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src={thumb}
                alt={svc.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                Essential
              </div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {svc.name}
              </h3>
              <p className="text-sm line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                {svc.heroSubtitle || svc.tagline}
              </p>
              <div className="mt-auto pt-2 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  {svc.ctaSubtext || "Quick scheduling"}
                </span>
                <Link
                  href={`/services/${svc.slug}`}
                  className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                  style={{ background: "var(--accent-primary)" }}
                >
                  View details
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default async function ServicesPage() {
  const services = await fetchServicesConfig().catch(() => []);
  const essential = services.filter((s) => s.category === "essential");

  return (
    <SafeViewport>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-10">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Services
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            Essential home services
          </h1>
          <p className="text-sm sm:text-base max-w-3xl" style={{ color: "var(--text-secondary)" }}>
            Book certified pros for painting, electrical work, and more. Transparent scope,
            reliable scheduling.
          </p>
          <div className="inline-flex items-center gap-2 text-sm">
            <span className="text-[var(--text-secondary)]">Looking for full projects?</span>
            <Link
              href="/full-home-packages"
              className="font-semibold text-[var(--accent-primary)] hover:underline"
            >
              Explore turnkey services →
            </Link>
          </div>
        </section>

        <EssentialGrid services={essential} />
      </main>
    </SafeViewport>
  );
}
