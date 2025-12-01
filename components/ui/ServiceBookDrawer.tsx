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
          className="fixed bottom-0 left-0 right-0 z-[90] bg-card text-foreground 
                     shadow-[0_-4px_30px_rgba(0,0,0,0.1)] rounded-t-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-primary">
              Book {service.title}
            </h3>
            <button onClick={onClose}>
              <X size={18} className="text-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Price */}
            <div>
              <p className="text-sm text-muted">Service Price</p>
              <p className="text-2xl font-semibold text-primary">
                ₹{service.price}
                <span className="text-sm text-muted ml-1">
                  / {service.unit}
                </span>
              </p>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium mb-1 text-muted">
                <CalendarDays className="inline-block w-4 h-4 mr-1 text-primary" />
                Choose a date
              </label>
              <input
                type="date"
                min={format(today, "yyyy-MM-dd")}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border p-2 text-sm bg-card text-foreground"
              />
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-sm font-medium mb-1 text-muted">
                <Clock className="inline-block w-4 h-4 mr-1 text-primary" />
                Choose a time slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                      slot === s
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-card border border-border text-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-muted leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-border bg-[var(--surface-overlay)]">
            <button
              disabled={!date || !slot}
              onClick={() => {
                router.push(
                  `/checkout?service=${service.slug}&date=${encodeURIComponent(
                    date
                  )}&slot=${encodeURIComponent(slot)}`
                );
              }}
              className="w-full py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 
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
