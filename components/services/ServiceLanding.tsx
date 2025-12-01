"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import ServiceMediaGallery from "./ServiceMediaGallery";
import type { ServiceDefinition } from "@/lib/servicesConfig";

export default function ServiceLanding({ service }: { service: ServiceDefinition }) {
  const router = useRouter();
  const search = useSearchParams();
  const projectRefFromQuery = search?.get("project_ref");

  const checkoutPath =
    service.checkoutPath ||
    `/checkout?type=service&service=${service.slug}&bookingType=site-visit&free=1${
      projectRefFromQuery ? `&project_ref=${projectRefFromQuery}` : ""
    }`;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 pb-16">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-10 sm:px-10 shadow-[0_18px_45px_rgba(0,0,0,0.2)]">
          <div className="space-y-6">
            {(service.highlightBadge || service.category) && (
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-chip px-3 py-1 text-xs font-medium text-muted">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                {service.highlightBadge || service.category}
              </div>
            )}

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
                {service.heroTitle || service.tagline}
              </h1>
              <p className="text-sm sm:text-base text-muted max-w-xl">
                {service.heroSubtitle || service.tagline}
              </p>
            </div>

            <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
              {service.bulletsLeft.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                  <span>{b}</span>
                </li>
              ))}
              {service.bulletsRight?.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={checkoutPath}
                className="inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-lg shadow-black/25 hover:brightness-110 transition-colors"
              >
                {service.ctaLabel || "Book free site visit"}
              </Link>
              <a
                href={`tel:${process.env.NEXT_PUBLIC_SALES_PHONE ?? "+919000000000"}`}
                className="inline-flex items-center justify-center rounded-2xl border border-primary text-primary bg-transparent px-4 py-2 text-sm font-semibold hover:bg-[var(--surface-hover)]"
              >
                Call now
              </a>
            </div>
          </div>
        </section>

        {/* MEDIA GALLERY */}
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
              See our recent work
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-2xl">
              Photos and walkthroughs from projects in this service category.
            </p>
          </div>
          <ServiceMediaGallery service={service} />
        </section>

        {/* PROJECT GALLERY AS BOOKING ENGINES */}
        {service.projects && service.projects.length > 0 && (
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                Recent projects in this service
              </h2>
              <p className="text-xs sm:text-sm text-muted max-w-2xl">
                These are actual projects executed by AestheticHomes in Chennai.
                You can book a similar scope for your home.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {service.projects.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
                >
                  {p.media[0] && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {p.media[0].type === "image" ? (
                        <Image
                          src={p.media[0].src}
                          alt={p.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <video
                          className="h-full w-full object-cover"
                          src={p.media[0].src}
                          controls
                        />
                      )}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5">
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                        {p.title}
                      </h3>
                      {(p.location || p.scopeLine) && (
                        <p className="text-xs text-muted">
                          {p.location}
                          {p.location && p.scopeLine && " • "}
                          {p.scopeLine}
                        </p>
                      )}
                    </div>

                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-border bg-chip px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {p.highlights && p.highlights.length > 0 && (
                      <ul className="space-y-1 text-[11px] text-muted">
                        {p.highlights.map((h) => (
                          <li key={h} className="flex gap-2">
                            <span className="mt-[6px] h-1 w-1 rounded-full bg-[var(--accent-primary)]" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-auto pt-2 flex flex-wrap gap-2">
                      <Link
                        href={checkoutPath}
                        className="inline-flex items-center justify-center rounded-xl bg-[var(--accent-primary-soft)] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[var(--accent-primary)] transition-colors"
                      >
                        Book similar project
                      </Link>
                      <Link
                        href={`/services/${service.slug}?project_ref=${encodeURIComponent(
                          p.id
                        )}`}
                        className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-[11px] text-muted hover:bg-[var(--surface-hover)]"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
