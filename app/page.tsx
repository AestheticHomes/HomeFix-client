/**
 * app/page.tsx
 * Server entry for HomeFix homepage. Renders the promo rail (PromoCarouselShell)
 * followed by the main HomePageShell client experience.
 */

import HomePageShell from "@/components/home/HomePageShell";
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HomePageShell />
    </>
  );
}
