/**
 * HomeFix — HomePageShell (Server Component)
 *
 * What: Server-side wrapper for the homepage sections (promo rail, catalog, 3D visualiser, process, social, services, projects).
 * Where: Used only in app/page.tsx for the root "/" route.
 * Layout/SEO: Maintains 4-col mobile / 12-col desktop rhythm, keeps promo rail first, hero hidden via flag, and avoids duplicate promos or legacy strips.
 */

import Hero from "@/components/home/Hero";
import ProjectsShowcase from "@/components/home/ProjectsShowcase";
import RenovationServices from "@/components/home/RenovationServices";
import StoreShowcase from "@/components/home/StoreShowcase";
import { HomeProcessTimeline } from "@/components/home/HomeProcessTimeline";
import PromoCarouselShell from "@/components/layout/PromoCarouselShell";
import SocialRow from "@/components/home/SocialRow";

export default function HomePageShell() {
  const showHero = true;

  return (
    <main className="w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto px-3 sm:px-4 lg:px-8 xl:px-12 pb-24 space-y-8">
      <PromoCarouselShell />
      {showHero ? <Hero /> : null}
      <StoreShowcase />
      {/*
      <HomeProcessTimeline />
      */}

      {/* 🔹 Social proof row: YouTube + Instagram side by side */}
      <SocialRow />

      {/*
      <RenovationServices />
      */}

      {/* 🔹 Recent projects now below the social embeds */}
      {/*
      <ProjectsShowcase />
      */}
    </main>
  );
}
