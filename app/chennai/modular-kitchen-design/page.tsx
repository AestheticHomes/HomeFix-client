/**
 * Chennai local landing — modular kitchen design with canonical metadata and Service schema.
 */
import SafeViewport from "@/components/layout/SafeViewport";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

const PAGE_URL = `${CANONICAL_ORIGIN}/chennai/modular-kitchen-design`;

// SEO: Local landing page metadata (Chennai modular kitchen design).
export const metadata = buildMetadata({
  title: "Modular Kitchen Design in Chennai | HomeFix",
  description: "Custom modular kitchen design and installation in Chennai with factory-built units.",
  url: PAGE_URL,
});

export default function ChennaiModularKitchenPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Modular Kitchen Design in Chennai",
    serviceType: "Modular Kitchen",
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
            { name: "Modular Kitchen Design", url: PAGE_URL },
          ]}
        />
        <JsonLd data={serviceSchema} />

        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
          Modular Kitchen Design in Chennai
        </h1>
        <p className="text-[var(--text-secondary)]">
          HomeFix delivers factory-built modular kitchens with site supervision across Chennai.
        </p>
      </main>
    </SafeViewport>
  );
}
