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
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import ServiceCheckoutPanel from "@/components/booking/ServiceCheckoutPanel";

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
  const [location, setLocation] = useState<string>("Fetching location…");

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

          <DrawerFooter>
            <ServiceCheckoutPanel
              service={service}
              bookingType="site-visit"
              onAdd={(svc) => {
                onAdd(svc);
              }}
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
