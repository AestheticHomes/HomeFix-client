import SafeViewport from "@/components/layout/SafeViewport";
import TurnkeyServicesSection from "@/components/services/TurnkeyServicesSection";
import { TurnkeyProcessSection } from "@/components/turnkey/TurnkeyProcessSection";
import { fetchServicesConfig } from "@/lib/servicesConfig";

export const metadata = {
  title: "Turnkey Home Interiors & Renovation | HomeFix",
  description:
    "Turnkey interiors, kitchens, wardrobes, bathrooms, tiling, civil works, and waterproofing managed under one project.",
  robots: { index: true, follow: true },
};

export default async function TurnkeyPage() {
  const services = await fetchServicesConfig().catch(() => []);
  const turnkey = services.filter((s) => s.category === "turnkey");

  return (
    <SafeViewport>
      <main className="min-h-screen pb-16">
        <section className="mx-auto max-w-5xl px-4 pt-8 space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Turnkey services
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
            Full-home projects managed end-to-end: interiors, kitchens, wardrobes,
            bathrooms, tiling, civil changes, and waterproofing — all under one project
            manager.
          </p>
        </section>

        <TurnkeyProcessSection />

        <TurnkeyServicesSection services={turnkey} />
      </main>
    </SafeViewport>
  );
}
