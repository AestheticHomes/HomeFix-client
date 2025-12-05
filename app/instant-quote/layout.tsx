/**
 * Layout metadata for instant-quote estimator using canonical origin.
 */
import { buildMetadata } from "@/components/seo/buildMetadata";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

export const metadata = buildMetadata({
  title: "Cost Estimator | HomeFix India",
  description:
    "Calculate the estimated cost for your home interior project. Get a quick quote for modular kitchens, wardrobes, and more.",
  url: `${CANONICAL_ORIGIN}/instant-quote`,
});

export default function EstimatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
