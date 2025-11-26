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
    loc: Coordinates | null,
    address: string,
    confirmed?: boolean
  ) => void;
  editable?: boolean;
  /** Optional: force manual mode even if Maps works */
  forceManualMode?: boolean;
}

export default function MapPicker({
  initialLocation = { lat: 13.0827, lng: 80.2707 },
  onLocationChange,
  editable = true,
  forceManualMode = false,
}: MapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const missingApiKey = !apiKey;

  const autocompleteInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const { theme } = useTheme();

  const handleHookChange = (
    loc: Coordinates | null,
    addr: string,
    confirmed?: boolean
  ) => {
    onLocationChange?.(loc, addr, confirmed);
  };

  const {
    mapRootRef,
    mapRef,
    address,
    locating,
    autocompleteReady,
    mapsLoaded,
    mapsDead,
    locateMe,
    confirmLocation,
  } = useMapPicker({
    initialLocation,
    editable,
    onLocationChange: handleHookChange,
    inputRef: autocompleteInputRef,
  });

  const manualOnly = forceManualMode || missingApiKey || mapsDead;

  useEffect(() => {
    if (manualOnly) return;
    if (!mapRef.current || !(window as any).google?.maps) return;

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
  }, [theme, mapRef, manualOnly]);

  useEffect(() => {
    setConfirmed(false);
  }, [address]);

  const handleLocate = () => {
    if (manualOnly) return;
    locateMe();
    setConfirmed(false);
  };

  const handleConfirm = async () => {
    if (!address) return;
    if (!manualOnly) {
      await confirmLocation();
    }
    setConfirmed(true);
  };

  if (manualOnly) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="w-full rounded-xl border border-[var(--edith-border)] bg-[var(--surface-card)] p-4 text-sm text-[var(--text-secondary)]">
          <p className="font-medium mb-1">📍 Map unavailable</p>
          {missingApiKey ? (
            <p className="text-xs opacity-70">
              Google Maps is not configured. Add{" "}
              <code className="px-1 py-0.5 rounded bg-black/10 text-[10px]">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              </code>{" "}
              to enable live map selection.
            </p>
          ) : (
            <p className="text-xs opacity-70">
              Maps services are temporarily unavailable (quota / billing
              verification). You can still enter your address manually.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter your full address, landmark, city…"
            onChange={(e) =>
              onLocationChange?.(null, e.target.value, false)
            }
            className="flex-1 bg-[var(--edith-surface)] text-sm px-3 py-2 rounded-xl
              border border-[var(--edith-border)]"
          />

          {editable && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              className="relative sm:w-auto w-full min-h-[44px] px-6 py-2.5 rounded-xl text-sm font-semibold
                text-white shadow-lg transition-all
                bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
            >
              {confirmed ? "✓ Address Saved" : "Save Address"}
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full relative">
      {editable && (
        <div className="space-y-2">
          <input
            ref={autocompleteInputRef}
            type="text"
            placeholder="Search location or area…"
            className={`w-full bg-[var(--surface-card)] text-[var(--text-primary)]
              border border-[var(--edith-border)] rounded-xl px-4 py-2 text-sm
              shadow-sm focus-within:ring-2 focus-within:ring-[var(--accent-primary)]
              outline-none transition-all`}
          />
          {!autocompleteReady && (
            <p className="text-xs text-[var(--text-muted)]">
              Loading Google Place Autocomplete…
            </p>
          )}
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
            {confirmed ? "✓ Confirm Location" : "Confirm Location"}
          </motion.button>
        )}
      </div>
    </div>
  );
}
