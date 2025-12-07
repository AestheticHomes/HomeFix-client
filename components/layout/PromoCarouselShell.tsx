/**
 * HomeFix — PromoCarouselShell (Server)
 *
 * What: Server wrapper that fetches promos and injects JSON-LD for the promo rail.
 * Where: Used only on the homepage via HomePageShell; renders the client PromoCarousel with server data.
 * Layout/SEO: Emits Product+Offer JSON-LD with rating and shipping/returns metadata; stays server-only to avoid client fetches.
 */

import { getPromoDeals } from "@/lib/promoBrain";
import { PromoCarousel } from "./PromoCarousel";
import { HOMEFIX_RATING_VALUE, HOMEFIX_REVIEW_COUNT } from "@/components/trust/ReviewStrip";

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
              review: {
                "@type": "Review",
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: HOMEFIX_RATING_VALUE.toString(),
                  bestRating: "5",
                  worstRating: "1",
                },
                author: "Verified HomeFix customer",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: HOMEFIX_RATING_VALUE.toString(),
                reviewCount: HOMEFIX_REVIEW_COUNT.toString(),
                bestRating: "5",
                worstRating: "1",
              },
              offers: {
                "@type": "Offer",
                price: p.priceRupees || 0,
                priceCurrency: "INR",
                url: p.href,
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
                priceValidUntil: new Date(
                  (p.expiry && Number.isFinite(p.expiry) ? p.expiry : Date.now() + 7 * 24 * 3600 * 1000) as number
                )
                  .toISOString()
                  .slice(0, 10),
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  applicableCountry: "IN",
                  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                  merchantReturnDays: 7,
                },
                shippingDetails: {
                  "@type": "OfferShippingDetails",
                  shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "IN",
                  },
                  deliveryTime: {
                    "@type": "ShippingDeliveryTime",
                    handlingTime: {
                      "@type": "QuantitativeValue",
                      minValue: 2,
                      maxValue: 7,
                      unitCode: "DAY",
                    },
                  },
                },
              },
            })),
          }),
        }}
      />

      <PromoCarousel promos={promos} />
    </>
  );
}
