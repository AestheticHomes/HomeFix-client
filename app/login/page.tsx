"use client";

/**
 * ============================================================
 * 🪪 FILE: /app/login/page.tsx
 * VERSION: v14.9 — HomeFix OTP Login (Toast-Safe & Theme-Sync)
 * ------------------------------------------------------------
 * ✅ Uses unified useToast() (no duplicate Sonner calls)
 * ✅ Smart lock to prevent double-press on buttons or Enter
 * ✅ Auto-focus + haptic feedback for OTP entry
 * ✅ Theme-safe colors for both light & dark modes
 * ✅ Verified z-index overlay for toasts
 * ============================================================
 */

import OTPInput from "@/components/OTPInput";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useOtpManager } from "@/hooks/useOtpManager";
import { supabase } from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface HomeFixUser {
  id?: string;
  phone: string;
  phone_verified: boolean;
  role: string;
  loggedIn: boolean;
  email?: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export default function LoginPage() {
  const { login } = useUser();
  const router = useRouter();
  const {
    sendOtp,
    verifyOtp,
    loading: otpLoading,
    verifying: otpVerifying,
  } = useOtpManager();
  const { success, error } = useToast();

  const [panel, setPanel] = useState<"form" | "otp" | "success">("form");
  const [phone, setPhone] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("hf_last_phone") || ""
      : ""
  );
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const otpRefs = useRef<HTMLInputElement[]>([]);
  const phoneDigits = phone.replace(/\D/g, "");

  /* ------------------------------------------------------------
     🚀 Redirect if already logged in
  ------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      const cached = JSON.parse(localStorage.getItem("user") || "null");
      if (cached?.loggedIn || cached?.phone_verified) {
        router.replace("/profile");
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (data?.user) router.replace("/profile");
    })();
  }, [router]);

  /* ------------------------------------------------------------
     📩 Send OTP (Single Toast Safe)
  ------------------------------------------------------------ */
  async function handleSendOtp() {
    if (isProcessing || otpLoading || loading) return;

    if (phoneDigits.length !== 10) {
      error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsProcessing(true);
    setLoading(true);

    try {
      const sent = await sendOtp(phoneDigits, "phone");
      if (sent) {
        success(`OTP sent successfully to +91 ${phoneDigits}`);
        navigator.vibrate?.(30);
        setPanel("otp");
        setTimeout(() => otpRefs.current[0]?.focus(), 300);
      } else {
        error("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("💥 [OTP Send]", err);
      error("Server error while sending OTP.");
    } finally {
      setLoading(false);
      setTimeout(() => setIsProcessing(false), 300);
    }
  }

  /* ------------------------------------------------------------
     🔐 Verify OTP + Upsert Profile (Single Toast Safe)
  ------------------------------------------------------------ */
  async function handleVerifyOtp() {
    if (isProcessing || otpVerifying) return;
    if (otp.length !== 6) {
      error("Please enter the 6-digit OTP.");
      return;
    }

    setIsProcessing(true);

    try {
      const verified = await verifyOtp(otp, phoneDigits, "phone");
      if (!verified) {
        error("Invalid OTP. Please try again.");
        navigator.vibrate?.([120]);
        return;
      }

      const phoneFull = `+91${phoneDigits}`;
      const res = await fetch("/api/auth/upsert-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneFull, verified: true }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const userId: string = data.id;

      const userData: HomeFixUser = {
        id: userId,
        phone: phoneFull,
        phone_verified: true,
        role: "client",
        loggedIn: true,
      };

      login(userData, true);
      localStorage.setItem("user", JSON.stringify(userData));
      document.cookie = `hf_user_phone=${userData.phone}; Path=/; Max-Age=604800`;
      document.cookie = `hf_user_id=${userId}; Path=/; Max-Age=604800`;

      success("Welcome to HomeFix — Login successful!");
      navigator.vibrate?.([60, 40, 120]);
      setPanel("success");
      setTimeout(() => router.replace("/profile"), 1600);
    } catch (err) {
      console.error("💥 [Verify OTP]", err);
      error("Verification failed. Please try again.");
      navigator.vibrate?.([120]);
    } finally {
      setTimeout(() => setIsProcessing(false), 400);
    }
  }

  /* ------------------------------------------------------------
     ⌨️ Handle Enter key globally
  ------------------------------------------------------------ */
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (panel === "form") handleSendOtp();
        if (panel === "otp") handleVerifyOtp();
      }
    }
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [panel, phone, otp]);

  /* ------------------------------------------------------------
     🎨 Panels
  ------------------------------------------------------------ */
  const FormPanel = (
    <div className="p-6 sm:p-8 relative">
      <motion.div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-lime-400 to-green-600 rounded-t-3xl"
        layoutId="glow"
      />
      <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
        Welcome to HomeFix
      </h2>

      <label className="text-sm text-gray-600 dark:text-gray-300">
        Mobile Number
      </label>
      <div className="flex items-center gap-2 border rounded-xl px-3 py-2 mb-3 bg-white dark:bg-slate-800 dark:border-slate-600">
        <Phone size={18} className="text-emerald-600 dark:text-emerald-400" />
        <input
          type="tel"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
        />
      </div>

      <label className="flex items-center gap-2 mb-5 text-sm text-gray-600 dark:text-gray-300">
        <input
          type="checkbox"
          checked
          readOnly
          className="accent-emerald-600"
        />
        <span>Remember me</span>
      </label>

      <button
        onClick={handleSendOtp}
        disabled={loading || otpLoading || isProcessing}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition active:scale-[0.97]"
      >
        {loading || otpLoading ? "Sending..." : "Send OTP"}
      </button>
    </div>
  );

  const OtpPanel = (
    <div className="p-6 sm:p-8 text-center">
      <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
        Verify OTP
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        Enter OTP sent to +91 {phoneDigits}
      </p>
      <OTPInput otp={otp} setOtp={setOtp} refs={otpRefs} />
      <button
        onClick={handleVerifyOtp}
        disabled={otpVerifying || isProcessing}
        className="w-full mt-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition active:scale-[0.97]"
      >
        {otpVerifying ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );

  const SuccessPanel = (
    <div className="p-8 text-center">
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-20 h-20 bg-green-600 text-white mx-auto rounded-full flex items-center justify-center shadow-xl"
      >
        <Check size={40} />
      </motion.div>
      <p className="mt-3 text-green-600 dark:text-green-400 font-semibold">
        Login Successful
      </p>
    </div>
  );

  /* ------------------------------------------------------------
     🧱 Layout
  ------------------------------------------------------------ */
  return (
    <main className="min-h-screen flex items-end sm:items-center justify-center bg-gray-50 dark:bg-slate-900 relative">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-[10000]"
      >
        <AnimatePresence mode="wait">
          {panel === "form" && <motion.div key="form">{FormPanel}</motion.div>}
          {panel === "otp" && <motion.div key="otp">{OtpPanel}</motion.div>}
          {panel === "success" && (
            <motion.div key="success">{SuccessPanel}</motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
