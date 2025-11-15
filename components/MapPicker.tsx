"use client";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useMapPicker } from "@/hooks/useMapPicker";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapPickerProps {
  initialLocation?: Coordinates;
  onLocationChange?: (
    loc: Coordinates,
    address: string,
    confirmed?: boolean
  ) => void;
  editable?: boolean;
}

export default function MapPicker({
  initialLocation = { lat: 13.0827, lng: 80.2707 },
  onLocationChange,
  editable = true,
}: MapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const missingApiKey = !apiKey;

  const autocompleteElRef = useRef<HTMLElement | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const { theme } = useTheme();

  const handleHookChange = (
    loc: Coordinates | null,
    addr: string,
    confirmed?: boolean
  ) => {
    if (!loc) return;
    onLocationChange?.(loc, addr, confirmed);
  };

  const hookResult = useMapPicker({
    initialLocation,
    editable,
    onLocationChange: handleHookChange,
    autocompleteElRef,
  });

  const mapRootRef = hookResult.mapRootRef;
  const mapRef = hookResult.mapRef;
  const searchHostRef = hookResult.searchHostRef;
  const address = hookResult.address;
  const locating = hookResult.locating;
  const usingWebComponent = hookResult.usingWebComponent;
  const mapsLoaded = hookResult.mapsLoaded;
  const locateMe = hookResult.locateMe;
  const confirmLocation = hookResult.confirmLocation;

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

    const darkStyles: google.maps.MapTypeStyle[] = [
      { elementType: "geometry", stylers: [{ color: "#0b0a1a" }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "road", stylers: [{ color: "#202124" }] },
    ];

    const lightStyles: google.maps.MapTypeStyle[] = [
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
    ];

    mapRef.current.setOptions({
      styles: theme === "dark" ? darkStyles : lightStyles,
    });
  }, [theme, mapRef]);

  useEffect(() => {
    setConfirmed(false);
  }, [address]);

  const handleLocate = () => {
    locateMe();
    setConfirmed(false);
  };

  const handleConfirm = async () => {
    if (!address) return;
    await confirmLocation();
    setConfirmed(true);
  };

  if (missingApiKey) {
    return (
      <div className="w-full h-[340px] rounded-xl bg-zinc-900/20 dark:bg-zinc-100/10 flex items-center justify-center border border-[var(--edith-border)] text-[var(--text-secondary)]">
        🗺️ Google Maps not enabled — add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full relative">
      {editable && (
        <div className="space-y-2">
          <gmpx-place-autocomplete
            ref={autocompleteElRef}
            placeholder="Search location or area…"
            className={`${
              usingWebComponent ? "block" : "hidden"
            } w-full bg-[var(--surface-card)] text-[var(--text-primary)]
              border border-[var(--edith-border)] rounded-xl px-4 py-2 text-sm
              shadow-sm focus-within:ring-2 focus-within:ring-[var(--accent-primary)]
              outline-none transition-all`}
          />
          <div
            ref={searchHostRef}
            className={`w-full ${usingWebComponent ? "hidden" : "block"}`}
          />
        </div>
      )}

      <div className="relative w-full h-[340px] rounded-2xl overflow-hidden border border-[var(--edith-border)] shadow-md">
        {!mapsLoaded ? (
          <div className="flex items-center justify-center w-full h-full text-[var(--text-secondary)]">
            🗺️ Loading map…
          </div>
        ) : (
          <>
            <div ref={mapRootRef} className="absolute inset-0" />

            <motion.div
              className="absolute left-1/2 top-1/2 
                -translate-x-1/2 -translate-y-[70%] 
                pointer-events-none"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--accent-primary)]" />
            </motion.div>

            {editable && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLocate}
                className={`absolute bottom-5 right-5 w-10 h-10 flex items-center justify-center
                  rounded-full border border-[var(--edith-border)]
                  bg-[var(--surface-card)] hover:bg-[var(--accent-primary)]
                  hover:text-white transition-all shadow-md
                  ${
                    locating
                      ? "animate-pulse text-[var(--accent-primary)]"
                      : ""
                  }`}
              >
                📡
              </motion.button>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          readOnly
          type="text"
          value={
            address || "Move the map or search to select your location…"
          }
          className="flex-1 bg-[var(--edith-surface)] text-sm px-3 py-2 rounded-xl
            border border-[var(--edith-border)]"
        />

        {editable && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={!address}
            className={`relative sm:w-auto w-full min-h-[44px] px-6 py-2.5 rounded-xl text-sm font-semibold
              text-white shadow-lg transition-all
              bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
              disabled:opacity-50`}
          >
            {confirmed ? "✓ Confirmed" : "Confirm Location"}
          </motion.button>
        )}
      </div>
    </div>
  );
}
