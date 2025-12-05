/**
 * Turnkey packages landing — canonical metadata + breadcrumb JSON-LD.
 */
import SafeViewport from "@/components/layout/SafeViewport";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { buildMetadata } from "@/components/seo/buildMetadata";
import TurnkeyServicesSection from "@/components/services/TurnkeyServicesSection";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";
import { fetchServicesConfig } from "@/lib/servicesConfig";

// SEO: Canonical metadata for turnkey packages.
export const metadata = buildMetadata({
  title: "Turnkey Home Interiors & Renovation | HomeFix",
  description:
    "Turnkey interiors, kitchens, wardrobes, bathrooms, tiling, civil works, and waterproofing managed under one project.",
  url: `${CANONICAL_ORIGIN}/full-home-packages`,
});

export default async function TurnkeyPage() {
  const services = await fetchServicesConfig().catch(() => []);
  const turnkey = services.filter((s) => s.category === "turnkey");

  return (
    <SafeViewport>
      <main className="min-h-screen pb-16">
        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: CANONICAL_ORIGIN },
            { name: "Turnkey Packages", url: `${CANONICAL_ORIGIN}/full-home-packages` },
          ]}
        />
        <section className="mx-auto max-w-5xl px-4 pt-8 space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Turnkey services
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
            Full-home projects managed end-to-end: interiors, kitchens,
            wardrobes, bathrooms, tiling, civil changes, and waterproofing — all
            under one project manager.
          </p>
        </section>

        <TurnkeyServicesSection services={turnkey} />
      </main>
    </SafeViewport>
  );
}
