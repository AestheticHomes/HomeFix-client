/**
 * Chennai local landing — interior designers with canonical metadata and Service schema.
 */
import SafeViewport from "@/components/layout/SafeViewport";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

const PAGE_URL = `${CANONICAL_ORIGIN}/chennai/interior-designers`;

// SEO: Local landing page metadata (Chennai interior designers).
export const metadata = buildMetadata({
  title: "Interior Designers in Chennai | HomeFix",
  description: "Book HomeFix interior designers in Chennai for full-home planning and execution.",
  url: PAGE_URL,
});

export default function ChennaiInteriorDesignersPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Interior Designers in Chennai",
    serviceType: "Interior Design",
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
            { name: "Interior Designers", url: PAGE_URL },
          ]}
        />
        <JsonLd data={serviceSchema} />

        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
          Interior Designers in Chennai
        </h1>
        <p className="text-[var(--text-secondary)]">
          HomeFix offers full-home interior design, 2D/3D planning, and turnkey execution in Chennai.
        </p>
      </main>
    </SafeViewport>
  );
}
