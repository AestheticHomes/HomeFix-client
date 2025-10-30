"use client";
/// <reference types="react" />

/**
 * File: /app/page.tsx
 * Project: HomeFix India — v3.3 Parallax Flow Edition
 * Author: Edith 🪶 for Jagadish Ramaswamy
 *
 * - Cinematic homepage with shimmer preload
 * - Cascading service Lotties
 * - Parallax DIY & CTA sections
 * - Smooth dark/light transitions
 */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import InstallFAB from "@/components/InstallFAB";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import fixAnim from "./animations/fix.json";
import interiorAnim from "./animations/interior.json";
import paintAnim from "./animations/paint.json";
import electricAnim from "./animations/electric.json";
import diyAnim from "./animations/diy.json";
import civilAnim from "./animations/civil.json";

/* -------------------------------------------------------------------------- */
/* 🎞 SHIMMER COMPONENT                                                       */
/* -------------------------------------------------------------------------- */
interface ShimmerProps {
  height?: string;
}

const Shimmer = ({ height }: ShimmerProps): React.ReactElement => (
  <div
    className="relative overflow-hidden bg-gray-200 dark:bg-slate-700 rounded-xl"
    style={{ height: height || "100%" }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
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
/* 🎬 HERO VIDEO SEQUENCE                                                     */
/* -------------------------------------------------------------------------- */
function HeroVideoSequence(): React.ReactElement {
  const localRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<"local" | "youtube">("local");
  const [ytReady, setYtReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = localRef.current;
    if (!video) return;

    const tryPlay = async () => {
      video.src =
        "https://videos.pexels.com/video-files/857195/857195-hd_1920_1080_30fps.mp4";
      video.muted = true;
      video.playsInline = true;
      try {
        await video.play();
        setLoaded(true);
        setBlocked(false);
      } catch {
        setStage("youtube");
        setBlocked(true);
      }
    };

    tryPlay();
    return () => video.pause();
  }, []);

  useEffect(() => {
    setTransitionPhase(true);
    const t = setTimeout(() => setTransitionPhase(false), 1000);
    return () => clearTimeout(t);
  }, [stage]);

  const handleManualPlay = async (): Promise<void> => {
    const v = localRef.current;
    if (!v) return;
    try {
      v.muted = false;
      await v.play();
      setBlocked(false);
    } catch {
      setStage("youtube");
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="hero-shimmer"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-20"
          >
            <Shimmer />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {stage === "local" ? (
          <motion.video
            key="local"
            ref={localRef}
            onCanPlay={() => setLoaded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute top-1/2 left-1/2 w-[160%] md:w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
            loop
            playsInline
            muted
            preload="auto"
            poster="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
          />
        ) : (
          <motion.div
            key="youtube"
            initial={{ opacity: 0 }}
            animate={{ opacity: ytReady ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <iframe
              id="homefix-yt"
              onLoad={() => {
                setYtReady(true);
                setLoaded(true);
              }}
              src="https://www.youtube.com/embed/4HW_ymYfC2I?autoplay=1&mute=1&controls=0&loop=1&playlist=4HW_ymYfC2I&modestbranding=1&showinfo=0"
              title="HomeFix India Cinematic Reel"
              className="absolute top-1/2 left-1/2 w-[160%] md:w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: transitionPhase ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />

      {blocked && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={handleManualPlay}
            className="w-16 h-16 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-lg"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧠 LAZY YOUTUBE EMBED                                                      */
/* -------------------------------------------------------------------------- */
interface LazyYouTubeProps {
  src: string;
  title: string;
}

function LazyYouTube({ src, title }: LazyYouTubeProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
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
      className="relative rounded-2xl shadow-xl w-full md:w-[560px] aspect-video bg-black overflow-hidden"
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
            sizes="(max-width:768px) 100vw, 560px"
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
export default function HomePage(): React.ReactElement {
  const heroRef = useRef<HTMLDivElement>(null);
  const diyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // 🌈 Scroll motion hooks
  const { scrollY } = useScroll();
  const diyY = useSpring(useTransform(scrollY, [0, 800], [0, -100]), {
    stiffness: 60,
    damping: 15,
  });
  const ctaBgY = useSpring(useTransform(scrollY, [800, 1800], [0, -60]), {
    stiffness: 60,
    damping: 15,
  });

  return (
    <div className="flex flex-col items-center overflow-x-hidden bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 w-full">
      {/* 🎬 HERO SECTION */}
      <section
        ref={heroRef}
        className="relative w-full h-[70vh] md:h-[78vh] flex justify-center items-center overflow-hidden"
      >
        <HeroVideoSequence />
        <motion.div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        <motion.div className="absolute top-0 left-0 w-2/3 h-full bg-gradient-to-r from-yellow-200/10 via-yellow-100/20 to-transparent blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="relative z-10 text-center text-white px-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Welcome to HomeFix India
          </h1>
          <p className="text-lg md:text-xl mb-6 text-gray-200 max-w-2xl mx-auto">
            Where craftsmanship meets technology — interiors, repairs, and DIY tools built on trust.
          </p>
          <Link
            href="/checkout"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition"
          >
            Book a Service
          </Link>
        </motion.div>
      </section>

      {/* 🧩 SERVICES */}
      <section className="py-20 px-4 grid gap-8 md:grid-cols-3 max-w-6xl w-full">
        {[fixAnim, interiorAnim, paintAnim, electricAnim, diyAnim, civilAnim].map(
          (anim, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className="relative w-28 h-28 mb-2">
                  <Shimmer height="112px" />
                  <Lottie animationData={anim} loop autoplay className="absolute inset-0" />
                </div>
                <h3 className="text-xl font-semibold mt-2">Service #{i + 1}</h3>
                <p className="text-gray-600 dark:text-slate-300 mt-1">
                  Crafted with precision and care.
                </p>
              </div>
            </motion.div>
          )
        )}
      </section>

      {/* 🛠 DIY PARALLAX SECTION */}
      <motion.section
        ref={diyRef}
        style={{ y: diyY }}
        className="relative bg-gray-100 dark:bg-slate-800 py-24 w-full px-4 transition-colors duration-500"
      >
        <h2 className="text-3xl font-bold text-center mb-10">DIY Inspirations</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <LazyYouTube src="https://www.youtube.com/embed/DeSDjjicGWY" title="DIY Project Ideas" />
          <LazyYouTube src="https://www.youtube.com/embed/RvZyB4ZK0dI" title="HomeFix Project Reel" />
        </div>
      </motion.section>

      {/* 🌇 CTA PARALLAX SECTION */}
      <motion.section
        ref={ctaRef}
        style={{ y: ctaBgY }}
        className="relative w-full h-[45vh] flex flex-col items-center justify-center text-center bg-[url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-white">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <Link
            href="/checkout"
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-white font-semibold"
          >
            Book Your Service Now
          </Link>
        </div>
      </motion.section>

      <InstallFAB />
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-slate-700 w-full">
        © {new Date().getFullYear()} HomeFix India · Built with ❤️ in Chennai
      </footer>
    </div>
  );
}
