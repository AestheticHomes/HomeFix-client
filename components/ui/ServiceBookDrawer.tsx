"use client";
//components/ui/ServiceBookDrawer.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, X, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/* 📦 TYPE DEFINITIONS                                                        */
/* -------------------------------------------------------------------------- */
interface ServiceItem {
  id: number;
  title: string;
  description: string;
  price: number;
  unit: string;
  slug: string;
}

interface ServiceBookDrawerProps {
  service: ServiceItem | null;
  open: boolean;
  onClose: () => void;
}

/* -------------------------------------------------------------------------- */
/* 🧱 COMPONENT                                                               */
/* -------------------------------------------------------------------------- */
export default function ServiceBookDrawer({
  service,
  open,
  onClose,
}: ServiceBookDrawerProps) {
  const router = useRouter();
  const [date, setDate] = useState<string>("");
  const [slot, setSlot] = useState<string>("");

  const today = new Date();
  const slots = [
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "3:00 PM - 5:00 PM",
    "5:00 PM - 7:00 PM",
  ];

  useEffect(() => {
    if (!open) {
      setDate("");
      setSlot("");
    }
  }, [open]);

  if (!service) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 22 }}
          className="fixed bottom-0 left-0 right-0 z-[90] bg-white dark:bg-slate-900 
                     shadow-[0_-4px_30px_rgba(0,0,0,0.1)] rounded-t-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]">
              Book {service.title}
            </h3>
            <button onClick={onClose}>
              <X size={18} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Price */}
            <div>
              <p className="text-sm text-slate-500">Service Price</p>
              <p className="text-2xl font-semibold text-[#5A5DF0] dark:text-[#EC6ECF]">
                ₹{service.price}
                <span className="text-sm text-slate-500 ml-1">
                  / {service.unit}
                </span>
              </p>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">
                <CalendarDays className="inline-block w-4 h-4 mr-1 text-[#5A5DF0]" />
                Choose a date
              </label>
              <input
                type="date"
                min={format(today, "yyyy-MM-dd")}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-sm bg-white dark:bg-slate-800"
              />
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">
                <Clock className="inline-block w-4 h-4 mr-1 text-[#5A5DF0]" />
                Choose a time slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                      slot === s
                        ? "bg-gradient-to-r from-[#5A5DF0] to-[#EC6ECF] text-white border-transparent"
                        : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-[#F8F7FF] to-[#EAE8FF] dark:from-[#0D0B2B] dark:to-[#1B1545]">
            <button
              disabled={!date || !slot}
              onClick={() => {
                router.push(
                  `/checkout?service=${service.slug}&date=${encodeURIComponent(
                    date
                  )}&slot=${encodeURIComponent(slot)}`
                );
              }}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r 
                         from-[#5A5DF0] to-[#EC6ECF] hover:opacity-90 disabled:opacity-50 
                         flex items-center justify-center gap-2 transition"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
