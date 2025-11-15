"use client";
/**
 * =============================================================
 * File: /app/services/page.tsx
 * Module: HomeFix Services Explorer v4.0 — Gemini Unified 🌗
 * -------------------------------------------------------------
 * ✅ True theme sync (no hardcoded bg/text)
 * ✅ Smooth transitions preserved
 * ✅ Hero + Cards auto-adapt to global theme
 * ✅ Brand gradients intact
 * =============================================================
 */

import InstallFAB from "@/components/InstallFAB";
import ServiceCartDrawer from "@/components/ui/ServiceCartDrawer";
import supabase from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const FALLBACK_ICON_DATA =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="14" fill="rgba(155,92,248,0.18)"/>
      <path d="M16 26l6-7 4 4 4-4 6 8" stroke="%239B5CF8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  );

interface ServiceItem {
  id: number;
  title: string;
  description?: string;
  price?: number;
  unit?: string;
  icon?: string;
  image_url?: string;
  slug?: string;
  category?: string;
  type?: string;
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<ServiceItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------ */
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("id", { ascending: true });

        if (error) throw error;

        const cats = (data || []).filter((d) => d.type === "category");
        const servs = (data || []).filter((d) => d.type === "service");

        setCategories(cats);
        setServices(servs);
        if (cats.length > 0) setSelected(cats[0]);
      } catch (err) {
        console.error("❌ [Services] Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const filteredServices = services.filter(
    (s) =>
      s.category?.toLowerCase().trim() === selected?.title?.toLowerCase().trim()
  );

  const openDrawer = (service: ServiceItem) => {
    setActiveService(service);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setActiveService(null), 250);
  };

  /* ------------------------------------------------------------ */
  return (
    <main
      className="relative flex flex-col items-center justify-start min-h-[calc(100vh-72px)]
                 bg-[var(--surface-base)]
                 text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]
                 pt-20 px-4 md:px-8 transition-colors duration-500 overflow-hidden"
    >
      {/* ✨ Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--accent-tertiary)] border-t-transparent mb-4"></div>
          <p className="text-sm opacity-70">Fetching HomeFix services…</p>
        </div>
      )}

      {/* 🌈 Loaded State */}
      {!loading && selected && (
        <>
          {/* 🖼️ Hero Section */}
          <motion.section
            key={selected.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-xl
                       bg-[var(--surface-light)] dark:bg-[var(--surface-dark)] mb-10
                       transition-colors duration-500"
          >
            <div className="relative w-full h-[300px] md:h-[420px] overflow-hidden">
              <Image
                src={selected.image_url || "/placeholder.png"}
                alt={selected.title || "Service"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in srgb, var(--surface-dark) 92%, transparent 8%), color-mix(in srgb, var(--surface-dark) 55%, transparent 45%), transparent)",
                }}
              />
              <div className="absolute bottom-6 left-6 text-white z-10">
                <motion.h1
                  className="text-3xl md:text-5xl font-bold mb-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {selected.title}
                </motion.h1>
                <motion.p
                  className="max-w-lg text-sm md:text-base text-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {selected.description ||
                    "Professional home and commercial services by HomeFix India."}
                </motion.p>
              </div>
            </div>
          </motion.section>

          {/* 🧩 Category Tabs */}
          <motion.section
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full max-w-6xl mb-10"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(cat)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl shadow-md
                            bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                            border transition-all duration-300
                            ${
                              selected.id === cat.id
                                ? "border-[var(--accent-tertiary)]/60 shadow-lg"
                                : "border-[var(--border-soft)]/40"
                            }`}
              >
                <CategoryIcon src={cat.icon} alt={cat.title} />
                <span className="font-medium text-center text-sm">
                  {cat.title}
                </span>
              </motion.button>
            ))}
          </motion.section>

          {/* 💼 Services Grid */}
          <AnimatePresence mode="wait">
            <motion.section
              key={selected.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl pb-24"
            >
              {filteredServices.length > 0 ? (
                filteredServices.map((srv) => (
                  <motion.div
                    key={srv.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="group relative rounded-2xl shadow-md overflow-hidden border
                               bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]
                               border-[var(--border-soft)]/60 transition-all duration-300"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={srv.image_url || "/placeholder.png"}
                        alt={srv.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 1200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, color-mix(in srgb, var(--surface-dark) 86%, transparent 14%), transparent)",
                        }}
                      />
                      <div className="absolute bottom-3 left-4 text-white">
                        <h3 className="font-semibold text-lg">{srv.title}</h3>
                        {srv.price && (
                          <p className="text-sm opacity-80">
                            ₹{srv.price} / {srv.unit || "unit"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm opacity-80 mb-2 line-clamp-2">
                        {srv.description}
                      </p>
                      <button
                        onClick={() => openDrawer(srv)}
                        className="mt-2 inline-flex items-center justify-center w-full py-2 rounded-lg
                                   bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
                                   text-white text-sm font-medium hover:opacity-90 transition"
                      >
                        Book Now
                        <ArrowUpRight className="ml-2 w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="col-span-full text-center opacity-70 text-sm">
                  No active services found under {selected.title}.
                </p>
              )}
            </motion.section>
          </AnimatePresence>
        </>
      )}

      {/* 🪶 Drawer & FAB */}
      <ServiceCartDrawer
        service={activeService}
        open={drawerOpen}
        onClose={closeDrawer}
        onAdd={() => {}}
      />
      <InstallFAB />
    </main>
  );
}

function CategoryIcon({
  src,
  alt,
}: {
  src?: string | null;
  alt?: string | null;
}) {
  const [errored, setErrored] = useState(false);
  const resolvedSrc = !errored && src ? src : FALLBACK_ICON_DATA;
  return (
    <Image
      src={resolvedSrc}
      alt={alt || "Service category"}
      width={40}
      height={40}
      className="mb-2"
      unoptimized
      onError={() => setErrored(true)}
    />
  );
}
