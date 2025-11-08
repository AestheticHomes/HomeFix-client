/**
 * File: /next.config.mjs
 * Project: HomeFix India Client (v3.3 · Edith Secure Build)
 * ------------------------------------------------------------
 * ✅ Full PWA support (App Router compatible)
 * ✅ Strict mode auto-toggle
 * ✅ Path aliases for Edith ecosystem
 * ✅ Production-safe (no source maps, console stripping)
 * ✅ Hardened image host list
 */

import nextPWA from "next-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------------------------------------------------
   🔹 PWA configuration — App Router safe (Next 14+)
------------------------------------------------------------ */
const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  scope: "/",
  sw: "sw.js",
  cacheStartUrl: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

/* ------------------------------------------------------------
   🔹 Core Next.js Config
------------------------------------------------------------ */
const nextConfig = {
  productionBrowserSourceMaps: false,
  reactStrictMode: process.env.NODE_ENV !== "production",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "cdn.aesthetichomes.net" },
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
     🔹 Webpack customizations
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

    if (process.env.NODE_ENV === "production") {
      config.devtool = false;
    }

    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.done.tap("HomeFixBuildBanner", () => {
          console.log(
            "\x1b[35m%s\x1b[0m",
            "\n🏗️  HomeFix India v3.3 — Edith Technologies Secure Build Complete.\n"
          );
        });
      },
    });

    return config;
  },
};

export default withPWA(nextConfig);
