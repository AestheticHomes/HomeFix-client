// components/home/YoutubeEmbedCard.tsx
"use client";

import Link from "next/link";

// ✅ Only the video ID, NOT the full URL
const FEATURED_VIDEO_ID = "_-kZCNBXUk8";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@AestheticHomes_in";

export default function YoutubeEmbedCard() {
  return (
    <section aria-labelledby="youtube-showcase-heading" className="h-full">
      <div
        className="
          h-full rounded-3xl border border-[var(--border-subtle)]
          bg-[var(--surface-card)] shadow-[0_18px_45px_rgba(15,23,42,0.12)]
          px-4 py-4 sm:px-5 sm:py-5
          flex flex-col gap-3
        "
      >
        <header className="flex items-center justify-between gap-3">
          <h2
            id="youtube-showcase-heading"
            className="text-sm sm:text-base font-semibold text-[var(--text-primary)]"
          >
            Watch our interior projects on YouTube
          </h2>
          <Link
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] sm:text-xs font-medium text-[var(--accent-primary)] hover:underline"
          >
            Open channel →
          </Link>
        </header>

        <p className="text-xs sm:text-[13px] text-[var(--text-muted)]">
          Site progress, full home interiors and behind-the-scenes work by
          AestheticHomes &amp; HomeFix in Chennai.
        </p>

        <p className="text-xs sm:text-[13px] text-[var(--text-muted)]">
          Chennai interior projects: modular kitchens, wardrobes and full home interiors documented on site.
        </p>

        <div className="mt-1 rounded-2xl overflow-hidden border border-[var(--border-soft)] bg-black">
          <div className="relative w-full aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${FEATURED_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${FEATURED_VIDEO_ID}&controls=0&rel=0&modestbranding=1&playsinline=1`}
              title="HomeFix & AestheticHomes interior work on YouTube"
              loading="lazy"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
