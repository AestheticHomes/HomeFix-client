/**
 * Project detail — canonical metadata, breadcrumb, and Project schema.
 */
import SafeViewport from "@/components/layout/SafeViewport";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";
import type { Metadata } from "next";

const formatTitle = (slug: string) =>
  slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

type Props = { params: { slug: string } };

// SEO: Canonical metadata for project detail pages.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const projectTitle = formatTitle(params.slug);
  const url = `${CANONICAL_ORIGIN}/projects/${params.slug}`;
  return buildMetadata({
    title: `${projectTitle} | HomeFix Project Showcase`,
    description: `Completed project ${projectTitle} by HomeFix in Chennai.`,
    url,
  });
}

export default function ProjectDetailPage({ params }: Props) {
  const projectTitle = formatTitle(params.slug);
  const url = `${CANONICAL_ORIGIN}/projects/${params.slug}`;

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "Project",
    name: projectTitle,
    url,
    provider: { "@id": `${CANONICAL_ORIGIN}#homefix-localbusiness` },
    areaServed: "Chennai",
  };

  return (
    <SafeViewport>
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <BreadcrumbJsonLd
          items={[
            { name: "Projects", url: `${CANONICAL_ORIGIN}/projects` },
            { name: projectTitle, url },
          ]}
        />
        <JsonLd data={projectSchema} />

        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">{projectTitle}</h1>
        <p className="text-[var(--text-secondary)]">
          Project details are coming soon. This showcase highlights HomeFix execution quality in
          Chennai.
        </p>
      </main>
    </SafeViewport>
  );
}
