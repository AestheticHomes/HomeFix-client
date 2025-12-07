/**
 * HomeFix — HomePageShell (Server Component)
 *
 * What: Server-side wrapper for the homepage sections (promo rail, catalog, 3D visualiser, process, social, services, projects).
 * Where: Used only in app/page.tsx for the root "/" route.
 * Layout/SEO: Maintains 4-col mobile / 12-col desktop rhythm, keeps promo rail first, hero hidden via flag, and avoids duplicate promos or legacy strips.
 */

import Hero from "@/components/home/Hero";
import Home3DVisualizerSection from "@/components/home/Home3DVisualizerSection";
import InstagramEmbedCard from "@/components/home/InstagramEmbedCard";
import ProjectsShowcase from "@/components/home/ProjectsShowcase";
import RenovationServices from "@/components/home/RenovationServices";
import StoreShowcase from "@/components/home/StoreShowcase";
import YoutubeEmbedCard from "@/components/home/YoutubeEmbedCard";
import { HomeProcessTimeline } from "@/components/home/HomeProcessTimeline";
import PromoCarouselShell from "@/components/layout/PromoCarouselShell";

export default function HomePageShell() {
  const showHero = false;

  return (
    <main className="w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto px-3 sm:px-4 lg:px-8 xl:px-12 pb-24 space-y-8">
      <PromoCarouselShell />
      <StoreShowcase />
      {showHero ? <Hero /> : null}
      <Home3DVisualizerSection />
      <HomeProcessTimeline />

      {/* 🔹 Social proof row: YouTube + Instagram side by side */}
      <section
        aria-label="HomeFix social proof – interior projects on YouTube and Instagram"
        className="mt-2"
      >
        <div className="flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="min-w-[70%] snap-center md:min-w-0 md:w-1/2">
            <YoutubeEmbedCard />
          </div>
          <div className="min-w-[70%] snap-center md:min-w-0 md:w-1/2">
            <InstagramEmbedCard />
          </div>
        </div>
      </section>

      <RenovationServices />

      {/* 🔹 Recent projects now below the social embeds */}
      <ProjectsShowcase />
    </main>
  );
}
