"use client";
/**
 * hooks/useMapPicker.ts
 * Client hook to load Google Maps + Places Autocomplete for the MapPicker component.
 * - Integrates Places web component and map centering callbacks for bookings/checkout flows.
 * - Depends on NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; loads Maps JS with loading=async to avoid perf warnings.
 * - TODO: migrate google.maps.Marker to google.maps.marker.AdvancedMarkerElement per Maps deprecation notice.
 */

import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
  ) => void;
  autocompleteElRef?: MutableRefObject<any>;
}

export function useMapPicker({
  initialLocation = { lat: 13.0827, lng: 80.2707 },
  editable = true,
  onLocationChange,
  autocompleteElRef,
}: UseMapPickerOptions) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const mapRootRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [autocompleteReady, setAutocompleteReady] = useState(false);
  const [address, setAddress] = useState("");
  const [satellite, setSatellite] = useState(false);
  const [locating, setLocating] = useState(false);

  const autocompleteErrorLoggedRef = useRef(false);

  /* ------------------------------------------------------------------ */
  /*  LOAD GOOGLE MAPS SCRIPT                                           */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof window === "undefined" || !apiKey) return;

    const w = window as any;
    if (w.google?.maps) {
      setMapsLoaded(true);
      return;
    }

    // Avoid injecting multiple scripts
    if (w.__homefixGoogleMapsPromise) {
      (w.__homefixGoogleMapsPromise as Promise<void>).then(() =>
        setMapsLoaded(true)
      );
      return;
    }

    w.__homefixGoogleMapsPromise = new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setMapsLoaded(true);
        resolve();
      };

      script.onerror = () => {
        console.error("[MapPicker] Google Maps script failed to load.");
        resolve();
      };

      document.head.appendChild(script);
    });
  }, [apiKey]);

  /* ------------------------------------------------------------------ */
  /*  SAFE REVERSE GEOCODE                                              */
  /* ------------------------------------------------------------------ */

  const safeReverseGeocode = useCallback(async (coords: Coordinates) => {
    try {
      const g = (window as any).google;
      if (!g?.maps) return "";

      const geocoder = new g.maps.Geocoder();

      return await new Promise<string>((resolve) => {
        geocoder.geocode({ location: coords }, (res: any, status: any) => {
          if (status === "OK" && res?.[0]) resolve(res[0].formatted_address);
          else resolve("");
        });
      });
    } catch (e) {
      console.error("[MapPicker] Reverse geocode failed:", e);
      return "";
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /*  LOAD PLACE AUTOCOMPLETE WEB COMPONENT                             */
  /* ------------------------------------------------------------------ */

  const loadWebComponent = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    const w = window as any;

    if (w.customElements?.get("gmpx-place-autocomplete")) return true;

    if (w.__gmpxPlaceAutocompletePromise) {
      return w.__gmpxPlaceAutocompletePromise as Promise<boolean>;
    }

    w.__gmpxPlaceAutocompletePromise = new Promise<boolean>((resolve) => {
      const candidates = [
        "https://maps.gstatic.com/maps-api-v3/api/js/WebComponent/latest/PlaceAutocompleteElement.js",
        "https://maps.gstatic.com/maps-api-v3/api/js/WebComponent/PlaceAutocompleteElement.js",
      ];

      const tryNext = (index: number) => {
        if (index >= candidates.length) {
          resolve(false);
          return;
        }

        const script = document.createElement("script");
        script.type = "module";
        script.src = candidates[index];

        script.onload = () => {
          const ok = !!w.customElements?.get("gmpx-place-autocomplete");
          if (ok) resolve(true);
          else tryNext(index + 1);
        };

        script.onerror = () => {
          tryNext(index + 1);
        };

        document.head.appendChild(script);
      };

      tryNext(0);
    });

    return w.__gmpxPlaceAutocompletePromise as Promise<boolean>;
  }, []);

  /* ------------------------------------------------------------------ */
  /*  INIT MAP + MARKER                                                 */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!mapsLoaded || !mapRootRef.current) return;

    let idleListener: google.maps.MapsEventListener | null = null;
    let dragListener: google.maps.MapsEventListener | null = null;

    (async () => {
      const g = (window as any).google;
      if (!g?.maps) return;

      const map = new g.maps.Map(mapRootRef.current!, {
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

      markerRef.current = marker;

      // Initial address
      const initAddr = await safeReverseGeocode(initialLocation);
      setAddress(initAddr);
      onLocationChange?.(initialLocation, initAddr, false);

      // When map stops moving
      idleListener = map.addListener("idle", async () => {
        const c = map.getCenter();
        if (!c) return;

        const loc = { lat: c.lat(), lng: c.lng() };
        marker.setPosition(c);

        const addr = await safeReverseGeocode(loc);
        setAddress(addr);
        onLocationChange?.(loc, addr, false);
      });

      // Marker drag
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
    })();

    return () => {
      idleListener?.remove();
      dragListener?.remove();
    };
  }, [
    mapsLoaded,
    satellite,
    editable,
    initialLocation,
    onLocationChange,
    safeReverseGeocode,
  ]);

  /* ------------------------------------------------------------------ */
  /*  ACTIONS                                                           */
  /* ------------------------------------------------------------------ */

  const locateMe = useCallback(() => {
    if (locating) return; // prevent duplicate requests while locating
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
        console.warn("[MapPicker] Geolocation failed or was denied.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [locating, onLocationChange, safeReverseGeocode]);

  const confirmLocation = useCallback(async () => {
    if (!markerRef.current) return;

    const p = markerRef.current.getPosition();
    if (!p) return;

    const loc = { lat: p.lat(), lng: p.lng() };
    const addr = await safeReverseGeocode(loc);

    setAddress(addr);
    onLocationChange?.(loc, addr, true);
  }, [onLocationChange, safeReverseGeocode]);

  const toggleSatellite = useCallback(() => {
    setSatellite((s) => !s);
  }, []);

  /* ------------------------------------------------------------------ */
  /*  ATTACH AUTOCOMPLETE                                               */
  /* ------------------------------------------------------------------ */

  const attachAutocomplete = useCallback(async () => {
    if (!mapsLoaded) return;
    if (!autocompleteElRef?.current) return;

    const webcompLoaded = await loadWebComponent();
    if (!webcompLoaded) {
      setAutocompleteReady(false);

      if (!autocompleteErrorLoggedRef.current) {
        console.warn(
          "[MapPicker] PlaceAutocompleteElement could not be loaded. " +
            "Autocomplete will be disabled; check Places API / web component URLs."
        );
        autocompleteErrorLoggedRef.current = true;
      }

      return;
    }

    const el = autocompleteElRef.current as GmpxPlaceAutocompleteElement;
    if (!el) return;

    setAutocompleteReady(true);

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

    return () => {
      el.removeEventListener("place_changed", handler);
      el.removeEventListener("gmpx-place-selected", handler);
      el.removeEventListener("change", handler);
    };
  }, [mapsLoaded, autocompleteElRef, loadWebComponent, onLocationChange]);

  useEffect(() => {
    let cleanupFn: (() => void) | void;

    (async () => {
      cleanupFn = await attachAutocomplete();
    })();

    return () => {
      cleanupFn?.();
    };
  }, [attachAutocomplete]);

  /* ------------------------------------------------------------------ */
  /*  RETURN HOOK API                                                   */
  /* ------------------------------------------------------------------ */

  // 🔥 Unified "is maps usable?" flag
  const mapsDead =
    !apiKey ||
    !mapsLoaded ||
    (typeof window !== "undefined" &&
      !(window as any).google?.maps?.Map);

  return {
    mapRootRef,
    mapRef,
    address,
    satellite,
    locating,
    autocompleteReady,
    mapsLoaded,
    mapsDead,
    locateMe,
    confirmLocation,
    toggleSatellite,
  };
}
