import type { FC } from "react";

const rating = 4.9;
const reviewCount = 52;

const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  itemReviewed: {
    "@type": "LocalBusiness",
    name: "AestheticHomes",
  },
  ratingValue: rating.toString(),
  reviewCount: reviewCount.toString(),
  bestRating: "5",
  worstRating: "1",
};

const ReviewStrip: FC = () => {
  return (
    <section className="relative z-10 rounded-2xl border border-border bg-card px-4 py-3 flex flex-wrap items-center gap-3 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
            {rating.toFixed(1)}
          </span>
          <span
            className="text-lg sm:text-xl text-[var(--accent-secondary)]"
            aria-hidden="true"
          >
            ★★★★★
          </span>
        </div>
        <span className="text-xs sm:text-[13px] text-[var(--text-secondary)]">
          from {reviewCount}+ Google reviews in Chennai
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
