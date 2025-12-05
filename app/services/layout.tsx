/**
 * Layout metadata for services shell, built with canonical origin.
 */
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

export const metadata = buildMetadata({
  title: "HomeFix Services | Plumbing, Electrical, Carpentry & More",
  description:
    "Explore our wide range of home services including plumbing, electrical, carpentry, painting, and full home renovation in Chennai.",
  url: `${CANONICAL_ORIGIN}/services`,
  image: `${CANONICAL_ORIGIN}/images/homefix-screenshot.png`,
});

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
