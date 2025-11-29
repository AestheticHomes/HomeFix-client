import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SafeViewport from "@/components/layout/SafeViewport";
import { Suspense } from "react";
import { fetchServicesConfig, getServiceBySlug } from "@/lib/servicesConfig";
import ServiceLanding from "@/components/services/ServiceLanding";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getServiceBySlug(params.slug);
  if (!service) return {};
  return {
    title: service.seoTitle,
    description: service.seoDescription,
  };
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
      <Suspense fallback={null}>
        <ServiceLanding service={service} />
      </Suspense>
    </SafeViewport>
  );
}
