"use client";
/**
 * ============================================================
 * 🌿 HomeFix — useOtpManager (v3.0 Unified Toast Edition)
 * ------------------------------------------------------------
 * ✅ Uses global useToast() (no duplicate toasts)
 * ✅ Clean API endpoints: send & verify for phone/email
 * ✅ Boolean returns for easy UI binding
 * ✅ Haptic feedback and verbose logging retained
 * ============================================================
 */

import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface UseOtpManager {
  sendOtp: (target: string, type: "phone" | "email") => Promise<boolean>;
  verifyOtp: (
    otp: string,
    target: string,
    type: "phone" | "email"
  ) => Promise<boolean>;
  loading: boolean;
  verifying: boolean;
}

export function useOtpManager(): UseOtpManager {
  if (typeof window === "undefined") {
    console.warn("⚠️ useOtpManager() called on server — skipping hook logic.");
    return {
      sendOtp: async () => false,
      verifyOtp: async () => false,
      loading: false,
      verifying: false,
    };
  }

  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  /* ------------------------------------------------------------
     📩 Send OTP
  ------------------------------------------------------------ */
  async function sendOtp(
    target: string,
    type: "phone" | "email"
  ): Promise<boolean> {
    if (!target) {
      error("Please provide a valid target before sending OTP.");
      return false;
    }

    setLoading(true);

    try {
      const endpoint =
        type === "phone" ? "/api/auth/phone-otp" : "/api/auth/send-email-otp";

      const payload =
        type === "phone"
          ? { phone: `+91${target}`, action: "send" }
          : { email: target };

      console.log(`📨 [useOtpManager] Sending ${type} OTP →`, payload);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to send OTP");

      success(
        `OTP sent successfully to ${
          type === "phone" ? `+91 ${target}` : target
        }`
      );
      navigator.vibrate?.(30);
      return true;
    } catch (err: any) {
      console.error("💥 [useOtpManager:sendOtp]", err);
      error(`Failed to send ${type.toUpperCase()} OTP. Please try again.`);
      navigator.vibrate?.([80, 40, 80]);
      return false;
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------
     🔐 Verify OTP
  ------------------------------------------------------------ */
  async function verifyOtp(
    otp: string,
    target: string,
    type: "phone" | "email"
  ): Promise<boolean> {
    if (!otp || otp.length !== 6) {
      error("Please enter a valid 6-digit OTP.");
      return false;
    }

    setVerifying(true);

    try {
      const endpoint =
        type === "phone" ? "/api/auth/phone-otp" : "/api/auth/verify-email-otp";

      const payload =
        type === "phone"
          ? { phone: `+91${target}`, otp }
          : { email: target, otp };

      console.log(`🔍 [useOtpManager] Verifying ${type} OTP →`, payload);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !(data.success || data.verified))
        throw new Error(data.message || "Invalid OTP");

      success(
        `${type === "phone" ? "Phone" : "Email"} verified successfully ✅`
      );
      navigator.vibrate?.([60, 40, 120]);
      return true;
    } catch (err: any) {
      console.error("💥 [useOtpManager:verifyOtp]", err);
      error("Invalid OTP. Please try again.");
      navigator.vibrate?.([120]);
      return false;
    } finally {
      setVerifying(false);
    }
  }

  return { sendOtp, verifyOtp, loading, verifying };
}
