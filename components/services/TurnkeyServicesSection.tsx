import Link from "next/link";
import Image from "next/image";
import type { ServiceDefinition } from "@/lib/servicesConfig";

export interface TurnkeyServicesSectionProps {
  services: ServiceDefinition[];
}

export default function TurnkeyServicesSection({
  services,
}: TurnkeyServicesSectionProps) {
  const turnkey = services.filter((s) => s.category === "turnkey");

  if (!turnkey.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Turnkey services
        </p>
        <h2
          className="text-3xl sm:text-4xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Free consultation & site visit for turnkey projects
        </h2>
        <p
          className="text-sm sm:text-base max-w-3xl"
          style={{ color: "var(--text-secondary)" }}
        >
          Kitchens, wardrobes, bathrooms, tiling, civil works, waterproofing, and
          full-home interiors—designed and executed with one team.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {turnkey.map((svc) => {
          const thumb =
            svc.projects?.[0]?.media?.[0]?.src ||
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=60";

          return (
            <article
              key={svc.slug}
              className="flex flex-col rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] shadow-sm overflow-hidden"
            >
              <div className="relative h-48 w-full overflow-hidden">
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
                  Turnkey
                </div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {svc.name}
                </h3>
                <p
                  className="text-sm line-clamp-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {svc.heroSubtitle || svc.tagline}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">
                    {svc.ctaSubtext || "Free consult + site visit"}
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
    </section>
  );
}
