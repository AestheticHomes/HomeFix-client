"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import supabase from "@/lib/supabaseClient";
import UniversalHeader from "@/components/layout/UniversalHeader";
import ServiceBookDrawer from "@/components/ui/ServiceBookDrawer";

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [service, setService] = useState(null);
  const [related, setRelated] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------ */
  /* 🧠 Fetch current service + related ones from Supabase         */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch the current service
        const { data: svcData, error: svcErr } = await supabase
          .from("services")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (svcErr) throw svcErr;
        setService(svcData);

        // Fetch related services (same category)
        const { data: relData } = await supabase
          .from("services")
          .select("*")
          .eq("category", svcData.category)
          .eq("is_active", true)
          .neq("slug", slug)
          .limit(4);

        setRelated(relData || []);
      } catch (err) {
        console.error("❌ Service detail fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  /* ------------------------------------------------------------ */
  /* 🧱 Render Layout                                              */
  /* ------------------------------------------------------------ */
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* 🌐 Global header */}
      <UniversalHeader />

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center text-slate-500">
          <Loader2 className="animate-spin w-8 h-8 mb-4 text-[#9B5CF8]" />
          Loading service details…
        </div>
      ) : !service ? (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <p className="text-slate-500">Service not found.</p>
          <button
            onClick={() => router.push("/services")}
            className="mt-4 px-4 py-2 rounded-lg bg-[#5A5DF0] text-white text-sm"
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          {/* 🔙 Back */}
          <div className="max-w-6xl mx-auto w-full pt-20 px-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-[#5A5DF0] dark:text-[#EC6ECF] hover:underline"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          {/* 🌆 Hero section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative max-w-6xl mx-auto w-full rounded-3xl overflow-hidden mt-4 mb-10
                       shadow-lg bg-gradient-to-br from-[#F8F7FF] to-[#EAE8FF]
                       dark:from-[#0D0B2B] dark:to-[#1B1545]"
          >
            <div className="relative w-full h-[300px] md:h-[420px]">
              <Image
                src={service.image_url || "/placeholder.png"}
                alt={service.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white z-10">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                  {service.title}
                </h1>
                <p className="max-w-lg text-sm md:text-base text-gray-200">
                  {service.description}
                </p>
              </div>
            </div>
          </motion.section>

          {/* 💰 Price & booking */}
          <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto w-full px-6 mb-10">
            <p className="text-2xl font-semibold text-[#5A5DF0] dark:text-[#EC6ECF] mb-3 md:mb-0">
              ₹{service.price}{" "}
              <span className="text-sm text-slate-500">
                / {service.unit || "unit"}
              </span>
            </p>
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF]
                         text-white font-semibold shadow-md hover:opacity-90 transition"
            >
              Book Now <ArrowUpRight size={18} />
            </button>

            <ServiceBookDrawer
              service={service}
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            />
          </div>

          {/* 📋 Details & gallery */}
          <div className="max-w-6xl mx-auto w-full px-6 mb-14">
            <h2 className="text-lg font-semibold mb-3 text-[#5A5DF0] dark:text-[#EC6ECF]">
              What’s Included
            </h2>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2 mb-6">
              <li>✅ Expert labor included</li>
              <li>❌ Materials not included</li>
              <li>🕐 Average duration: 1–2 hours</li>
            </ul>
            {service.gallery?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {service.gallery.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img.url}
                    alt={`Gallery ${idx}`}
                    width={300}
                    height={200}
                    className="rounded-xl object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* 🔁 Related services */}
          {related.length > 0 && (
            <div className="max-w-6xl mx-auto w-full px-6 pb-24">
              <h3 className="text-lg font-semibold mb-4 text-[#5A5DF0] dark:text-[#EC6ECF]">
                Related Services
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((r) => (
                  <motion.div
                    key={r.id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => router.push(`/services/${r.slug}`)}
                    className="cursor-pointer bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700
                               overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="relative h-32">
                      <Image
                        src={r.image_url || "/placeholder.png"}
                        alt={r.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm">{r.title}</h4>
                      {r.price && (
                        <p className="text-xs text-slate-500 mt-1">
                          ₹{r.price} / {r.unit}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
