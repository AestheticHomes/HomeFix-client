"use client";
/**
 * HomeFix India — Login/Signup v13.0 (Aurora Tier) 🌿
 * ------------------------------------------------------------
 * ✅ Modern, future-proof OTP login with session persistence
 * ✅ Auto-redirects if already logged in
 * ✅ Haptic feedback + Framer Motion transitions
 * ✅ Ready for mobile, desktop, and future PWA shells
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, Phone, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import OTPInput from "@/components/OTPInput";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const { toast } = useToast();
  const { user, login } = useUser();
  const router = useRouter();

  const [panel, setPanel] = useState<"form" | "otp" | "success">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const otpRefs = useRef<HTMLInputElement[]>([]);

  const phoneDigits = phone.replace(/\D/g, "");

  /* ------------------------------------------------------------
     🚀 Auto-redirect if already logged in
  ------------------------------------------------------------ */
  useEffect(() => {
    async function checkSession() {
      const cached = JSON.parse(localStorage.getItem("user") || "null");
      if (cached?.phone_verified || cached?.id) {
        toast({
          title: "Welcome back!",
          description: "You're already logged in.",
        });
        router.replace("/profile");
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        toast({ title: "Welcome back!", description: "Session restored." });
        router.replace("/profile");
      }
    }
    checkSession();
  }, [router, toast]);

  /* ------------------------------------------------------------
     📩 Send OTP
  ------------------------------------------------------------ */
  async function sendOtp() {
    if (phoneDigits.length !== 10) {
      toast({ title: "Enter valid 10-digit number", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phoneDigits}`, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");

      toast({ title: "OTP sent", description: `+91 ${phoneDigits}` });
      navigator.vibrate?.(30);
      setPanel("otp");
    } catch {
      toast({ title: "Failed to send OTP", variant: "destructive" });
      navigator.vibrate?.([80, 40, 80]);
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------
     🔐 Verify OTP
  ------------------------------------------------------------ */
  async function verifyOtp() {
    if (otp.length !== 6) return toast({ title: "Enter 6-digit OTP" });
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phoneDigits}`, otp }),
      });
      const data = await res.json();
      if (!res.ok || !(data.success || data.verified)) {
        throw new Error("Invalid OTP");
      }

      const userData = {
        id: data.user_id || Date.now().toString(),
        name,
        phone: `+91${phoneDigits}`,
        phone_verified: true,
        loggedOut: false,
      };

      login(userData, true);
      localStorage.setItem("user", JSON.stringify(userData));
      document.cookie =
        `hf_user_phone=${userData.phone}; Path=/; Max-Age=604800`;

      toast({ title: "Welcome to HomeFix", description: "Login successful" });
      navigator.vibrate?.([60, 40, 120]);
      setPanel("success");

      setTimeout(() => {
        router.replace("/profile");
      }, 1500);
    } catch {
      toast({ title: "Invalid OTP", variant: "destructive" });
      navigator.vibrate?.([120]);
    } finally {
      setVerifying(false);
    }
  }

  /* ------------------------------------------------------------
     🎨 Panels (Form / OTP / Success)
  ------------------------------------------------------------ */
  const FormPanel = (
    <div className="p-6 sm:p-8 relative">
      <motion.div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-lime-400 to-green-600 rounded-t-3xl"
        layoutId="glow"
      />
      <h2 className="text-xl font-semibold text-emerald-700 mb-4">
        Welcome to HomeFix
      </h2>

      {/* Name */}
      <label className="text-sm text-gray-500">Name</label>
      <div className="flex items-center gap-2 border rounded-xl px-3 py-2 mb-3 bg-white dark:bg-slate-800">
        <UserRound size={18} className="text-emerald-600" />
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      {/* Phone */}
      <label className="text-sm text-gray-500">Phone</label>
      <div className="flex items-center gap-2 border rounded-xl px-3 py-2 mb-4 bg-white dark:bg-slate-800">
        <Phone size={18} className="text-emerald-600" />
        <input
          type="tel"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      <button
        onClick={sendOtp}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition active:scale-[0.97]"
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>
    </div>
  );

  const OtpPanel = (
    <div className="p-6 sm:p-8 text-center">
      <h2 className="text-lg font-semibold text-emerald-700 mb-2">
        Verify OTP
      </h2>
      <p className="text-sm text-gray-600 mb-2">
        Enter OTP sent to +91 {phoneDigits}
      </p>
      <OTPInput otp={otp} setOtp={setOtp} refs={otpRefs} />
      <button
        onClick={verifyOtp}
        disabled={verifying}
        className="w-full mt-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition active:scale-[0.97]"
      >
        {verifying ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );

  const SuccessPanel = (
    <div className="p-8 text-center">
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 bg-green-600 text-white mx-auto rounded-full flex items-center justify-center shadow-xl"
      >
        <Check size={40} />
      </motion.div>
      <p className="mt-3 text-green-600 font-semibold">Login Successful</p>
    </div>
  );

  /* ------------------------------------------------------------
     🧱 Layout
  ------------------------------------------------------------ */
  const Card = (
    <AnimatePresence mode="wait">
      {panel === "form" && <motion.div key="form">{FormPanel}</motion.div>}
      {panel === "otp" && <motion.div key="otp">{OtpPanel}</motion.div>}
      {panel === "success" && (
        <motion.div key="success">{SuccessPanel}</motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <main className="min-h-screen flex items-end sm:items-center justify-center bg-gray-50 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl"
      >
        {Card}
      </motion.div>
    </main>
  );
}
