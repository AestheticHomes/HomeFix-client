"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function PriceHUD() {
  const [price, setPrice] = useState(0);

  useEffect(() => {
    // Example live counter
    const timer = setInterval(() => setPrice((p) => (p < 120000 ? p + 2000 : p)), 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute right-6 bottom-6 px-5 py-3 rounded-2xl bg-black text-white text-lg font-semibold shadow-lg select-none"
    >
      ₹ {price.toLocaleString()} / est.
    </motion.div>
  );
}
