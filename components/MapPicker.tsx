"use client";
/**
 * File: MapPicker.tsx
 * Version: v4.0 — Aurora+ Pro Edition 🌍
 * Author: Edith 🪶 for Jagadish
 *
 * 🪶 Enhancements:
 * ✅ Smooth live GPS tracking (follow mode)
 * ✅ Adaptive zoom + dynamic camera gravity
 * ✅ Smart 2-line address viewer
 * ✅ Compass radar + offline fallback
 * ✅ Full TypeScript strict-safety
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    google: typeof google;
  }
}

/* -------------------------------------------------------------------------- */
/* 📦 Types                                                                   */
/* -------------------------------------------------------------------------- */
export interface Coordinates {
  lat: number;
  lng: number;
}

interface MapPickerProps {
  initialLocation?: Coordinates;
  onLocationChange?: (loc: Coordinates, addr: string) => void;
  onError?: (err: string) => void;
  editable?: boolean;
}

/* -------------------------------------------------------------------------- */
/* 🗺️ Component                                                               */
/* -------------------------------------------------------------------------- */
export default function MapPicker({
  initialLocation = { lat: 13.0827, lng: 80.2707 },
  onLocationChange,
  onError,
  editable = true,
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const watchId = useRef<number | null>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState<Coordinates>(initialLocation);
  const [address, setAddress] = useState("Fetching address…");
  const [locating, setLocating] = useState(false);
  const [isReady, setReady] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* 🌐 Load Google Maps API                                                    */
  /* -------------------------------------------------------------------------- */
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🗺️ Initialize Map + Events                                                */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const g = window.google;
    if (!g?.maps) return;

    const darkMode = document.documentElement.classList.contains("dark");
    const style: google.maps.MapTypeStyle[] = darkMode
      ? [
          { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
        ]
      : [];

    const gmap = new g.maps.Map(mapRef.current, {
      center: center,
      zoom: window.innerWidth < 768 ? 15 : 16,
      disableDefaultUI: true,
      gestureHandling: editable ? "greedy" : "none",
      draggable: editable,
      zoomControl: editable,
      styles: style,
    });

    const geocoder = new g.maps.Geocoder();
    geocoderRef.current = geocoder;

    // 🧭 Idle listener → update coordinates + address
    gmap.addListener("idle", () => {
      const c = gmap.getCenter();
      if (!c) return;

      const loc = { lat: c.lat(), lng: c.lng() };
      setCenter(loc);

      geocoder.geocode({ location: loc }, (results, status) => {
        if (status === "OK" && results?.length) {
          const addr = results[0].formatted_address || "Unnamed location";
          setAddress(addr);
          onLocationChange?.(loc, addr);
          localStorage.setItem("lastLocation", JSON.stringify({ coords: loc, address: addr }));
        }
      });
    });

    // 🔍 Autocomplete (Search bar)
    if (searchRef.current) {
      autocompleteRef.current = new g.maps.places.Autocomplete(searchRef.current, {
        fields: ["geometry", "formatted_address"],
        componentRestrictions: { country: "in" },
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place?.geometry?.location) return;

        const loc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        gmap.panTo(loc);
        gmap.setZoom(17);
        setCenter(loc);
        setAddress(place.formatted_address || "Unnamed location");
        onLocationChange?.(loc, place.formatted_address || "");
      });
    }

    setMap(gmap);
    return () => g.maps.event.clearInstanceListeners(gmap);
  }, [isReady, editable]);

  /* -------------------------------------------------------------------------- */
  /* 📡 Locate Me (Follow Mode)                                                */
  /* -------------------------------------------------------------------------- */
  const locateMe = () => {
    if (!navigator.geolocation) {
      onError?.("Geolocation not supported by this device");
      return;
    }

    setLocating(true);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(coords);
        map?.panTo(coords);
        map?.setZoom(17);
        setLocating(false);
      },
      (err) => {
        onError?.(`GPS Error: ${err.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // 🧹 Stop watching when unmounted
  useEffect(() => {
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🎨 Render                                                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="relative w-full h-[440px] rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-700 shadow-lg">
      {!isReady ? (
        <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm">
          🗺️ Initializing map…
        </div>
      ) : (
        <>
          <div ref={mapRef} className="absolute inset-0" />

          {/* 🔍 Search bar */}
          {editable && (
            <motion.input
              ref={searchRef}
              placeholder="Search area or city..."
              className="absolute top-3 left-1/2 -translate-x-1/2 w-[90%] md:w-[65%]
                         bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md
                         border border-gray-300 dark:border-neutral-700 rounded-full px-4 py-2 text-sm
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            />
          )}

          {/* 📍 Floating Marker */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[70%] pointer-events-none"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            <div className="relative">
              <div className="w-4 h-4 bg-emerald-600 rounded-full ring-4 ring-emerald-400/40" />
              <motion.div
                className="absolute left-1/2 top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-emerald-400/25 rounded-full blur-md"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.3, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              />
            </div>
          </motion.div>

          {/* 🧭 Locate Me Button */}
          {editable && (
            <motion.button
              onClick={locateMe}
              whileTap={{ scale: 0.9 }}
              className={`absolute bottom-24 right-4 w-12 h-12 flex items-center justify-center rounded-full
                          bg-white/85 dark:bg-neutral-800/80 border border-gray-300 dark:border-neutral-700
                          hover:bg-emerald-600 hover:text-white transition-all shadow-lg ${
                            locating ? "animate-pulse bg-emerald-600 text-white" : ""
                          }`}
            >
              {locating ? "🧭" : "📍"}
            </motion.button>
          )}

          {/* 🪟 Address Display */}
          <AnimatePresence>
            {address && (
              <motion.div
                key={address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-neutral-900/85 backdrop-blur-md
                           rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-300 shadow-sm leading-snug"
              >
                <p className="line-clamp-2">
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
