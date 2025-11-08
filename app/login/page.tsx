"use client";

/**
 * ============================================================
 * File: /app/login/page.tsx
 * Version: v14.4 — Enter Key + Smooth OTP UX 🌿
 * ------------------------------------------------------------
 * ✅ Press "Enter" auto-sends or verifies OTP
 * ✅ Auto-focus OTP input on switch
 * ✅ Supabase /api/link-otp-user linkage
 * ✅ Remember Me checked (persistent)
 * ✅ Haptic feedback + robust logging
 * ============================================================
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, Phone } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import OTPInput from "@/components/OTPInput";
import { supabase } from "@/lib/supabaseClient";
import { useOtpManager } from "@/hooks/useOtpManager";

export default function LoginPage() {
  const { user, login } = useUser();
  const router = useRouter();
  const { sendOtp, verifyOtp, loading: otpLoading, verifying: otpVerifying } =
    useOtpManager();

  const [panel, setPanel] = useState<"form" | "otp" | "success">("form");
  const [phone, setPhone] = useState(localStorage.getItem("hf_last_phone") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<HTMLInputElement[]>([]);
  const phoneDigits = phone.replace(/\D/g, "");

  /* ------------------------------------------------------------
     🚀 Auto-redirect if already logged in
  ------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      const cached = JSON.parse(localStorage.getItem("user") || "null");
      if (cached?.loggedIn || cached?.phone_verified) {
        console.log("🔁 [Login] Cached session detected:", cached.phone);
        router.replace("/profile");
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        console.log("🌱 [Login] Supabase user active:", data.user.id);
        router.replace("/profile");
      }
    })();
  }, [router]);

  /* ------------------------------------------------------------
     📩 Send OTP
  ------------------------------------------------------------ */
  async function handleSendOtp() {
    if (phoneDigits.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const success = await sendOtp(phoneDigits, "phone");
      if (success) {
        toast.success(`OTP sent successfully to +91 ${phoneDigits}`);
        console.log("📨 [OTP] Sent to +91", phoneDigits);
        navigator.vibrate?.(30);
        setPanel("otp");
        setTimeout(() => otpRefs.current[0]?.focus(), 200);
      } else throw new Error("Send failed");
    } catch (err) {
      console.error("❌ [OTP] Send failed:", err);
      toast.error("Failed to send OTP. Please try again.");
      navigator.vibrate?.([80, 40, 80]);
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------
   🔐 Verify OTP + Supabase Upsert
------------------------------------------------------------ */
async function handleVerifyOtp() {
  if (otp.length !== 6) {
    toast.error("Please enter the 6-digit OTP.");
    return;
  }

  try {
    const verified = await verifyOtp(otp, phoneDigits, "phone");
    if (!verified) throw new Error("Invalid OTP");

    const phoneFull = `+91${phoneDigits}`;
    let userId = Date.now().toString();

    // 🔗 Step 1 — Check if user already exists in Supabase
    const { data: existing, error: fetchErr } = await supabase
      .from("user_profiles")
      .select("id,name,phone,email,address,phone_verified,email_verified,latitude,longitude,role")
      .eq("phone", phoneFull)
      .maybeSingle();

    if (fetchErr) console.warn("⚠️ [Login] Fetch existing failed:", fetchErr);

    // 🔗 Step 2 — If no record, insert a new one
    let profileData = existing;
    if (!existing) {
      const { data: inserted, error: insertErr } = await supabase
        .from("user_profiles")
        .insert([
          {
            phone: phoneFull,
            phone_verified: true,
            created_at: new Date().toISOString(),
            role: "client",
          },
        ])
        .select()
        .single();

      if (insertErr) throw insertErr;
      profileData = inserted;
      userId = inserted.id;
      console.log("🧩 [Login] New profile created:", inserted);
    } else {
      userId = existing.id;
      // Update verification flag if needed
      if (!existing.phone_verified) {
        await supabase
          .from("user_profiles")
          .update({ phone_verified: true })
          .eq("id", existing.id);
      }
    }

    // 🔗 Step 3 — Cache & Login via Context
    const userData = {
      id: userId,
      phone: phoneFull,
      phone_verified: true,
      email: profileData?.email || "",
      name: profileData?.name || "",
      address: profileData?.address || "",
      latitude: profileData?.latitude,
      longitude: profileData?.longitude,
      role: profileData?.role || "client",
      loggedIn: true,
    };

    login(userData, true);
    localStorage.setItem("user", JSON.stringify(userData));
    document.cookie = `hf_user_phone=${userData.phone}; Path=/; Max-Age=604800`;
    document.cookie = `hf_user_id=${userId}; Path=/; Max-Age=604800`;

    console.log("✅ [Login] Linked & logged in user:", userData);
    toast.success("Welcome to HomeFix — Login successful!");
    navigator.vibrate?.([60, 40, 120]);
    setPanel("success");

    setTimeout(() => router.replace("/profile"), 1500);
  } catch (err) {
    console.error("❌ [Login] Verify failed:", err);
    toast.error("Invalid OTP or server error. Please try again.");
    navigator.vibrate?.([120]);
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
      <h2 className="text-xl font-semibold text-emerald-700 mb-4">
        Welcome to HomeFix
      </h2>

      {/* 📱 Phone Field */}
      <label className="text-sm text-gray-500">Mobile Number</label>
      <div className="flex items-center gap-2 border rounded-xl px-3 py-2 mb-3 bg-white dark:bg-slate-800">
        <Phone size={18} className="text-emerald-600" />
        <input
          type="tel"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      {/* 🔒 Remember Me (always checked) */}
      <label className="flex items-center gap-2 mb-5 text-sm text-gray-500">
        <input type="checkbox" checked readOnly className="accent-emerald-600" />
        <span>Remember me</span>
      </label>

      <button
        onClick={handleSendOtp}
        disabled={loading || otpLoading}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition active:scale-[0.97]"
      >
        {loading || otpLoading ? "Sending..." : "Send OTP"}
      </button>
    </div>
  );

  const OtpPanel = (
    <div className="p-6 sm:p-8 text-center">
      <h2 className="text-lg font-semibold text-emerald-700 mb-2">Verify OTP</h2>
      <p className="text-sm text-gray-600 mb-2">
        Enter OTP sent to +91 {phoneDigits}
      </p>
      <OTPInput otp={otp} setOtp={setOtp} refs={otpRefs} />
      <button
        onClick={handleVerifyOtp}
        disabled={otpVerifying}
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
  return (
    <main className="min-h-screen flex items-end sm:items-center justify-center bg-gray-50 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl"
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
