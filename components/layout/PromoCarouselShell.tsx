/**
 * HomeFix — PromoCarouselShell (Server)
 *
 * Purpose:
 *   - Fetch Promo[] via promoBrain on the server and inject SEO JSON-LD.
 *   - Render the client PromoCarousel with props (no client fetches).
 *   - Provide a single fallback when promos are empty.
 * Notes:
 *   - Single source of truth for promo fallback; must remain server-side.
 */

import { getPromoDeals } from "@/lib/promoBrain";
import { PromoCarousel } from "./PromoCarousel";

export default async function PromoCarouselShell() {
  const promos = await getPromoDeals();

  if (!promos || promos.length === 0) {
    return (
      <section className="w-full rounded-3xl border border-(--border-soft) bg-(--surface-card) p-6 text-(--text-secondary)">
        Store offers coming soon.
      </section>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "HomeFix Store Deals",
            itemListElement: promos.map((p, index) => ({
              "@type": "Product",
              position: index + 1,
              name: p.title,
              description: p.body,
              image: p.image,
              offers: {
                "@type": "Offer",
                price: p.priceRupees || 0,
                priceCurrency: "INR",
                url: p.href,
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
              },
            })),
          }),
        }}
      />

      <PromoCarousel promos={promos} />
    </>
  );
}
