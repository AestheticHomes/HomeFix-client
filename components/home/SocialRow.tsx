"use client";

import { motion } from "framer-motion";

import InstagramEmbedCard from "@/components/home/InstagramEmbedCard";
import YoutubeEmbedCard from "@/components/home/YoutubeEmbedCard";

const staggerParent = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const childItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const hoverLift = {
  whileHover: {
    y: -4,
    scale: 1.01,
    transition: { type: "spring", stiffness: 220, damping: 18 },
  },
};

export default function SocialRow() {
  return (
    <section
      aria-label="HomeFix social proof – interior projects on YouTube and Instagram"
      className="mt-2"
    >
      <motion.div
        className="flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          className="min-w-[70%] snap-center md:min-w-0 md:w-1/2"
          variants={childItem}
          {...hoverLift}
        >
          <YoutubeEmbedCard />
        </motion.div>
        <motion.div
          className="min-w-[70%] snap-center md:min-w-0 md:w-1/2"
          variants={childItem}
          {...hoverLift}
        >
          <InstagramEmbedCard />
        </motion.div>
      </motion.div>
    </section>
  );
}
