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

import { useEffect, useState } from "react";
import { MapPin, Thermometer, CloudSun, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
  async function fetchWeather(lat: number, lon: number) {
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
  }

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
  }, []);

  /* 🌈 Render */
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full border-b border-[#9B5CF8]/30 bg-gradient-to-r 
        from-[#F8F7FF]/70 via-[#F2F0FF]/50 to-[#EAE8FF]/60 
        dark:from-[#0D0B2B]/60 dark:via-[#1B1545]/50 dark:to-[#241A55]/60
        backdrop-blur-xl shadow-sm py-2 px-4 flex items-center justify-between
        text-sm sm:text-base font-medium"
    >
      {/* Left: Location */}
      <div className="flex items-center gap-2 text-[#5A5DF0] dark:text-[#CBA0FF]">
        <MapPin className="w-4 h-4" />
        {loading ? (
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin w-3 h-3" /> Locating...
          </span>
        ) : error ? (
          <span className="text-gray-400">{error}</span>
        ) : (
          <span>{data.city}</span>
        )}
      </div>

      {/* Right: Weather */}
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        {data.temp !== null ? (
          <>
            <Thermometer className="w-4 h-4" />
            <span>{data.temp}°C</span>
            {data.condition && (
              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
                {data.condition}
              </span>
            )}
          </>
        ) : (
          <CloudSun className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </motion.div>
  );
}
