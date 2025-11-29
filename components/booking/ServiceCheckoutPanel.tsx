"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useServiceCartStore } from "@/components/store/cartStore";
import { resolveCartConflict } from "@/components/store/cartGuards";

type ServiceInfo = {
  id: number;
  title: string;
  description?: string;
  price?: number;
  unit?: string;
  image_url?: string;
  slug?: string;
};

type ServiceCheckoutPanelProps = {
  service: ServiceInfo;
  bookingType?: "consultation" | "site-visit";
  onAdd?: (service: ServiceInfo) => void;
};

export default function ServiceCheckoutPanel({
  service,
  bookingType,
  onAdd,
}: ServiceCheckoutPanelProps) {
  const router = useRouter();
  const addItem = useServiceCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!resolveCartConflict("service")) return;

    addItem({
      id: service.id,
      title: service.title,
      price: Number(service.price) || 0,
      unit: service.unit,
      image_url: service.image_url,
      slug: service.slug,
      quantity: 1,
      type: "service",
    });

    onAdd?.(service);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const checkoutHref = `/checkout?type=service${service.slug ? `&service=${service.slug}` : ""}${bookingType ? `&bookingType=${bookingType}` : ""}`;

  return (
    <div className="space-y-4">
      <motion.div
        className="py-4 border-t border-slate-200 dark:border-slate-700 mt-2 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 mb-4">
          <li>✅ Labor included</li>
          <li>❌ Materials not included</li>
          <li>🕐 Avg duration: 1–2 hrs</li>
          <li>👷 Certified HomeFix Professionals</li>
        </ul>
        <p className="font-semibold text-slate-800 dark:text-white">
          ₹{service.price ?? 0} / {service.unit || "unit"}
        </p>
      </motion.div>

      <AnimatePresence>
        {!added ? (
          <motion.button
            key="add"
            onClick={handleAddToCart}
            whileTap={{ scale: 0.96 }}
            className="w-full bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF] text-white py-2 rounded-lg font-medium shadow hover:opacity-90 transition"
          >
            Confirm &amp; Go to Checkout
          </motion.button>
        ) : (
          <motion.div
            key="added"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center space-y-2"
          >
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle2 className="w-5 h-5" /> Added to Cart
            </div>
            <button
              onClick={() => router.push(checkoutHref)}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              Proceed to Checkout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
