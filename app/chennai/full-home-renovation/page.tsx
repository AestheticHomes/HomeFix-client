/**
 * Chennai local landing — full-home renovation with canonical metadata and Service schema.
 */
import SafeViewport from "@/components/layout/SafeViewport";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

const PAGE_URL = `${CANONICAL_ORIGIN}/chennai/full-home-renovation`;

// SEO: Local landing page metadata (Chennai full-home renovation).
export const metadata = buildMetadata({
  title: "Full Home Renovation in Chennai | HomeFix",
  description: "Turnkey full-home renovation in Chennai with design, BOQ, and execution.",
  url: PAGE_URL,
});

export default function ChennaiFullHomeRenovationPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Full Home Renovation in Chennai",
    serviceType: "Renovation",
    serviceArea: "Chennai",
    provider: { "@id": `${CANONICAL_ORIGIN}#homefix-localbusiness` },
    url: PAGE_URL,
  };

  return (
    <SafeViewport>
      <main className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: CANONICAL_ORIGIN },
            { name: "Chennai", url: `${CANONICAL_ORIGIN}/chennai` },
            { name: "Full Home Renovation", url: PAGE_URL },
          ]}
        />
        <JsonLd data={serviceSchema} />

        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
          Full Home Renovation in Chennai
        </h1>
        <p className="text-[var(--text-secondary)]">
          HomeFix manages design, civil changes, carpentry, and finishes end-to-end for Chennai homes.
        </p>
      </main>
    </SafeViewport>
  );
}
