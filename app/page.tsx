"use client";
/**
 * =============================================================
 * HomePage v4.2 — Gemini Unified Theme 🌗
 * -------------------------------------------------------------
 * ✅ True theme sync (no hardcoded gray/surface colors)
 * ✅ Brand gradients kept (#5A5DF0 → #EC6ECF)
 * ✅ Smooth transitions & shimmer maintained
 * ✅ Works with global CSS variables (v6.1+)
 * =============================================================
 */

import InstallFAB from "@/components/InstallFAB";
import Footer from "@/components/ui/Footer";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// 🎬 Local animations
import civilAnim from "./animations/civil.json";
import diyAnim from "./animations/diy.json";
import electricAnim from "./animations/electric.json";
import fixAnim from "./animations/fix.json";
import interiorAnim from "./animations/interior.json";
import paintAnim from "./animations/paint.json";

/* -------------------------------------------------------------------------- */
/* 🌈 SHIMMER                                                                 */
/* -------------------------------------------------------------------------- */
const Shimmer = ({ height = "100%" }: { height?: string }) => (
  <div
    className="relative overflow-hidden rounded-xl bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]"
    style={{ height }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
    <style jsx>{`
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
    `}</style>
  </div>
);

/* -------------------------------------------------------------------------- */
/* 🎞 HERO VIDEO — Cinematic Woodworking + Smart Autoplay                     */
/* -------------------------------------------------------------------------- */
function HeroVideoSequence() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();
  const [loaded, setLoaded] = useState(false);
  const startedRef = useRef(false);
  const promos = [
    {
      id: "summer-refresh",
      badge: "Offer",
      title: "Summer interior refresh",
      subtitle: "Save up to 20% on modular kitchens.",
    },
    {
      id: "visit-free",
      badge: "Free Visit",
      title: "No-cost site inspection",
      subtitle: "Pay only if you decline the quotation.",
    },
    {
      id: "studio-preview",
      badge: "Preview",
      title: "Studio sneak peek",
      subtitle: "Early access to upcoming design tools.",
    },
  ];
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
    const handleLoadedMetadata = () => {
      try {
        if (v.duration && v.duration > 35) {
          v.currentTime = 30;
        }
      } catch {
        // ignore
      }
    };
    v.addEventListener("loadedmetadata", handleLoadedMetadata);
    v.load();
    v.play()
      .then(() => {
        startedRef.current = true;
      })
      .catch(() => {
        // autoplay may be blocked; leave video paused without showing a button
      });
    return () => {
      v.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const v = videoRef.current;
      if (v && !startedRef.current) {
        v.play().catch(() => {
          // ignore repeat autoplay errors
        });
        startedRef.current = true;
      }
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollY.onChange((y: number) => {
      const v = videoRef.current;
      if (!v) return;
      if (y > 200 && !v.paused) v.pause();
      else if (y <= 200 && v.paused && startedRef.current)
        v.play().catch(() => {});
    });
    return () => unsubscribe();
  }, [scrollY]);

  useEffect(() => {
    if (promos.length <= 1) return;
    const id = setInterval(
      () =>
        setPromoIndex((prev) => {
          const next = prev + 1;
          return next >= promos.length ? 0 : next;
        }),
      8000
    );
    return () => clearInterval(id);
  }, [promos.length]);

  return (
    <section className="relative w-full h-[75vh] flex items-center justify-center overflow-hidden">
      {!loaded && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-10"
        >
          <Shimmer />
        </motion.div>
      )}

      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        autoPlay
        onCanPlay={() => setLoaded(true)}
        poster="https://images.pexels.com/photos/3815582/pexels-photo-3815582.jpeg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://videos.pexels.com/video-files/5471927/5471927-uhd_2560_1440_25fps.mp4"
          type="video/mp4"
        />
      </video>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, color-mix(in srgb, var(--hero-overlay-top) 30%, transparent) 0%, color-mix(in srgb, var(--hero-overlay-mid) 20%, transparent) 55%, transparent 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
      />

      {/* Promo slider */}
      <div className="absolute top-6 inset-x-0 flex justify-center px-4 z-30">
        <motion.div
          key={promos[promoIndex].id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-3 rounded-2xl border border-[var(--border-soft)]
                     bg-[var(--surface-panel)]/95 dark:bg-[var(--surface-panel-dark)]/95
                     px-4 py-2 shadow-sm"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {promos[promoIndex].badge}
          </span>
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]">
              {promos[promoIndex].title}
            </span>
            <span className="hidden sm:inline text-[11px] text-[var(--text-secondary)]">
              {promos[promoIndex].subtitle}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="relative z-20 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-bold
                     text-[var(--text-hero)]
                     drop-shadow-[0_10px_30px_rgba(0,0,0,0.75)]"
        >
          Crafted by Hand, Perfected by HomeFix
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl mt-4 text-[var(--text-hero)]/90"
        >
          Experience the art of modern woodworking and precision design.
        </motion.p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧩 LAZY YOUTUBE                                                            */
