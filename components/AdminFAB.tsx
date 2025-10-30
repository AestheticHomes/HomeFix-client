"use client";
import { useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function AdminFAB() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setIsAdmin(false);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    })();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="fixed bottom-20 right-5 z-[8000] bg-white/80 dark:bg-zinc-900/80 p-3 rounded-full shadow-md">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <motion.button
      onClick={() => router.push("/profile")}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-20 right-5 z-[8000] bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl w-12 h-12 flex items-center justify-center"
      title="Go to Admin Dashboard"
    >
      <Shield className="h-5 w-5" />
    </motion.button>
  );
}
