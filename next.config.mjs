/**
 * ============================================================
 * 🏗️ HomeFix India Client — Edith Technologies v3.4
 * ------------------------------------------------------------
 * ✅ App Router + PWA (Next 14 stable)
 * ✅ Strict + SafeViewport Ready (for 100dvh layouts)
 * ✅ Smart source-map & console control
 * ✅ Path aliases for Edith ecosystem
 * ✅ Hardened image domains (Cloudinary, Supabase, Unsplash)
 * ============================================================
 */

import nextPWA from "next-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------------------------------------------------
   🔹 Progressive Web App Configuration
------------------------------------------------------------ */
const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
  cacheStartUrl: true,
  sw: "sw.js",
  scope: "/",
});

/* ------------------------------------------------------------
   🔹 Core Next.js Configuration
------------------------------------------------------------ */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV !== "production",
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
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    unoptimized: false,
    minimumCacheTTL: 3600,
  },

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  experimental: {
    scrollRestoration: true,
    typedRoutes: true,
    webVitalsAttribution: ["CLS", "LCP", "FID"],
    serverActions: { bodySizeLimit: "2mb" },
    // 🪶 Enables new 100dvh viewport units for Edith SafeViewport
    viewTransition: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    styledComponents: true,
  },

  poweredByHeader: false,
  compress: true,
  optimizeFonts: true,
  optimizeCss: true,

  /* ------------------------------------------------------------
     🔹 Webpack Enhancements
  ------------------------------------------------------------ */
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

    // Disable source maps in production
    if (process.env.NODE_ENV === "production") {
      config.devtool = false;
    }

    // Edith Build Banner 🩵
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.done.tap("HomeFixBuildBanner", () => {
          console.log(
            "\x1b[35m%s\x1b[0m",
            "\n✨ HomeFix India v3.4 — Edith SafeViewport Build Complete 🌿\n"
          );
        });
      },
    });

    return config;
  },
};

export default withPWA(nextConfig);