/* -------------------------------------------------------------------------- */
function LazyYouTube({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const videoId = src.split("/embed/")[1]?.split("?")[0];
  const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const hasQuery = src.includes("?");
  const embedSrc = `${src}${
    hasQuery ? "&" : "?"
  }start=30&autoplay=1&mute=1&rel=0`;

  return (
    <div
      ref={ref}
      className="relative rounded-2xl overflow-hidden w-full md:w-[560px] aspect-video bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)] shadow-xl"
    >
      {!loaded && <Shimmer />}
      {visible ? (
        <iframe
          className="w-full h-full"
          src={embedSrc}
          title={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          <Image
            src={thumb}
            alt={title}
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              aria-label={`Play ${title}`}
              className="w-16 h-16 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-lg"
            >
              ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🏠 HOMEPAGE MAIN                                                          */
/* -------------------------------------------------------------------------- */
export default function HomePage() {
  const { scrollY } = useScroll();
  const diyY = useSpring(useTransform(scrollY, [0, 800], [0, -60]), {
    stiffness: 60,
    damping: 15,
  });
  const ctaY = useSpring(useTransform(scrollY, [800, 1800], [0, -80]), {
    stiffness: 60,
    damping: 15,
  });

  return (
    <div
      className="relative flex flex-col items-stretch overflow-x-hidden w-full
                 bg-[var(--surface-base)]
                 text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]
                 transition-colors duration-500 isolate"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 transition-colors duration-500"
        style={{
          background:
            "radial-gradient(circle at 18% 12%, var(--section-sheen) 0%, transparent 55%), radial-gradient(circle at 80% 0%, var(--section-veil) 0%, transparent 70%)",
        }}
      />
      {/* HERO */}
      <HeroVideoSequence />

      {/* SERVICES */}
      <section
        className="relative pt-16 md:pt-20 pb-24 px-4 w-full
                         bg-[var(--surface-base)] transition-colors duration-500"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, var(--section-sheen) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-32 -z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(0deg, var(--section-veil) 0%, transparent 100%)",
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto mb-10 text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Services
          </p>
          <h2 className="text-3xl font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
            Everything your home needs, in one orbit.
          </h2>
          <p className="text-sm text-[var(--text-subtle)] max-w-2xl mx-auto">
            From quick repairs to full interior makeovers, explore curated
            services powered by the Edith Universe.
          </p>
        </div>

        <div className="relative z-10 grid gap-8 md:grid-cols-3 w-full max-w-6xl mx-auto">
          {[
            {
              name: "Home Repairs",
              tagline: "Quick Fixes & Maintenance",
              anim: fixAnim,
            },
            {
              name: "Interior Design",
              tagline: "Modern Modular Spaces",
              anim: interiorAnim,
            },
            {
              name: "Painting & Finishes",
              tagline: "Vibrant Walls, Lasting Impressions",
              anim: paintAnim,
            },
            {
              name: "Electrical Works",
              tagline: "Safe & Smart Wiring",
              anim: electricAnim,
            },
            {
              name: "DIY Inspirations",
              tagline: "Learn, Build, Create",
              anim: diyAnim,
            },
            {
              name: "Civil & Renovation",
              tagline: "Foundations & Transformations",
              anim: civilAnim,
            },
          ].map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="relative group rounded-2xl overflow-hidden
                       bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                       shadow-lg hover:shadow-2xl border border-[var(--border-soft)]
                       hover:border-[var(--accent-tertiary)]/60
                       transition-all duration-500"
            >
              <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 blur-2xl" />
              <div className="relative p-6 flex flex-col items-center text-center z-10">
                <div className="relative w-28 h-28 mb-2">
                  <Lottie
                    animationData={s.anim}
                    loop
                    autoplay
                    className="absolute inset-0"
                  />
                </div>
                <h3 className="text-xl font-semibold mt-2 text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]">
                  {s.name}
                </h3>
                <p className="text-sm mt-1 text-[var(--text-secondary)]">
                  {s.tagline}
                </p>
              </div>
              <motion.div
                className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                layoutId={`border-${i}`}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* DIY SECTION */}
      <motion.section
        style={{ y: diyY }}
        className="relative py-24 w-full px-4 transition-colors duration-500
                   bg-[var(--surface-base)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 15% 25%, var(--section-sheen) 0%, transparent 60%), radial-gradient(circle at 85% 30%, var(--section-veil) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center mb-10 text-[var(--accent-primary)] dark:text-[var(--accent-secondary)]">
            DIY Inspirations
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <LazyYouTube
              src="https://www.youtube.com/embed/DeSDjjicGWY"
              title="DIY Project Ideas"
            />
            <LazyYouTube
              src="https://www.youtube.com/embed/S9dvDU5RmQU"
              title="HomeFix Project Reel"
            />
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        style={{ y: ctaY }}
        className="relative w-full h-[45vh] flex flex-col items-center justify-center text-center bg-[url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg')] bg-cover bg-center"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--hero-overlay-top) 25%, transparent) 0%, color-mix(in srgb, var(--hero-overlay-mid) 20%, transparent) 45%, color-mix(in srgb, var(--overlay-cta) 80%, transparent) 100%)",
          }}
        />
        <div className="relative z-10 text-white px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <Link
            href="/checkout"
            className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg
                       bg-[var(--accent-success)] hover:bg-[var(--accent-success-hover)]
                       transition-colors duration-200"
          >
            Book Your Service Now
          </Link>
        </div>
      </motion.section>

      <InstallFAB />
      <Footer />
    </div>
  );
}
