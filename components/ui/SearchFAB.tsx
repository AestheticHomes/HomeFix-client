"use client";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function SearchFAB() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname !== "/store") return null;

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-5 z-fab w-14 h-14 rounded-full
                   bg-gradient-to-r from-accent-mid to-accent-end text-white
                   shadow-gemini flex items-center justify-center"
      >
        <Search className="w-5 h-5" />
      </motion.button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-modal bg-black/40 backdrop-blur-sm flex items-start justify-center pt-28"
          onClick={() => setOpen(false)}
        >
          <motion.div
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
            className="w-11/12 sm:w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4"
          >
            <input
              autoFocus
              placeholder="Search hardware, doors, CNC panels..."
              className="w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-mid"
            />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
