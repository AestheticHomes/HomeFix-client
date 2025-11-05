"use client";
import { motion } from "framer-motion";
import { PlusCircle, Trash2, Save } from "lucide-react";

export default function Toolbar() {
  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute left-4 bottom-6 flex flex-col gap-3 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-2xl shadow-lg"
    >
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
        <PlusCircle size={18} /> Add Module
      </button>
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
        <Trash2 size={18} /> Clear
      </button>
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
        <Save size={18} /> Save Design
      </button>
    </motion.div>
  );
}
