"use client";
/**
 * AuthCenterDrawer v12.5 — Seamless Verify Flow 🌿
 * ------------------------------------------------------------
 * ✅ Edit name & email (Save Changes)
 * ✅ Dynamic email verify pill
 * ✅ Phone OTP verify (mandatory on change)
 * ✅ Smooth animated success screen
 * ✅ Works above mobile nav, centered on desktop
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail, Phone, UserRound } from "lucide-react";
import BaseDrawer from "@/components/BaseDrawer";
import OTPInput from "@/components/OTPInput";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

type Panel = "form" | "phone-otp" | "email-otp" | "success";

interface AuthCenterDrawerProps {
  open: boolean;
  onClose?: () => void;
  standalone?: boolean;
  initialMode?: Panel | "form";
}

export default function AuthCenterDrawer({
  open,
  onClose,
  standalone = false,
  initialMode = "form",
}: AuthCenterDrawerProps) {
  const { toast } = useToast();
  const { user, login } = useUser();

  const [panel, setPanel] = useState<Panel>("form");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

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
    const p = (pre.phone || "").toString().replace(/\D/g, "").replace(
      /^91/,
      "",
    );
    setPhone(p || "");
    setOrigPhone(pre.phone || p || "");
    setPhoneVerified(!!pre.phone_verified || pre.loggedOut === false);
    setEmail(pre.email || "");
    setEmailVerified(!!pre.email_verified);
    setPanel(initialMode === "form" ? "form" : (initialMode as Panel));
    setOtp("");
  }, [open, user, initialMode]);

  /* ------------------------------------------------------------
     Save Name + Email
  ------------------------------------------------------------ */
  async function saveNameEmail() {
    setLoading(true);
    try {
      const cached = JSON.parse(localStorage.getItem("user") || "{}");
      const phoneSafe = cached?.phone ||
        (phoneDigits ? `+91${phoneDigits}` : null);

      if (!phoneSafe) {
        toast({
          title: "Phone number missing",
          description: "Verify your phone before saving.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const payload = { name, email, phone: phoneSafe };
      console.log("📤 [Profile Save] →", payload);

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Save failed");
      }

      const updatedUser = { ...cached, ...payload };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      login(updatedUser, true);
      document.cookie = `hf_user_phone=${phoneSafe}; Path=/; Max-Age=604800`;

      toast({ title: "Profile saved", description: "Changes updated." });
      navigator.vibrate?.(20);
      setPanel("success");
      setTimeout(() => {
        setPanel("form");
        onClose?.();
      }, 1200);
    } catch (err: any) {
      console.error("💥 [saveNameEmail Error]", err.message);
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------
     PHONE: Send + Verify OTP
  ------------------------------------------------------------ */
  async function apiSendPhoneOtp() {
    if (phoneDigits.length !== 10) {
      return toast({
        title: "Enter a valid 10-digit number",
        variant: "destructive",
      });
    }

    // 🧹 Clear stale cookies before OTP send
    ["hf_user_id", "hf_user_phone", "hf_user_email", "hf_user_verified"]
      .forEach(
        (key) => (document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax`),
      );

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phoneDigits}`, action: "send" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      toast({ title: "OTP sent", description: `+91 ${phoneDigits}` });
      navigator.vibrate?.(30);
      setPanel("phone-otp");
      setOtp("");
    } catch (err: any) {
      toast({ title: "Failed to send OTP", variant: "destructive" });
      console.error("💥 [OTP SEND ERROR]", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function apiVerifyPhoneOtp() {
    if (otp.length !== 6) return toast({ title: "Enter 6-digit OTP" });
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phoneDigits}`, otp }),
      });
      const data = await res.json();
      if (!res.ok || !(data.success || data.verified)) throw new Error();

      const verifiedUser = {
        id: data.user_id || Date.now().toString(),
        name,
        email,
        phone: `+91${phoneDigits}`,
        phone_verified: true,
        loggedOut: false,
      };
      login(verifiedUser, true);
      localStorage.setItem("user", JSON.stringify(verifiedUser));
      setPhoneVerified(true);
      setOrigPhone(`+91${phoneDigits}`);
      toast({ title: "Phone verified successfully" });
      navigator.vibrate?.([60, 40, 120]);
      setPanel("success");
      setTimeout(() => {
        setPanel("form");
        onClose?.();
      }, 1500);
    } catch {
      toast({ title: "Invalid OTP", variant: "destructive" });
      navigator.vibrate?.([120]);
    } finally {
      setVerifying(false);
    }
  }

  /* ------------------------------------------------------------
     EMAIL: Send + Verify OTP
  ------------------------------------------------------------ */
  async function apiSendEmailOtp() {
    if (!email) return toast({ title: "Enter email to verify" });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      toast({ title: "Email OTP sent", description: email });
      navigator.vibrate?.(30);
      setPanel("email-otp");
      setOtp("");
    } catch {
      toast({ title: "Failed to send Email OTP", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function apiVerifyEmailOtp() {
    if (otp.length !== 6) return toast({ title: "Enter 6-digit OTP" });
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();

      const cached = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...cached, email_verified: true, email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      login(updatedUser, true);
      setEmailVerified(true);

      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: updatedUser.phone,
          email: updatedUser.email,
          name: updatedUser.name,
          email_verified: true,
        }),
      });

      toast({ title: "Email verified" });
      navigator.vibrate?.([60, 40, 120]);
      setPanel("success");
      setTimeout(() => {
        setPanel("form");
        onClose?.();
      }, 1500);
    } catch {
      toast({ title: "Invalid OTP", variant: "destructive" });
      navigator.vibrate?.([120]);
    } finally {
      setVerifying(false);
    }
  }

  /* ------------------------------------------------------------
     Dynamic Verify Pills
  ------------------------------------------------------------ */
  const EmailVerifyPill = emailVerified
    ? (
      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
        <Check size={14} /> Verified
      </span>
    )
    : (
      <button
        onClick={apiSendEmailOtp}
        className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
      >
        Unverified — Verify
      </button>
    );

  const PhoneInlineAction = isPhoneChanged
    ? (
      <button
        onClick={apiSendPhoneOtp}
        className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
      >
        Verify new number
      </button>
    )
    : phoneVerified
    ? (
      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
        <Check size={14} /> Verified
      </span>
    )
    : (
      <button
        onClick={apiSendPhoneOtp}
        className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
      >
        Verify
      </button>
    );

  /* ------------------------------------------------------------
     Panels
  ------------------------------------------------------------ */
  const PhoneOtpPanel = (
    <div className="p-6">
      <h3 className="font-semibold mb-2">Verify Phone</h3>
      <p className="text-sm text-gray-600 mb-2">
        Enter the OTP sent to +91 {phoneDigits}
      </p>
      <OTPInput otp={otp} setOtp={setOtp} refs={otpRefs} />
      <button
        onClick={apiVerifyPhoneOtp}
        disabled={verifying}
        className="w-full mt-3 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold active:scale-[0.98]"
      >
        {verifying ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );

  const EmailOtpPanel = (
    <div className="p-6">
      <h3 className="font-semibold mb-2">Verify Email</h3>
      <p className="text-sm text-gray-600 mb-2">
        Enter the OTP sent to {email}
      </p>
      <OTPInput otp={otp} setOtp={setOtp} refs={otpRefs} />
      <button
        onClick={apiVerifyEmailOtp}
        disabled={verifying}
        className="w-full mt-3 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold active:scale-[0.98]"
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
      <p className="mt-3 text-green-600 font-semibold">Verified Successfully</p>
    </div>
  );

  /* ------------------------------------------------------------
     Main Form Panel
  ------------------------------------------------------------ */
  const FormPanel = (
    <div className="p-6 sm:p-8">
      <h2 className="text-lg font-semibold mb-4">Account Center</h2>

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

      <label className="text-sm text-gray-500">Phone</label>
      <div className="flex items-center border rounded-xl px-3 py-2 mb-3 dark:border-slate-700">
        <Phone size={18} className="text-emerald-600 mr-2" />
        <input
          type="tel"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          className="flex-1 bg-transparent outline-none text-sm"
        />
        {PhoneInlineAction}
      </div>

      <label className="text-sm text-gray-500">Email</label>
      <div className="flex items-center border rounded-xl px-3 py-2 dark:border-slate-700">
        <Mail size={18} className="text-emerald-600 mr-2" />
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailVerified) setEmailVerified(false);
          }}
          className="flex-1 bg-transparent outline-none text-sm"
        />
        {EmailVerifyPill}
      </div>

      <button
        onClick={saveNameEmail}
        disabled={loading}
        className="w-full py-3 mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold active:scale-[0.98]"
        style={{
          marginBottom:
            "calc(var(--mbnav-h,72px) + env(safe-area-inset-bottom))",
        }}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  /* ------------------------------------------------------------
     Drawer Card Layout
  ------------------------------------------------------------ */
  const Card = (
    <AnimatePresence mode="wait">
      {panel === "form" && <motion.div key="form">{FormPanel}</motion.div>}
      {panel === "phone-otp" && (
        <motion.div key="phone">{PhoneOtpPanel}</motion.div>
      )}
      {panel === "email-otp" && (
        <motion.div key="email">{EmailOtpPanel}</motion.div>
      )}
      {panel === "success" && (
        <motion.div key="success">{SuccessPanel}</motion.div>
      )}
    </AnimatePresence>
  );

  return standalone
    ? (
      <motion.div className="min-h-screen flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl">
          {Card}
        </div>
      </motion.div>
    )
    : (
      <BaseDrawer open={open} onClose={onClose as () => void} side="bottom">
        <div
          className="pointer-events-auto flex justify-center px-3"
          style={{
            paddingBottom:
              "calc(var(--mbnav-h,72px) + env(safe-area-inset-bottom))",
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl">
            {Card}
          </div>
        </div>
      </BaseDrawer>
    );
}
