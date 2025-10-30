"use client";
/**
 * File: MapPicker.tsx
 * Version: v3.4.1 — Aurora+ Memory & Smart Search Edition 🌍
 * Author: Edith 🪶 for Jagadish
 *
 * Fixes:
 * ✅ TS strict safety (no 'possibly undefined' errors)
 * ✅ Safer geocode + center guards
 * ✅ Fully typed with google.maps namespace
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

declare global {
  interface Window {
    google: typeof google;
  }
}

/* ---------- Types ---------- */
export interface MapPickerProps {
  initialLocation?: { lat: number; lng: number };
  onLocationChange?: (
    loc: { lat: number; lng: number },
    addr: string,
  ) => void;
  editable?: boolean;
}

/* ---------- Component ---------- */
export default function MapPicker({
  initialLocation = { lat: 13.0827, lng: 80.2707 },
  onLocationChange,
  editable = true,
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [center, setCenter] = useState(initialLocation);
  const [address, setAddress] = useState("Fetching address...");
  const [locating, setLocating] = useState(false);

  /* 🌐 Async load Google Maps */
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsReady(true);
      return;
    }

    const existing = document.getElementById("gmap-script");
    if (existing) {
      existing.addEventListener("load", () => setIsReady(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "gmap-script";
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsReady(true);
    document.head.appendChild(script);
  }, []);

  /* 📍 Restore last known location */
  useEffect(() => {
    const saved = localStorage.getItem("lastLocation");
    if (saved) {
      try {
        const loc = JSON.parse(saved);
        if (loc?.coords) setCenter(loc.coords);
        if (loc?.address) setAddress(loc.address);
      } catch (err) {
        console.warn("⚠️ Invalid cached location:", err);
      }
    }
  }, []);

  /* 🗺️ Initialize Map + Dark mode style */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const g = window.google;
    if (!g?.maps) return;

    const darkMode = document.documentElement.classList.contains("dark");

    const darkMapStyle: google.maps.MapTypeStyle[] = [
      { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0e1626" }],
      },
    ];

    geocoderRef.current = new g.maps.Geocoder();
    const m = new g.maps.Map(mapRef.current, {
      center: center,
      zoom: 16,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      gestureHandling: editable ? "greedy" : "none",
      draggable: editable,
      zoomControl: editable,
      styles: darkMode ? darkMapStyle : undefined,
    });

    /* 🧭 Idle (center moved) listener */
    m.addListener("idle", () => {
      const c = m.getCenter();
      if (!c) return; // ✅ Guard for null center

      const loc = { lat: c.lat(), lng: c.lng() };
      setCenter(loc);

      const geocoder = geocoderRef.current;
      if (!geocoder) return; // ✅ Guard for null geocoder

      geocoder.geocode(
        { location: loc },
        (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus,
        ) => {
          if (status === "OK" && Array.isArray(results) && results.length > 0) {
            const addr = results[0].formatted_address ?? "Unknown location";
            setAddress(addr);
            onLocationChange?.(loc, addr);
            localStorage.setItem(
              "lastLocation",
              JSON.stringify({ coords: loc, address: addr }),
            );
          }
        },
      );
    });

    /* 🔍 Attach Autocomplete */
    if (searchRef.current) {
      autocompleteRef.current = new g.maps.places.Autocomplete(
        searchRef.current,
        {
          fields: ["geometry", "formatted_address"],
          componentRestrictions: { country: "in" },
        },
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current!.getPlace();
        if (place.geometry?.location) {
          const loc = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          m.panTo(loc);
          m.setZoom(17);
          setCenter(loc);
          setAddress(place.formatted_address || "Unnamed location");
          localStorage.setItem(
            "lastLocation",
            JSON.stringify({ coords: loc, address: place.formatted_address }),
          );
          onLocationChange?.(loc, place.formatted_address || "");
        }
      });
    }

    setMap(m);
  }, [isReady, editable]);

  /* 📡 Locate Me */
  const locateMe = () => {
    if (!map) return;
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your device");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        map.panTo(coords);
        map.setZoom(17);
        setCenter(coords);
        setLocating(false);
        navigator.vibrate?.(50);
      },
      (err) => {
        console.warn("⚠️ GPS Error:", err);
        alert("Unable to access location");
        setLocating(false);
      },
    );
  };

  /* 🪶 UI Render */
  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-neutral-700">
      {!isReady
        ? (
          <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm">
            🗺️ Initializing Google Maps...
          </div>
        )
        : (
          <>
            {/* Map Layer */}
            <div ref={mapRef} className="absolute inset-0" />

            {/* 🔍 Search Bar */}
            {editable && (
              <motion.input
                ref={searchRef}
                type="text"
                placeholder="Search location..."
                className="absolute top-3 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] rounded-full px-4 py-2 text-sm shadow-md bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border border-gray-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}

            {/* 📍 Center Animated Pin */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[70%] pointer-events-none"
              animate={{ y: [0, -6, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
                ease: "easeInOut",
              }}
            >
              <div className="relative">
                <div className="w-5 h-5 bg-emerald-600 rounded-full shadow-md ring-4 ring-emerald-300/40" />
                <motion.div
                  className="absolute left-1/2 top-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 bg-emerald-400/25 rounded-full blur-lg"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.3, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
            </motion.div>

            {/* 🛰️ Floating FAB */}
            {editable && (
              <motion.button
                onClick={locateMe}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`absolute bottom-24 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center 
                bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-gray-300 
                hover:bg-emerald-600 hover:text-white transition-all ${
                  locating ? "animate-pulse bg-emerald-600 text-white" : ""
                }`}
              >
                {locating ? "🧭" : "📍"}
              </motion.button>
            )}

            {/* 🪟 Glass Address Footer */}
            <AnimatePresence>
              {address && (
                <motion.div
                  key={address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-2 left-2 right-2 bg-white/85 dark:bg-neutral-900/80 backdrop-blur-md rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300 shadow-md"
                >
                  <p className="truncate">
                    <strong>📍 {address}</strong>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
    </div>
  );
}
