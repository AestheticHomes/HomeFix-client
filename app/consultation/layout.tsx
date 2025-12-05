/**
 * Layout metadata for consultation booking; uses canonical origin for SEO.
 */
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

export const metadata = buildMetadata({
  title: "Book Consultation | HomeFix India",
  description:
    "Schedule a consultation with our interior design experts. Get professional advice for your home renovation and interior needs.",
  url: `${CANONICAL_ORIGIN}/consultation`,
});

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
