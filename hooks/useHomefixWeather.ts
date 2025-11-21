"use client";

import { useEffect, useState } from "react";

type WeatherSnapshot = {
  cityName: string;
  currentTempC: number | null;
  summary: string | null;
  todayHighC?: number | null;
  todayLowC?: number | null;
};

const DEFAULT_WEATHER: WeatherSnapshot = {
  cityName: "Chennai",
  currentTempC: 31,
  summary: "Sunny",
  todayHighC: 33,
  todayLowC: 27,
};

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: "Clear skies",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Light fog",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing fog",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Sleet",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Heavy thunderstorm",
};

function decodeWeather(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? "Variable conditions";
}

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=13.0827&longitude=80.2707&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata";

export function useHomefixWeather(): WeatherSnapshot {
  const [snapshot, setSnapshot] = useState<WeatherSnapshot>(() => ({
    ...DEFAULT_WEATHER,
  }));

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadWeather() {
      try {
        const response = await fetch(OPEN_METEO_URL, {
          cache: "no-cache",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Weather API returned ${response.status}`);
        }

        const data = await response.json();
        if (!isActive) return;

        const current = data?.current_weather ?? {};
        const daily = data?.daily ?? {};
        const todayHigh = Array.isArray(daily.temperature_2m_max)
          ? daily.temperature_2m_max[0]
          : null;
        const todayLow = Array.isArray(daily.temperature_2m_min)
          ? daily.temperature_2m_min[0]
          : null;

        setSnapshot({
          cityName: "Chennai",
          currentTempC:
            typeof current.temperature === "number" ? current.temperature : null,
          summary:
            typeof current.weathercode === "number"
              ? decodeWeather(current.weathercode)
              : null,
          todayHighC:
            typeof todayHigh === "number" ? todayHigh : null,
          todayLowC: typeof todayLow === "number" ? todayLow : null,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("🌦️ [HomefixWeather] Fetch failed", error);
      }
    }

    void loadWeather();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  return snapshot;
}
