/**
 * ============================================================
 * 🏗️ HomeFix India — Edith Technologies v3.4 (ESM Safe)
 * ------------------------------------------------------------
 * ✅ Ensures /api routes execute properly (standalone)
 * ✅ PWA + Supabase Edge + LedgerX compatible
 * ✅ TypedRoute ready for App Router
 * ============================================================
 */

import bundleAnalyzer from "@next/bundle-analyzer";
import nextPWA from "next-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  cacheStartUrl: true,
  sw: "sw.js",
  scope: "/",
  buildExcludes: [/middleware-manifest\.json$/],
});

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV !== "production",
  // output: "standalone", // Disabled to avoid Windows trace copy issues
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "cdn.aesthetichomes.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },

      // 👇 IMPORTANT: this fixes your 400 errors
      {
        protocol: "https",
        hostname: "xnubmphixlpkyqfhghup.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    unoptimized: false,
    minimumCacheTTL: 3600,
  },

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
    scrollRestoration: true,
    typedRoutes: true,
    webVitalsAttribution: ["CLS", "LCP", "FID"],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    styledComponents: true,
  },

  poweredByHeader: false,
  compress: true,
  optimizeFonts: true,

  async redirects() {
    return [];
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@/types": path.resolve(__dirname, "types"),
      "@/components": path.resolve(__dirname, "components"),
      "@/lib": path.resolve(__dirname, "lib"),
      "@/hooks": path.resolve(__dirname, "hooks"),
      "@/contexts": path.resolve(__dirname, "contexts"),
      "@/edith": path.resolve(__dirname, "edith"),
    };

    if (process.env.NODE_ENV === "production") {
      config.devtool = false;
    }

    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.done.tap("HomeFixBuildBanner", () => {
          console.log(
            "\x1b[36m%s\x1b[0m",
            "\n🌿 HomeFix India v3.4 — Edith Continuum Server Ready ⚡\n"
          );
        });
      },
    });

    return config;
  },
};

export default withBundleAnalyzer(withPWA(nextConfig));
