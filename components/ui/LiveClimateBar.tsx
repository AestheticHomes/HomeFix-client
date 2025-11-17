"use client";
/**
 * LiveClimateBar v1.0 — HomeFix “Edith Climate Pulse” 🌦️
 * -------------------------------------------------------
 * ✅ Auto-fetches city + temperature
 * ✅ Refreshes every 15 minutes
 * ✅ Lightweight Open-Meteo + Reverse Geocoding
 * ✅ Graceful fallback if GPS denied
 * ✅ PWA-friendly and animated
 */

import { useCallback, useEffect, useState } from "react";
import { MapPin, Thermometer, CloudSun, Loader2 } from "lucide-react";

interface ClimateData {
  temp: number | null;
  city: string | null;
  condition: string | null;
}

export default function LiveClimateBar() {
  const [data, setData] = useState<ClimateData>({ temp: null, city: null, condition: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* 🌍 Fetch Weather + Location */
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      // Get weather from Open-Meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      // Reverse geocode
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const geoData = await geoRes.json();

      setData({
        temp: weatherData?.current_weather?.temperature ?? null,
        city: geoData?.address?.suburb || geoData?.address?.city || geoData?.address?.town || "Your Area",
        condition: weatherData?.current_weather?.weathercode ? decodeWeather(weatherData.current_weather.weathercode) : null,
      });
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("🌧️ [ClimateBar] Fetch failed:", err);
      setError("Weather unavailable");
      setLoading(false);
    }
  }, []);

  /* ☁️ Decode Open-Meteo codes */
  function decodeWeather(code: number): string {
    const map: Record<number, string> = {
      0: "Clear Sky",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Icy Fog",
      51: "Light Drizzle",
      61: "Rainy",
      71: "Snow",
      95: "Thunderstorm",
    };
    return map[code] || "Cloudy";
  }

  /* 🛰️ Get location */
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Location unavailable");
      setLoading(false);
      return;
    }

    const fetchLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          setError("Location access denied");
          setLoading(false);
        }
      );
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 15 * 60 * 1000); // refresh every 15 min
    return () => clearInterval(interval);
  }, [fetchWeather]);

  /* 🌈 Render */
  return (
    <div className="flex items-center justify-between w-full text-xs sm:text-sm font-medium">
      <div className="flex items-center gap-2 text-[var(--accent-primary)] min-w-0">
        <MapPin className="w-4 h-4" />
        {loading ? (
          <span className="flex items-center gap-1 text-[var(--text-muted)]">
            <Loader2 className="animate-spin w-3 h-3" /> Locating...
          </span>
        ) : error ? (
          <span className="text-[var(--text-muted)] overflow-hidden whitespace-nowrap text-ellipsis">
            {error}
          </span>
        ) : (
          <span className="text-[var(--text-primary)] overflow-hidden whitespace-nowrap text-ellipsis">
            {data.city}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-[var(--accent-tertiary)]">
        {data.temp !== null ? (
          <>
            <Thermometer className="w-4 h-4" />
            <span className="text-[var(--text-primary)]">{data.temp}°C</span>
            {data.condition && (
              <span className="hidden sm:inline text-[10px] text-[var(--text-muted-soft)] overflow-hidden whitespace-nowrap text-ellipsis">
                {data.condition}
              </span>
            )}
          </>
        ) : (
          <CloudSun className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </div>
    </div>
  );
}
