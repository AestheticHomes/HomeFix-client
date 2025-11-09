"use client";
/**
 * ============================================================
 * File: /components/AuthCenterDrawer.tsx
 * Version: v13.0 — LiveSync Verified Edition 🌿
 * ------------------------------------------------------------
 * ✅ Triggers `profile-updated` event after any change (name/email/verify)
 * ✅ Auto-normalizes phone number before save
 * ✅ Merges API response into cache + context
 * ✅ Ensures real-time profile reload on /profile
 * ✅ Toast-safe + haptic feedback retained
 * ============================================================
 */

import OTPInput from "@/components/OTPInput";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useOtpManager } from "@/hooks/useOtpManager";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail, Phone, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Panel = "form" | "phone-otp" | "email-otp" | "success";

/* 🔧 Helper: Normalize phone */
function normalizePhone(raw: string): string {
  if (!raw) return "";
  let p = raw.replace(/\D/g, "");
  if (p.startsWith("91") && p.length === 12) return "+" + p;
  if (p.length === 10) return "+91" + p;
  if (p.startsWith("+91")) return p;
  return "+91" + p.slice(-10);
}

export default function AuthCenterDrawer({
  open,
  onClose,
  standalone = false,
  initialMode = "form",
}: {
  open: boolean;
  onClose?: () => void;
  standalone?: boolean;
  initialMode?: Panel | "form";
}) {
  const { success, error } = useToast();
  const { user, login } = useUser();
  const { sendOtp, verifyOtp, loading, verifying } = useOtpManager();

  const [panel, setPanel] = useState<Panel>("form");
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [origPhone, setOrigPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const otpRefs = useRef<HTMLInputElement[]>([]);

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneChanged = useMemo(() => {
    const normalizedOrig = origPhone.replace(/\D/g, "").replace(/^91/, "");
    return phoneDigits.length === 10 && phoneDigits !== normalizedOrig;
  }, [phoneDigits, origPhone]);

  /* ------------------------------------------------------------
     Prefill cached data
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!open) return;
    const cached = JSON.parse(localStorage.getItem("user") || "null");
    const pre = cached || user || {};
    setName(pre.name || pre.full_name || "");
    const p = (pre.phone || "")
      .toString()
      .replace(/\D/g, "")
      .replace(/^91/, "");
    setPhone(p || "");
    setOrigPhone(pre.phone || p || "");
    setPhoneVerified(!!pre.phone_verified || pre.loggedOut === false);
    setEmail(pre.email || "");
    setEmailVerified(!!pre.email_verified);
    setPanel(initialMode === "form" ? "form" : (initialMode as Panel));
    setOtp("");
  }, [open, user, initialMode]);

  /* ------------------------------------------------------------
     Save Name + Email (with LiveSync dispatch)
  ------------------------------------------------------------ */
  async function saveNameEmail() {
    setSaving(true);
    try {
      const cached = JSON.parse(localStorage.getItem("user") || "{}");
      const phoneSafe = normalizePhone(
        cached?.phone || (phoneDigits ? `+91${phoneDigits}` : "")
      );

      if (!phoneSafe) {
        error("Verify your phone before saving.");
        setSaving(false);
        return;
      }

      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phoneSafe,
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Save failed");

      const updatedUser = { ...cached, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      login(updatedUser, true);

      // ✅ LiveSync trigger — ProfilePage listens to this event
      window.dispatchEvent(new Event("profile-updated"));

      success("Profile updated successfully!");
      navigator.vibrate?.(20);
      setPanel("success");

      setTimeout(() => {
        setPanel("form");
        onClose?.();
      }, 1200);
    } catch (err: any) {
      console.error("💥 [saveNameEmail]", err.message);
      error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  /* ------------------------------------------------------------
     OTP Flow (LiveSync integrated)
  ------------------------------------------------------------ */
  const handlePhoneOtpSend = async () => {
    const ok = await sendOtp(phoneDigits, "phone");
    if (ok) setPanel("phone-otp");
  };

  const handlePhoneOtpVerify = async () => {
    const verified = await verifyOtp(otp, phoneDigits, "phone");
    if (verified) {
      setPhoneVerified(true);
      setOrigPhone(`+91${phoneDigits}`);
      window.dispatchEvent(new Event("profile-updated")); // ✅ LiveSync
      setPanel("success");
      setTimeout(() => setPanel("form"), 1500);
    }
  };

  const handleEmailOtpSend = async () => {
    const ok = await sendOtp(email, "email");
    if (ok) setPanel("email-otp");
  };

  const handleEmailOtpVerify = async () => {
    const verified = await verifyOtp(otp, email, "email");
    if (verified) {
      setEmailVerified(true);
      window.dispatchEvent(new Event("profile-updated")); // ✅ LiveSync
      setPanel("success");
      setTimeout(() => setPanel("form"), 1500);
    }
  };

  /* ------------------------------------------------------------
     Verify Pills
  ------------------------------------------------------------ */
  const EmailVerifyPill = emailVerified ? (
    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
      <Check size={14} /> Verified
    </span>
  ) : (
    <button
      onClick={handleEmailOtpSend}
      disabled={loading}
      className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
    >
      Unverified — Verify
    </button>
  );

  const PhoneInlineAction = isPhoneChanged ? (
    <button
      onClick={handlePhoneOtpSend}
      disabled={loading}
      className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
    >
      Verify new number
    </button>
  ) : phoneVerified ? (
    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
      <Check size={14} /> Verified
    </span>
  ) : (
    <button
      onClick={handlePhoneOtpSend}
      disabled={loading}
      className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
    >
      Verify
    </button>
  );

  /* ------------------------------------------------------------
     UI Panels
  ------------------------------------------------------------ */
  const PanelContent = (
    <AnimatePresence mode="wait">
      {panel === "form" && (
        <motion.div key="form" className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-4">Account Center</h2>

          {/* Name */}
          <label className="text-sm text-gray-500">Name</label>
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 mb-3 dark:border-slate-700">
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
          <div className="flex items-center border rounded-xl px-3 py-2 mb-3 dark:border-slate-700">
            <Phone size={18} className="text-emerald-600 mr-2" />
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
            {PhoneInlineAction}
          </div>

          {/* Email */}
          <label className="text-sm text-gray-500">Email</label>
          <div className="flex items-center border rounded-xl px-3 py-2 dark:border-slate-700">
            <Mail size={18} className="text-emerald-600 mr-2" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                const newEmail = e.target.value.trim();
                setEmail(newEmail);

                // ✅ Keep verified if user re-enters same verified email
                const cached = JSON.parse(localStorage.getItem("user") || "{}");
                const cachedEmail = cached?.email?.trim()?.toLowerCase();

                if (cachedEmail && newEmail.toLowerCase() === cachedEmail) {
                  setEmailVerified(true);
                } else {
                  setEmailVerified(false);
                }
              }}
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {EmailVerifyPill}
          </div>

          <button
            onClick={saveNameEmail}
            disabled={saving}
            className="w-full py-3 mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold active:scale-[0.98]"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </motion.div>
      )}

      {/* Phone OTP */}
      {panel === "phone-otp" && (
        <motion.div key="phone" className="p-6">
          <h3 className="font-semibold mb-2">Verify Phone</h3>
          <p className="text-sm text-gray-600 mb-2">
            Enter the OTP sent to +91 {phoneDigits}
          </p>
          <OTPInput otp={otp} setOtp={setOtp} refs={otpRefs} />
          <button
            onClick={handlePhoneOtpVerify}
            disabled={verifying}
            className="w-full mt-3 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </motion.div>
      )}

      {/* Email OTP */}
      {panel === "email-otp" && (
        <motion.div key="email" className="p-6">
          <h3 className="font-semibold mb-2">Verify Email</h3>
          <p className="text-sm text-gray-600 mb-2">
            Enter the OTP sent to {email}
          </p>
          <OTPInput otp={otp} setOtp={setOtp} refs={otpRefs} />
          <button
            onClick={handleEmailOtpVerify}
            disabled={verifying}
            className="w-full mt-3 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </motion.div>
      )}

      {/* Success */}
      {panel === "success" && (
        <motion.div key="success" className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-600 text-white mx-auto rounded-full flex items-center justify-center shadow-xl"
          >
            <Check size={40} />
          </motion.div>
          <p className="mt-3 text-green-600 font-semibold">
            Verified Successfully
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ------------------------------------------------------------
     Drawer Layout
  ------------------------------------------------------------ */
  if (standalone) {
    return (
      <motion.div className="min-h-screen flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl">
          {PanelContent}
        </div>
      </motion.div>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="bg-white dark:bg-slate-900 rounded-t-3xl">
        <DrawerHeader>
          <DrawerTitle className="text-center">Account Center</DrawerTitle>
          <DrawerDescription className="text-center text-xs">
            Manage your profile and verification
          </DrawerDescription>
        </DrawerHeader>
        {PanelContent}
      </DrawerContent>
    </Drawer>
  );
}
