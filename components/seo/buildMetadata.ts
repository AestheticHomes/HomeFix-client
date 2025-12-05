/**
 * SEO helper — builds canonical/OG/Twitter metadata using the canonical origin.
 */
import type { Metadata } from "next";

import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

type BuildMetadataArgs = {
  title: string;
  description: string;
  url: string; // absolute or path; will be resolved against CANONICAL_ORIGIN
  image?: string; // absolute or path
};

/**
 * SEO: Consistent metadata generator (canonical + OG + Twitter).
 * Resolves relative inputs against the canonical origin.
 */
export function buildMetadata({
  title,
  description,
  url,
  image = "/og-default.jpg",
}: BuildMetadataArgs): Metadata {
  const canonical =
    url.startsWith("http") || url.startsWith("https")
      ? url
      : `${CANONICAL_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;

  const imageUrl =
    image.startsWith("http") || image.startsWith("https")
      ? image
      : `${CANONICAL_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
