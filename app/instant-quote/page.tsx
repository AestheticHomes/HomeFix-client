/**
 * Instant-quote page metadata + entry — ensures OG/Twitter use canonical origin.
 */
import EstimatorPageClient from "@/components/estimator/EstimatorPageClient";
import type { Metadata } from "next";

import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

export const metadata: Metadata = {
  title: "HomeFix Estimator | 2D/3D kitchen & wardrobe budgeting",
  description:
    "Plan kitchens and wardrobes with 2D/3D previews, wall spans, finishes, and instant budget ranges. Free consultation and site visit included.",
  openGraph: {
    title: "HomeFix Estimator | 2D/3D budgeting for interiors",
    description:
      "Estimate kitchens and wardrobes with live spans, finishes, and 3D previews before execution. Reduce waste and avoid labour mistakes.",
    url: `${CANONICAL_ORIGIN}/instant-quote`,
    siteName: "HomeFix India",
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeFix Estimator | 2D/3D budgeting for interiors",
    description:
      "Plan kitchens and wardrobes with 2D/3D previews and instant budgets. Consultation and site visit included.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <EstimatorPageClient />;
}
