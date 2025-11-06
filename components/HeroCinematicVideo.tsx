/* -------------------------------------------------------------------------- */
/* 🎥 CINEMATIC HERO — delayed autoplay + scroll pause                        */
/* -------------------------------------------------------------------------- */
import { useEffect, useRef } from "react";
import { useScroll, motion, useMotionValueEvent } from "framer-motion";

export function HeroCinematicVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();
  const startedRef = useRef(false);

  // 🎞 autoplay after 20 s
  useEffect(() => {
    const timer = setTimeout(() => {
      const v = videoRef.current;
      if (v && !startedRef.current) {
        v.play().catch(() => {});
        startedRef.current = true;
      }
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  // ⏸ pause/resume on scroll
  useMotionValueEvent(scrollY, "change", (y) => {
    const v = videoRef.current;
    if (!v) return;
    if (y > 200 && !v.paused) v.pause();
    else if (y <= 200 && v.paused && startedRef.current) v.play().catch(() => {});
  });

  return (
    <section className="relative w-full h-[75vh] overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        poster="https://images.pexels.com/photos/3815582/pexels-photo-3815582.jpeg"
      >
        <source
          src="https://videos.pexels.com/video-files/5471927/5471927-uhd_2560_1440_25fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* gradient overlays */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* headline */}
      <div className="relative z-10 text-center text-white px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-bold drop-shadow-lg"
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
    </section>
  );
}
