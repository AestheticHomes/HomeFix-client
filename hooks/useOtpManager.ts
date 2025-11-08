"use client";
/**
 * ============================================================
 * File: /hooks/useOtpManager.ts
 * Version: v2.4 — Edith Toast Safe Build
 * ------------------------------------------------------------
 * ✅ Uses Sonner-compliant toast syntax
 * ✅ sendOtp & verifyOtp return boolean
 * ✅ Haptic + console logs retained
 * ============================================================
 */

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // ============================================================
  // 📩 Send OTP
  // ============================================================
  async function sendOtp(target: string, type: "phone" | "email"): Promise<boolean> {
    if (!target) {
      toast.error("Provide a valid target before sending OTP.");
      return false;
    }

    setLoading(true);
    try {
      const endpoint =
        type === "phone" ? "/api/auth/otp" : "/api/auth/send-email-otp";
      const payload =
        type === "phone"
          ? { phone: `+91${target}`, action: "send" }
          : { email: target };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");

      toast.success(
        `OTP sent successfully to ${type === "phone" ? `+91 ${target}` : target}`
      );
      navigator.vibrate?.(30);
      return true;
    } catch (err) {
      console.error("💥 [sendOtp]", err);
      toast.error(`Failed to send ${type.toUpperCase()} OTP`);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ✅ Verify OTP
  // ============================================================
  async function verifyOtp(
    otp: string,
    target: string,
    type: "phone" | "email"
  ): Promise<boolean> {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return false;
    }

    setVerifying(true);
    try {
      const endpoint =
        type === "phone" ? "/api/auth/verify" : "/api/auth/verify-email-otp";
      const payload =
        type === "phone"
          ? { phone: `+91${target}`, otp }
          : { email: target, otp };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !(data.success || data.verified)) {
        throw new Error(data.message || "Invalid OTP");
      }

      toast.success(`${type === "phone" ? "Phone" : "Email"} verified successfully`);
      navigator.vibrate?.([60, 40, 120]);
      return true;
    } catch (err) {
      console.error("💥 [verifyOtp]", err);
      toast.error("Invalid OTP. Please try again.");
      navigator.vibrate?.([120]);
      return false;
    } finally {
      setVerifying(false);
    }
  }

  return { sendOtp, verifyOtp, loading, verifying };
}
