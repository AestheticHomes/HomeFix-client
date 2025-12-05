/**
 * Service detail page — canonical metadata, breadcrumbs, and Service schema.
 */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SafeViewport from "@/components/layout/SafeViewport";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";
import ServiceLanding from "@/components/services/ServiceLanding";
import { fetchServicesConfig, getServiceBySlug } from "@/lib/servicesConfig";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getServiceBySlug(params.slug);
  if (!service) return {};

  return buildMetadata({
    title: service.seoTitle || `${service.name} | HomeFix`,
    description: service.seoDescription || service.tagline || "",
    url: `${CANONICAL_ORIGIN}/services/${service.slug}`,
  });
}

export async function generateStaticParams() {
  const services = await fetchServicesConfig().catch(() => []);
  return services.map((s) => ({ slug: s.slug }));
}

export default function ServicePage({ params }: Props) {
  const service = getServiceBySlug(params.slug);
  if (!service) notFound();

  return (
    <SafeViewport>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: CANONICAL_ORIGIN },
          { name: "Services", url: `${CANONICAL_ORIGIN}/services` },
          { name: service.name, url: `${CANONICAL_ORIGIN}/services/${service.slug}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          serviceType: service.category || service.name,
          description: service.seoDescription || service.tagline || service.heroSubtitle || "",
          serviceArea: "Chennai",
          provider: { "@id": `${CANONICAL_ORIGIN}#homefix-localbusiness` },
          url: `${CANONICAL_ORIGIN}/services/${service.slug}`,
        }}
      />
      <Suspense fallback={null}>
        <ServiceLanding service={service} />
      </Suspense>
    </SafeViewport>
  );
}
