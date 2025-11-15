"use client";
/**
 * =============================================================
 * File: components/ui/ServiceCartDrawer.tsx
 * Module: 🛒 HomeFix Service Cart Drawer v3.5 (Aurora+)
 * -------------------------------------------------------------
 * ✅ Integrated with Zustand cartStore (persistent cart)
 * ✅ Safe geolocation + reverse lookup (OpenStreetMap)
 * ✅ Animated feedback (added ✓ confirmation)
 * ✅ Includes “Proceed to Checkout” shortcut post-add
 * ✅ Compatible with both mobile & desktop drawers
 * =============================================================
 */

import { UniversalHeader } from "@/components/layout";
import { useServiceCartStore } from "@/components/store/cartStore";
import { resolveCartConflict } from "@/components/store/cartGuards";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------
   📦 Types
------------------------------------------------------------ */
interface Service {
  id: number;
  title: string;
  description?: string;
  price?: number;
  unit?: string;
  category?: string;
  image_url?: string;
  slug?: string;
}

interface ServiceCartDrawerProps {
  service: Service | null;
  open: boolean;
  onClose: (open: boolean) => void;
  onAdd: (service: Service) => void;
}

/* ------------------------------------------------------------
   🧱 Component
------------------------------------------------------------ */
export default function ServiceCartDrawer({
  service,
  open,
  onClose,
  onAdd,
}: ServiceCartDrawerProps) {
  const router = useRouter();
  const { addItem } = useServiceCartStore();
  const [location, setLocation] = useState<string>("Fetching location…");
  const [added, setAdded] = useState(false);

  /* ------------------------------------------------------------
     🧭 Auto-detect user’s city (OpenStreetMap)
  ------------------------------------------------------------ */
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            setLocation(data.address?.city || "Your Area");
          } catch {
            setLocation("Location unavailable");
          }
        },
        () => setLocation("Location access denied")
      );
    }
  }, []);

  if (!service) return null;

  /* ------------------------------------------------------------
     🛒 Add item handler
  ------------------------------------------------------------ */
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
    });
    onAdd(service);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  /* ------------------------------------------------------------
     🧩 Drawer Layout
  ------------------------------------------------------------ */
  return (
    <>
      <UniversalHeader />

      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent className="bg-white dark:bg-slate-900 rounded-t-3xl overflow-hidden shadow-xl">
          {/* Header */}
          <DrawerHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]">
                {service.title}
              </DrawerTitle>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                📍 {location}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {service.description ||
                "Professional service handled by verified HomeFix experts."}
            </p>
          </DrawerHeader>

          {/* Details */}
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
              ₹{service.price} / {service.unit || "unit"}
            </p>
          </motion.div>

          {/* Footer Buttons */}
          <DrawerFooter>
            <AnimatePresence>
              {!added ? (
                <motion.button
                  key="add"
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.96 }}
                  className="w-full bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF] 
                             text-white py-2 rounded-lg font-medium shadow hover:opacity-90 transition"
                >
                  Add to Cart
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
                    onClick={() => router.push("/checkout?type=service")}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                  >
                    Proceed to Checkout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
