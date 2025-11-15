"use client";
//hooks/useMapPicker.ts
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// Type augmentation for the Google Maps Place Web Component
interface GmpxPlaceAutocompleteElement extends HTMLElement {
  getPlace?: () => any;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UseMapPickerOptions {
  initialLocation?: Coordinates;
  editable?: boolean;
  onLocationChange?: (
    loc: Coordinates | null,
    address: string,
    confirmed?: boolean
  ) => void; // ⭐️ Fixed: Ref for the declaratively rendered Web Component
  autocompleteElRef?: MutableRefObject<any>;
}

export function useMapPicker({
  initialLocation = { lat: 13.0827, lng: 80.2707 },
  editable = true,
  onLocationChange,
  autocompleteElRef, // ⭐️ Destructured and ready to use
}: UseMapPickerOptions) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapRootRef = useRef<HTMLDivElement | null>(null);
  const searchHostRef = useRef<HTMLDivElement | null>(null); // Host for Autocomplete fallback

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [usingWebComponent, setUsingWebComponent] = useState(false);
  const [address, setAddress] = useState("");
  const [satellite, setSatellite] = useState(false);
  const [locating, setLocating] = useState(false);
  /* ------------------------------------------------------------------
   * LOAD GOOGLE MAPS SCRIPT
   * ------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof window === "undefined" || !apiKey) return;

    if ((window as any).google?.maps) {
      setMapsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;

    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    script.onerror = () => console.error("Google Maps script failed to load.");

    document.head.appendChild(script);
  }, [apiKey]);
  /* ------------------------------------------------------------------
   * SAFE REVERSE GEOCODE - STABLE REFERENCE
   * ------------------------------------------------------------------ */

  const safeReverseGeocode = useCallback(
    async (coords: Coordinates): Promise<string> => {
      try {
        const g = (window as any).google;
        if (!g?.maps) return "";
        const geocoder = new g.maps.Geocoder();
        return await new Promise((resolve) => {
          geocoder.geocode({ location: coords }, (res: any, status: any) => {
            if (status === "OK" && res?.[0]) resolve(res[0].formatted_address);
            else resolve("");
          });
        });
      } catch (e) {
        console.error("Reverse geocode failed:", e);
        return "";
      }
    },
    [] // Dependencies: None, as it uses global window.google
  );
  /* ------------------------------------------------------------------
   * LOAD WEB COMPONENT (PlaceAutocompleteElement) - STABLE REFERENCE
   * ------------------------------------------------------------------ */

  const loadWebComponent = useCallback(async (): Promise<boolean> => {
    if ((window as any).customElements?.get("gmpx-place-autocomplete")) {
      return true;
    }

    const candidates = [
      "https://maps.gstatic.com/maps-api-v3/api/js/WebComponent/latest/PlaceAutocompleteElement.js",
      "https://maps.gstatic.com/maps-api-v3/api/js/WebComponent/PlaceAutocompleteElement.js",
    ];

    for (const url of candidates) {
      try {
        const s = document.createElement("script");
        s.type = "module";
        s.src = url;
        document.head.appendChild(s);
        await new Promise((r) => setTimeout(r, 300));
        if ((window as any).customElements?.get("gmpx-place-autocomplete")) {
          return true;
        }
      } catch (e) {
        // Silently ignore script load failures and try the next candidate
      }
    }
    return false;
  }, []);
  /* ------------------------------------------------------------------
   * INIT MAP + MARKER EFFECT
   * ------------------------------------------------------------------ */

  useEffect(() => {
    if (!mapsLoaded || !mapRootRef.current) return;

    (async () => {
      const g = (window as any).google;
      if (!g?.maps) return;

      const map = new g.maps.Map(mapRootRef.current, {
        center: initialLocation,
        zoom: 16,
        disableDefaultUI: true,
        gestureHandling: editable ? "greedy" : "none",
        mapTypeId: satellite
          ? g.maps.MapTypeId.SATELLITE
          : g.maps.MapTypeId.ROADMAP,
      });

      mapRef.current = map;

      const marker = new g.maps.Marker({
        position: initialLocation,
        map,
        draggable: editable,
      });

      markerRef.current = marker; // Emit initial location

      const initAddr = await safeReverseGeocode(initialLocation);
      setAddress(initAddr);
      onLocationChange?.(initialLocation, initAddr, false); // IDLE PAN LISTENER: updates location when the map stops moving

      const idleListener = map.addListener("idle", async () => {
        const c = map.getCenter();
        if (!c) return;
        const loc = { lat: c.lat(), lng: c.lng() };
        marker.setPosition(c);

        const addr = await safeReverseGeocode(loc);
        setAddress(addr); // Using a ref or checking for a current change might prevent stale onLocationChange, // but since it's now a dependency, it's safer.
        onLocationChange?.(loc, addr, false);
      }); // MARKER DRAG: updates location when the marker drag ends

      let dragListener: any = null;
      if (editable) {
        dragListener = marker.addListener("dragend", async () => {
          const p = marker.getPosition();
          if (!p) return;
          const loc = { lat: p.lat(), lng: p.lng() };
          map.panTo(p);
          const addr = await safeReverseGeocode(loc);
          setAddress(addr);
          onLocationChange?.(loc, addr, false);
        });
      }

      return () => {
        if (idleListener?.remove) idleListener.remove();
        if (dragListener?.remove) dragListener.remove();
      };
    })();
    // ✅ Dependencies are now complete and correct
  }, [
    mapsLoaded,
    satellite,
    editable,
    initialLocation,
    onLocationChange,
    safeReverseGeocode,
  ]);
  /* ------------------------------------------------------------------
   * HOOK ACTIONS - STABLE REFERENCES
   * ------------------------------------------------------------------ */

