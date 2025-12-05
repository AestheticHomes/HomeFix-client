/**
 * Layout metadata for design-lab using canonical origin.
 */
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

export const metadata = buildMetadata({
  title: "Design Studio | HomeFix India",
  description:
    "Explore our design studio for inspiration. View our portfolio of completed interior projects and design concepts.",
  url: `${CANONICAL_ORIGIN}/design-lab`,
});

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
