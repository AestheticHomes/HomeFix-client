// components/ledgerx/useGoogleMapsLoader.ts
import { useEffect, useState } from "react";

/**
 * Ensures the Google Maps JS API script is loaded exactly once
 * using a global callback to manage the loading state.
 */
export function useGoogleMapsLoader() {
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const g = (window as any).google;

    // 1. Exit if the script has already been loaded
    if (g?.maps) {
      setMapsLoaded(true);
      return;
    }

    // 2. Define a global callback function (will be called by Google Maps script when loaded)
    const callbackName = "__googleMapsApiLoaded";
    (window as any)[callbackName] = () => {
      setMapsLoaded(true);
    };

    const script = document.createElement("script");

    // Append the 'callback' parameter to notify us when loading is complete
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;

    script.async = true;
    script.defer = true;
    script.onerror = () => console.error("Google Maps script failed to load.");

    // 3. Add script only if it doesn't exist yet (prevents Fast Refresh duplication)
    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      document.head.appendChild(script);
    }

    // 4. Cleanup function
    return () => {
      delete (window as any)[callbackName];
    };
  }, []); // Dependencies are empty, as intended for a script loader

  return mapsLoaded;
}
