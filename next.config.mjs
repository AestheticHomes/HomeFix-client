/**
 * File: /next.config.mjs
 * Project: HomeFix India Client (v3.2 Strict PWA)
 * ------------------------------------------------------------
 * ✅ Full PWA support (offline, install prompt, service worker)
 * ✅ Supabase-safe (no interference with auth/session)
 * ✅ Optimized image domains + performance tuning
 */

import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  scope: "/",
  sw: "sw.js",
  cacheStartUrl: true,
  buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    unoptimized: true, // ✅ safer for PWA caching/offline use
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
  },

  poweredByHeader: false,
  compress: true,
};

export default withPWA(nextConfig);
