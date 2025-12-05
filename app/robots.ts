/**
 * robots.txt generator — SEO safe, AdsBot-safe, canonical aligned.
 * HomeFix India — www.homefix.co.in
 */

import { MetadataRoute } from "next";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = CANONICAL_ORIGIN;

  return {
    rules: [
      // Main rule — allow everything
      {
        userAgent: "*",
        allow: "/",
      },

      // Sensitive areas — block only what MUST be private
      {
        userAgent: "*",
        disallow: [
          "/admin/",
          "/private/",
          "/api/internal/",
          "/api/debug/",
        ],
      },

      // Google Ads crawler rules (must be explicitly open)
      {
        userAgent: "AdsBot-Google",
        allow: "/",
      },
      {
        userAgent: "AdsBot-Google-Mobile",
        allow: "/",
      },

      // Optional protective rules
      {
        userAgent: "PetalBot",
        disallow: "/",
      },
      {
        userAgent: "AhrefsBot",
        crawlDelay: 10,
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
