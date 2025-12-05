/**
 * Guide detail — canonical metadata, breadcrumb, and Article schema.
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

// SEO: Canonical metadata for guide detail pages.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guideTitle = formatTitle(params.slug);
  const url = `${CANONICAL_ORIGIN}/guides/${params.slug}`;
  return buildMetadata({
    title: `${guideTitle} | HomeFix Guide`,
    description: `Learn about ${guideTitle} with HomeFix's Chennai-focused interior expertise.`,
    url,
  });
}

export default function GuideDetailPage({ params }: Props) {
  const guideTitle = formatTitle(params.slug);
  const url = `${CANONICAL_ORIGIN}/guides/${params.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guideTitle,
    mainEntityOfPage: url,
    author: { "@id": `${CANONICAL_ORIGIN}#homefix-org` },
    publisher: { "@id": `${CANONICAL_ORIGIN}#homefix-org` },
  };

  return (
    <SafeViewport>
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <BreadcrumbJsonLd
          items={[
            { name: "Guides", url: `${CANONICAL_ORIGIN}/guides` },
            { name: guideTitle, url },
          ]}
        />
        <JsonLd data={articleSchema} />

        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">{guideTitle}</h1>
        <p className="text-[var(--text-secondary)]">
          Guide content will be published soon. HomeFix shares expert tips for Chennai renovations.
        </p>
      </main>
    </SafeViewport>
  );
}
