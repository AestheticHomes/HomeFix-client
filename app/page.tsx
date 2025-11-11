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
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
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
  const [blocked, setBlocked] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
    v.load();
    v.play().catch(() => setBlocked(true));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const v = videoRef.current;
      if (v && !startedRef.current) {
        v.play().catch(() => setBlocked(true));
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
        className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
      />

      <div className="relative z-20 text-center text-white px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-bold drop-shadow-xl"
        >
          Crafted by Hand, Perfected by HomeFix
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl mt-4 text-gray-200"
        >
          Experience the art of modern woodworking and precision design.
        </motion.p>
      </div>

      {blocked && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <button
            onClick={() => {
              const v = videoRef.current;
              if (v) {
                v.muted = true;
                v.play().catch(() => null);
                setBlocked(false);
                startedRef.current = true;
              }
            }}
            className="w-16 h-16 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-lg hover:scale-110 transition"
          >
            ▶
          </button>
        </div>
      )}
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

  return (
    <div
      ref={ref}
      className="relative rounded-2xl overflow-hidden w-full md:w-[560px] aspect-video bg-[var(--surface-dark)] shadow-xl"
    >
      {!loaded && <Shimmer />}
      {visible ? (
        <iframe
          className="w-full h-full"
          src={src}
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
  const diyY = useSpring(useTransform(scrollY, [0, 800], [0, -120]), {
    stiffness: 60,
    damping: 15,
  });
  const ctaY = useSpring(useTransform(scrollY, [800, 1800], [0, -80]), {
    stiffness: 60,
    damping: 15,
  });

  return (
    <div
      className="flex flex-col items-center overflow-x-hidden w-full 
                    bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]
                    text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]
                    transition-colors duration-500"
    >
      {/* HERO */}
      <HeroVideoSequence />

      {/* SERVICES */}
      <section className="py-20 px-4 grid gap-8 md:grid-cols-3 max-w-6xl w-full">
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
            whileHover={{ scale: 1.05 }}
            className="relative group rounded-2xl overflow-hidden
                       bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]
                       shadow-lg hover:shadow-2xl border border-transparent hover:border-[#9B5CF8]/40
                       transition-all duration-500"
          >
            <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#5A5DF0]/10 to-[#EC6ECF]/10 blur-2xl" />
            <div className="relative p-6 flex flex-col items-center text-center z-10">
              <div className="relative w-28 h-28 mb-2">
                <Lottie
                  animationData={s.anim}
                  loop
                  autoplay
                  className="absolute inset-0"
                />
              </div>
              <h3 className="text-xl font-semibold mt-2 text-[#5A5DF0] dark:text-[#EC6ECF]">
                {s.name}
              </h3>
              <p className="text-sm mt-1 opacity-80">{s.tagline}</p>
            </div>
            <motion.div
              className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF]"
              layoutId={`border-${i}`}
            />
          </motion.div>
        ))}
      </section>

      {/* DIY SECTION */}
      <motion.section
        style={{ y: diyY }}
        className="relative py-24 w-full px-4 transition-colors duration-500
                   bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]"
      >
        <h2 className="text-3xl font-bold text-center mb-10 text-[#5A5DF0] dark:text-[#EC6ECF]">
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
      </motion.section>

      {/* CTA */}
      <motion.section
        style={{ y: ctaY }}
        className="relative w-full h-[45vh] flex flex-col items-center justify-center text-center bg-[url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-black/60" />
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
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-white font-semibold shadow-lg"
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
