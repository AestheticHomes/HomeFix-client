/**
 * HomeFix — HomePageShell (Server Component)
 *
 * Purpose:
 *   - Server-side wrapper for the homepage sections (trust strip, promo rail, hero, process, showcases, social embeds).
 * Notes:
 *   - Must render PromoCarouselShell exactly once; no duplicate promo fallback here.
 */

import Hero from "@/components/home/Hero";
import Home3DVisualizerSection from "@/components/home/Home3DVisualizerSection";
import InstagramEmbedCard from "@/components/home/InstagramEmbedCard";
import MoreServicesStrip from "@/components/home/MoreServicesStrip";
import ProjectsShowcase from "@/components/home/ProjectsShowcase";
import RenovationServices from "@/components/home/RenovationServices";
import StoreShowcase from "@/components/home/StoreShowcase";
import YoutubeEmbedCard from "@/components/home/YoutubeEmbedCard";
import ReviewStrip from "@/components/trust/ReviewStrip";
import { HomeProcessTimeline } from "@/components/home/HomeProcessTimeline";
import PromoCarouselShell from "@/components/layout/PromoCarouselShell";

export default function HomePageShell() {
  return (
    <main className="w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto px-3 sm:px-4 lg:px-8 xl:px-12 pb-24 space-y-6">
      {/* Trust strip at very top */}
      <ReviewStrip />
      <PromoCarouselShell />
      <h2 className="sr-only">
        HomeFix Store — Modular Units With Free Installation
      </h2>

      {/* Hero + quick actions + core process */}
      <Hero />

      <section className="mt-4">
        <HomeProcessTimeline />
      </section>

      <StoreShowcase />

      {/* 🔹 Social proof row: YouTube + Instagram side by side */}
      <section
        aria-label="HomeFix social proof – interior projects on YouTube and Instagram"
        className="mt-8"
      >
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] items-start">
          <YoutubeEmbedCard />
          <InstagramEmbedCard />
        </div>
      </section>

      {/* 🔹 Recent projects now below the social embeds */}
      <section
        aria-label="Recent full home interior projects completed by HomeFix in Chennai"
        className="mt-6"
      >
        <ProjectsShowcase />
      </section>

      <Home3DVisualizerSection />
      <RenovationServices />
      <MoreServicesStrip />
    </main>
  );
}
