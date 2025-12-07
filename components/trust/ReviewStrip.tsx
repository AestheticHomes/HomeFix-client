/**
 * ReviewStrip — displays rating badge and emits AggregateRating JSON-LD.
 *
 * Usage: Optional trust strip for marketing pages (e.g., legacy homepage placements); the rating values
 *         are also consumed by the UniversalHeader pill and promo JSON-LD.
 * Layout/SEO: Compact inline badge with AggregateRating schema anchored to the global business graph.
 */
import type { FC } from "react";

import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

export const HOMEFIX_RATING_VALUE = 4.9;
export const HOMEFIX_REVIEW_COUNT = 52;

const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  itemReviewed: { "@id": `${CANONICAL_ORIGIN}#homefix-localbusiness` },
  ratingValue: HOMEFIX_RATING_VALUE.toString(),
  reviewCount: HOMEFIX_REVIEW_COUNT.toString(),
  bestRating: "5",
  worstRating: "1",
};

const ReviewStrip: FC = () => {
  return (
    <section className="relative z-10 rounded-2xl border border-border bg-card px-4 py-3 flex flex-wrap items-center gap-3 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
            {HOMEFIX_RATING_VALUE.toFixed(1)}
          </span>
          <span
            className="text-lg sm:text-xl text-[var(--accent-secondary)]"
            aria-hidden="true"
          >
            ★★★★★
          </span>
        </div>
        <span className="text-xs sm:text-[13px] text-[var(--text-secondary)]">
          from {HOMEFIX_REVIEW_COUNT}+ Google reviews in Chennai
        </span>
      </div>

      <a
        href="https://www.google.com/maps?cid=9947746553108858324"
        target="_blank"
        rel="noreferrer"
        className="ml-auto inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] sm:text-xs font-semibold hover:brightness-110 transition"
      >
        Read reviews →
      </a>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
    </section>
  );
};

export default ReviewStrip;
