/**
 * InstagramEmbedCard
 *
 * What: Embeds the Instagram feed for Aesthetic Homes/HomeFix work.
 * Where: Homepage social row, paired with YouTube embed.
 * Layout/SEO: Card-styled iframe with rounded border; assumes parent provides horizontal flex/snap container.
 */

import { PARENT_ORG_NAME } from "@/lib/seoConfig";

export function InstagramEmbedCard() {
  return (
    <section
      aria-labelledby="instagram-showcase-heading"
      className="h-full"
    >
      <div
        className="
          rounded-3xl border border-[var(--border-subtle)]
          bg-[var(--surface-card)] shadow-[0_18px_45px_rgba(15,23,42,0.12)]
          px-4 py-4 sm:px-5 sm:py-5
          flex flex-col gap-3 h-full
        "
      >
        <h2
          id="instagram-showcase-heading"
          className="text-sm sm:text-base font-semibold text-[var(--text-primary)]"
        >
          See our latest work on Instagram
        </h2>
        <div className="aspect-[4/5] w-full overflow-hidden rounded-xl border border-[var(--border-soft)]">
          <iframe
            src="https://www.instagram.com/aesthetichomes_in/embed"
            className="h-full w-full border-0"
            loading="lazy"
            title={`${PARENT_ORG_NAME} and HomeFix interior projects in Chennai on Instagram`}
          />
        </div>
        <a
          href="https://instagram.com/aesthetichomes_in"
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex text-[11px] sm:text-xs font-medium text-[var(--accent-primary)] hover:underline"
        >
          Open on Instagram →
        </a>
      </div>
    </section>
  );
}

export default InstagramEmbedCard;
