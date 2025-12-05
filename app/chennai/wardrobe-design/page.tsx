/**
 * Chennai local landing — wardrobe design with canonical metadata and Service schema.
 */
import SafeViewport from "@/components/layout/SafeViewport";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

const PAGE_URL = `${CANONICAL_ORIGIN}/chennai/wardrobe-design`;

// SEO: Local landing page metadata (Chennai wardrobe design).
export const metadata = buildMetadata({
  title: "Wardrobe Design in Chennai | HomeFix",
  description: "Custom wardrobes with factory finishes and on-site installation in Chennai.",
  url: PAGE_URL,
});

export default function ChennaiWardrobeDesignPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Wardrobe Design in Chennai",
    serviceType: "Wardrobe Design",
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
            { name: "Wardrobe Design", url: PAGE_URL },
          ]}
        />
        <JsonLd data={serviceSchema} />

        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
          Wardrobe Design in Chennai
        </h1>
        <p className="text-[var(--text-secondary)]">
          HomeFix builds made-to-measure wardrobes with optimized storage for Chennai homes.
        </p>
      </main>
    </SafeViewport>
  );
}
