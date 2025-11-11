"use client";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: typeof google;
  }
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapPickerProps {
  initialLocation?: Coordinates;
  onLocationChange?: (
    loc: Coordinates,
    addr: string,
    confirmed?: boolean
  ) => void;
  editable?: boolean;
  confirmedAddress?: string;
}

export default function MapPicker({
  initialLocation = { lat: 13.0827, lng: 80.2707 },
  onLocationChange,
  editable = true,
}: MapPickerProps) {
  const { theme } = useTheme(); // ✅ Correct placement — inside component
  const mapRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(initialLocation);
  const [isReady, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [liveAddress, setLiveAddress] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  /* ------------------------------------------------------------
     🎨 React to Theme Change (Dynamic Re-Styling)
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!map || !window.google?.maps) return;

    const darkStyles: google.maps.MapTypeStyle[] = [
      { elementType: "geometry", stylers: [{ color: "#0b0a1a" }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "road", stylers: [{ color: "#202124" }] },
    ];

    const lightStyles: google.maps.MapTypeStyle[] = [
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
    ];

    map.setOptions({
      styles: theme === "dark" ? darkStyles : lightStyles,
      backgroundColor:
        theme === "dark"
          ? "#0b0a1a"
          : getComputedStyle(document.documentElement).getPropertyValue(
              "--edith-surface"
            ) || "#ffffff",
    });
  }, [theme, map]);

  /* ------------------------------------------------------------
     🌐 Load Google Maps
  ------------------------------------------------------------ */
  useEffect(() => {
    if (window.google?.maps) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  /* ------------------------------------------------------------
     🗺️ Initialize Map
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const g = window.google;
    if (!g?.maps) return;

    const dark = document.documentElement.classList.contains("dark");
    const mapStyle: google.maps.MapTypeStyle[] = dark
      ? [
          { elementType: "geometry", stylers: [{ color: "#0b0a1a" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "road", stylers: [{ color: "#202124" }] },
        ]
      : [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ];

    const gmap = new g.maps.Map(mapRef.current, {
      center,
      zoom: 16,
      disableDefaultUI: true,
      gestureHandling: editable ? "greedy" : "none",
      styles: mapStyle,
    });
    setMap(gmap);

    const geocoder = new g.maps.Geocoder();

    const updateAddress = () => {
      const c = gmap.getCenter();
      if (!c) return;
      const loc = { lat: c.lat(), lng: c.lng() };
      geocoder.geocode({ location: loc }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const formatted = results[0].formatted_address;
          setLiveAddress(formatted);
          setCenter(loc);

          // 🟣 Dynamic update (not confirmed)
          onLocationChange?.(loc, formatted, false);
          setConfirmed(false);
        }
      });
    };

    gmap.addListener("idle", updateAddress);

    if (editable && searchRef.current) {
      const auto = new g.maps.places.Autocomplete(searchRef.current, {
        fields: ["geometry", "formatted_address"],
        componentRestrictions: { country: "in" },
      });
      auto.addListener("place_changed", () => {
        const place = auto.getPlace();
        if (!place?.geometry?.location) return;
        const loc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        gmap.panTo(loc);
        setCenter(loc);
        setLiveAddress(place.formatted_address || "");
        setConfirmed(false);
      });
    }
  }, [isReady, editable]);

  /* ------------------------------------------------------------
     📡 Locate Me → resets confirmation
  ------------------------------------------------------------ */
  const handleLocateMe = () => {
    if (!navigator.geolocation || !editable) return;
    setLocating(true);
    setConfirmed(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map?.panTo(loc);
        setCenter(loc);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  /* ------------------------------------------------------------
     💾 Confirm Address — freezes static value
  ------------------------------------------------------------ */
  const handleConfirm = () => {
    if (!liveAddress) return;
    setConfirmed(true);
    onLocationChange?.(center, liveAddress, true);
  };

  /* ------------------------------------------------------------
     🖼️ Render
  ------------------------------------------------------------ */
  return (
    <div className="flex flex-col gap-4 w-full relative">
      {/* 🔍 Search Field */}
      {editable && (
        <input
          ref={searchRef}
          placeholder="Search location or area..."
          className="w-full bg-[var(--surface-card)] text-[var(--text-primary)]
                     border border-[var(--edith-border)] rounded-xl px-4 py-2 text-sm
                     shadow-sm focus:ring-2 focus:ring-[var(--accent-primary)]
                     focus:border-transparent outline-none transition-all duration-300"
        />
      )}

      {/* 🗺️ Map */}
      <div className="relative w-full h-[340px] rounded-2xl overflow-hidden border border-[var(--edith-border)] shadow-md">
        {!isReady ? (
          <div className="flex items-center justify-center w-full h-full text-[var(--text-secondary)] text-sm">
            🗺️ Loading map…
          </div>
        ) : (
          <>
            <div ref={mapRef} className="absolute inset-0" />

            {/* 🎯 Center Pin */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[70%] pointer-events-none"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--accent-primary)]" />
            </motion.div>

            {/* 📡 Locate Me */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLocateMe}
              className={`absolute bottom-5 right-5 w-10 h-10 flex items-center justify-center
                          rounded-full border border-[var(--edith-border)]
                          bg-[var(--surface-card)] hover:bg-[var(--accent-primary)]
                          hover:text-white transition-all duration-300 shadow-md backdrop-blur-sm
                          ${
                            locating
                              ? "animate-pulse text-[var(--accent-primary)]"
                              : ""
                          }`}
              title="Locate Me"
            >
              📡
            </motion.button>

            {/* Hide Google Branding */}
            <style jsx global>{`
              .gm-style-cc,
              .gmnoprint,
              .gm-style a[href^="https://maps.google.com/maps"]
              {
                display: none !important;
              }
            `}</style>
          </>
        )}
      </div>

      {/* 🧭 Confirm Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
        {/* Address Display */}
        <input
          type="text"
          readOnly
          value={
            liveAddress || "Move the map or search to select your location…"
          }
          className="flex-1 bg-[var(--edith-surface)] text-sm px-3 py-2 rounded-xl
               border border-[var(--edith-border)] focus:outline-none
               placeholder:text-[var(--text-secondary)] truncate min-h-[44px]"
        />

        {/* Confirm Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          disabled={!liveAddress}
          className={`relative sm:w-auto w-full min-h-[44px] px-6 py-2.5 rounded-xl text-sm font-semibold
                text-white shadow-lg transition-all duration-300 whitespace-nowrap
                bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
                hover:opacity-95 active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <motion.div
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 rounded-xl border border-[var(--accent-secondary)]/50 pointer-events-none"
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {confirmed ? (
              <>
                <span className="text-lg leading-none">✓</span> Confirmed
              </>
            ) : (
              "Confirm Location"
            )}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
