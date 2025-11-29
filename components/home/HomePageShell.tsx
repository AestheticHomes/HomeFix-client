"use client";

import Hero from "@/components/home/Hero";
import MoreServicesStrip from "@/components/home/MoreServicesStrip";
import ProjectsShowcase from "@/components/home/ProjectsShowcase";
import QuickActions from "@/components/home/QuickActions";
import RenovationServices from "@/components/home/RenovationServices";
import StoreShowcase from "@/components/home/StoreShowcase";
import { TurnkeyProcessSection } from "@/components/turnkey/TurnkeyProcessSection";

export default function HomePageShell() {
  return (
    <main className="w-full max-w-[1200px] 2xl:max-w-[1360px] mx-auto px-3 sm:px-4 lg:px-8 xl:px-12 pb-24 space-y-6">
      <Hero />
      <section className="mt-12">
        <TurnkeyProcessSection />
      </section>
      <QuickActions />
      <StoreShowcase />
      <RenovationServices />
      <ProjectsShowcase />
      <MoreServicesStrip />
    </main>
  );
}
