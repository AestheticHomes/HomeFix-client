"use client";

import Hero from "@/components/home/Hero";
import HomePromoClimateStrip from "@/components/home/HomePromoClimateStrip";
import MoreServicesStrip from "@/components/home/MoreServicesStrip";
import PromoStrip from "@/components/home/PromoStrip";
import ProjectsShowcase from "@/components/home/ProjectsShowcase";
import QuickActions from "@/components/home/QuickActions";
import RenovationServices from "@/components/home/RenovationServices";
import StoreShowcase from "@/components/home/StoreShowcase";
import SafeViewport from "@/components/layout/SafeViewport";

export default function HomePage() {
  return (
    <SafeViewport>
      <main className="w-full max-w-md mx-auto px-4 pb-24 space-y-6 md:max-w-3xl md:px-6">
        <HomePromoClimateStrip />
        <Hero />
        <QuickActions />
        <StoreShowcase />
        <RenovationServices />
        <ProjectsShowcase />
        <PromoStrip />
        <MoreServicesStrip />
      </main>
    </SafeViewport>
  );
}
