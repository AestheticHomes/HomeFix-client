"use client";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

export type Service = {
  id: number;
  title: string;
  description?: string;
  price?: number;
  unit?: string;
  icon?: string;
  image_url?: string;
  gallery?: any[];
  category?: string;
  type?: string;
  is_active: boolean;
  slug?: string;
};

export type GroupedServices = Record<string, Service[]>;

export default function useServices() {
  const [services, setServices] = useState<GroupedServices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("category");

        if (error) throw error;

        const grouped: GroupedServices = {};
        for (const item of data) {
          const cat = item.category || "Misc";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item);
        }

        setServices(grouped);
        localStorage.setItem("services_cache", JSON.stringify(grouped));
      } catch (err: any) {
        console.error("[useServices] Error:", err.message);
        setError(err.message);
        const cache = localStorage.getItem("services_cache");
        if (cache) setServices(JSON.parse(cache));
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return { services, loading, error };
}
