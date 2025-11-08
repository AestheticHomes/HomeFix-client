"use client";
/**
 * File: MiniMapPreview.tsx
 * Version: v1.0 — Aurora+ Companion 🌍
 * Author: Edith 🪶 for Jagadish
 *
 * Purpose:
 * ✅ Lightweight static Google Map preview for bookings
 * ✅ Visual validation of stored addresses
 * ✅ Zero controls, optimized for performance
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface MiniMapPreviewProps {
  location: { lat: number; lng: number };
  address?: string;
  verified?: boolean;
  height?: number; // default: 160
}

export default function MiniMapPreview({
  location,
  address = "Service Location",
  verified = true,
  height = 160,
}: MiniMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setReady(true);
      return;
    }

    const existing = document.getElementById("gmap-script");
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "gmap-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const g = window.google;
    if (!g?.maps) return;

    const map = new g.maps.Map(mapRef.current, {
      center: location,
      zoom: 15,
      disableDefaultUI: true,
      gestureHandling: "none",
      draggable: false,
      keyboardShortcuts: false,
      clickableIcons: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });

    // Marker glow
    new g.maps.Marker({
      position: location,
      map,
      icon: {
        path: g.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#5A5DF0",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#EC6ECF",
      },
    });
  }, [ready, location]);

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm"
      style={{ height }}
    >
      {!ready ? (
        <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
          Loading map…
        </div>
      ) : (
        <div ref={mapRef} className="absolute inset-0" />
      )}

      {/* Floating address footer */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-1 left-1 right-1 bg-white/85 dark:bg-slate-900/80 
                   backdrop-blur-md rounded-lg px-2 py-1 text-[11px] text-gray-700 dark:text-gray-300
                   shadow-sm flex items-center justify-between gap-2"
      >
        <span className="truncate">{address}</span>
        {verified && (
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-emerald-600 dark:text-emerald-400 text-[10px] font-medium"
          >
            ✓ Verified
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