  const locateMe = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        const g = (window as any).google;

        if (g?.maps && mapRef.current) {
          const ll = new g.maps.LatLng(loc.lat, loc.lng);
          mapRef.current.panTo(ll);
          markerRef.current?.setPosition(ll);
        }

        const addr = await safeReverseGeocode(loc);
        setAddress(addr);
        onLocationChange?.(loc, addr, false);
        setLocating(false);
      },
      () => {
        console.warn("Geolocation failed or was denied.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [onLocationChange, safeReverseGeocode]); // Dependencies: State setter (safe), prop function, and other stable functions.

  const confirmLocation = useCallback(async () => {
    if (!markerRef.current) return;
    const p = markerRef.current.getPosition();
    if (!p) return;
    const loc = { lat: p.lat(), lng: p.lng() };
    const addr = await safeReverseGeocode(loc);
    setAddress(addr);
    onLocationChange?.(loc, addr, true);
  }, [onLocationChange, safeReverseGeocode]);

  const toggleSatellite = useCallback(() => setSatellite((s) => !s), []);
  /* ------------------------------------------------------------------
   * ATTACH AUTOCOMPLETE LOGIC - STABLE REFERENCE
   * ------------------------------------------------------------------ */

  const attachAutocomplete = useCallback(async () => {
    if (!mapsLoaded) return;
    let removeListener: (() => void) | null = null; // Clear previous content in the fallback container

    if (searchHostRef.current) searchHostRef.current.innerHTML = "";

    const webcompLoaded = await loadWebComponent();

    if (webcompLoaded && autocompleteElRef?.current) {
      // ⭐️ PATH 1: Declarative Web Component (from MapPicker.tsx ref)
      setUsingWebComponent(true);
      const el = autocompleteElRef.current as GmpxPlaceAutocompleteElement;

      try {
        const handler = async (ev: any) => {
          const wc = el as GmpxPlaceAutocompleteElement;
          const place = ev?.detail?.place ?? wc.getPlace?.() ?? null;
          if (!place) return;

          const loc =
            place?.geometry?.location != null
              ? {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }
              : null;

          const addr = place?.formatted_address ?? place?.name ?? "";

          if (loc && mapRef.current) {
            const g = (window as any).google;
            const ll = new g.maps.LatLng(loc.lat, loc.lng);
            mapRef.current.panTo(ll);
            markerRef.current?.setPosition(ll);
          }

          setAddress(addr);
          onLocationChange?.(loc, addr, false);
        };

        el.addEventListener("place_changed", handler);
        el.addEventListener("gmpx-place-selected", handler);
        el.addEventListener("change", handler);

        removeListener = () => {
          el.removeEventListener("place_changed", handler);
          el.removeEventListener("gmpx-place-selected", handler);
          el.removeEventListener("change", handler);
        };

        return removeListener;
      } catch (e) {
        console.error(
          "Declarative Web Component listener attachment failed, falling back.",
          e
        );
        setUsingWebComponent(false); // Fall through to legacy
      }
    } // ⭐️ PATH 2: Fallback to Classic <input> (Imperative DOM injection)

    if (!searchHostRef.current) return; // Must have the host div for injection
    setUsingWebComponent(false);

    const INPUT_ID = "legacy-autocomplete";
    searchHostRef.current.innerHTML = `
        <input 
            id="${INPUT_ID}" 
            placeholder="Search for address or area..." 
            style="width:100%;height:44px;padding:8px 12px;border-radius:12px;border:1px solid rgba(0,0,0,0.1);" 
        />
    `;

    const inputEl = document.getElementById(INPUT_ID) as HTMLInputElement;

    const g = (window as any).google;
    if (!g?.maps?.places || !inputEl) return;

    const ac = new g.maps.places.Autocomplete(inputEl, {
      fields: ["geometry", "formatted_address", "name"],
      componentRestrictions: { country: "in" },
    });

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc =
        place?.geometry?.location != null
          ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }
          : null;

      const addr = place?.formatted_address ?? place?.name ?? "";
      if (loc && mapRef.current) {
        const g2 = (window as any).google;
        const ll = new g2.maps.LatLng(loc.lat, loc.lng);
        mapRef.current.panTo(ll);
        markerRef.current?.setPosition(ll);
      }
      setAddress(addr);
      onLocationChange?.(loc, addr, false);
    });

    removeListener = () => {
      try {
        listener?.remove?.();
      } catch {}
      try {
        searchHostRef.current?.removeChild(inputEl);
      } catch {}
    };

    return removeListener;
  }, [mapsLoaded, autocompleteElRef, loadWebComponent, onLocationChange]);
  /* ------------------------------------------------------------------
   * AUTOCOMPLETE EFFECT
   * ------------------------------------------------------------------ */

  useEffect(() => {
    let cleanupFn: (() => void) | null | undefined = null;

    (async () => {
      cleanupFn = await attachAutocomplete();
    })();

    return () => {
      if (cleanupFn) cleanupFn();
    }; // ✅ Dependencies are now complete and correct
  }, [attachAutocomplete]);

  return {
    mapRootRef,
    searchHostRef,
    mapRef,
    address,
    satellite,
    locating,
    usingWebComponent,
    mapsLoaded,

    locateMe,
    confirmLocation,
    toggleSatellite,
  };
}
