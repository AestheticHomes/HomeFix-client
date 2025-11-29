"use client";
/**
 * =====================================================================
 * 📦 FILE: /hooks/useOtpManager.ts
 * 🧩 MODULE: HomeFix — OTP Manager v3.4 (Hook-safe • Idempotent • Resend)
 * ---------------------------------------------------------------------
 * PURPOSE
 *   Provide a single, SSR-safe React hook for sending and verifying OTPs
 *   for both phone and email. Includes robust error mapping, resend
 *   cooldown, and idempotent handling for “already verified” states.
 *
 * EXPORTS
 *   - sendOtp(target, "phone" | "email") -> Promise<boolean>
 *   - verifyOtp(code, target, "phone" | "email") -> Promise<boolean>
 *   - loading, verifying               : boolean spinners
 *   - canResend, resendIn              : resend state (cooldown)
 *   - lastErrorCode, lastMessage       : last error details
 *   - resetError()                     : clears last error
 *
 * BEHAVIOR
 *   - Never marks verified on “send”; verification only on “verify”.
 *   - Distinguishes 400 / 404 / 409 / 429 and exposes user-friendly text.
 *   - Enables immediate “Resend” when code is invalid/expired/not found.
 *   - SSR-safe: hooks are called unconditionally and DOM calls are guarded.
 *   - Phone is normalized to Indian E.164 (+91XXXXXXXXXX).
 *
 * DEPENDENCIES
 *   - /hooks/use-toast (success/error toasts)
 *   - API endpoints:
 *       • POST /api/auth/phone-otp             (send + verify by body.action or signature)
 *       • POST /api/auth/send-email-otp        (send)
 *       • POST /api/auth/verify-email-otp      (verify; idempotent for same email)
 *
 * ENV (optional)
 *   - NEXT_PUBLIC_OTP_RESEND_COOLDOWN   : number of seconds (default 30)
 * =====================================================================
 */

import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------- Types ------------------------------- */

type OtpChannel = "phone" | "email";

export type ApiFailCode =
  | "VALIDATION"
  | "INVALID_OTP"
  | "EXPIRED_OTP"
  | "NOT_FOUND"
  | "EMAIL_MISMATCH"
  | "RATE_LIMIT"
  | "SERVER";

export interface UseOtpManager {
  sendOtp: (target: string, type: OtpChannel) => Promise<boolean>;
  verifyOtp: (
    otp: string,
    target: string,
    type: OtpChannel
  ) => Promise<boolean>;
  loading: boolean;
  verifying: boolean;
  canResend: boolean;
  resendIn: number;
  lastErrorCode?: ApiFailCode;
  lastMessage?: string;
  resetError: () => void;
}

/* ----------------------------- Constants ----------------------------- */

const isBrowser = typeof window !== "undefined";
const DEFAULT_COOLDOWN = 30;
const COOLDOWN_SEC =
  Number(process.env.NEXT_PUBLIC_OTP_RESEND_COOLDOWN) > 0
    ? Number(process.env.NEXT_PUBLIC_OTP_RESEND_COOLDOWN)
    : DEFAULT_COOLDOWN;

/* ----------------------------- Utilities ----------------------------- */

/** Normalize raw Indian numbers into +91XXXXXXXXXX (E.164). Returns null if impossible. */
function toE164India(raw: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("91") && digits.length > 12)
    return `+91${digits.slice(-10)}`;
  if (digits.startsWith("+91") && digits.length === 13)
    return `+91${digits.slice(-10)}`;
  if (digits.length >= 10) return `+91${digits.slice(-10)}`;
  return null;
}

/** Safely parse JSON without throwing; returns empty object on failure. */
async function safeJson<T = any>(
  res: Response
): Promise<T | Record<string, never>> {
  try {
    return (await res.json()) as T;
  } catch {
    return {};
  }
}

/** Map API responses into app-level error codes & messages. */
function mapError(
  res: Response,
  payload: any
): { code: ApiFailCode; message: string } {
  const msg = String(payload?.message || "");

  if (res.status === 400) {
    if (/expired/i.test(msg))
      return {
        code: "EXPIRED_OTP",
        message: "OTP expired. Request a new code.",
      };
    if (/invalid/i.test(msg))
      return {
        code: "INVALID_OTP",
        message: "Invalid code. Try again or resend.",
      };
    return { code: "VALIDATION", message: msg || "Invalid request." };
  }

  if (res.status === 404) {
    return {
      code: "NOT_FOUND",
      message: "No active code found. Send a new OTP.",
    };
  }

  if (res.status === 409) {
    // Our verify endpoint uses 409 for email mismatch or state conflicts
    if (/mismatch/i.test(msg)) {
      return {
        code: "EMAIL_MISMATCH",
        message:
          "This code is for a different email. Resend for the current one.",
      };
    }
    return {
      code: "EMAIL_MISMATCH",
      message: "Conflict with current email. Resend a fresh code.",
    };
  }

  if (res.status === 429) {
    return {
      code: "RATE_LIMIT",
      message: "Too many attempts. Please wait and try again.",
    };
  }

  return { code: "SERVER", message: msg || "Something went wrong." };
}

/* -------------------------------- Hook -------------------------------- */

export function useOtpManager(): UseOtpManager {
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // resend cooldown
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef<number | null>(null);
  const canResend = resendIn === 0;

  // last error details (for UI badges/pills)
  const [lastErrorCode, setLastErrorCode] = useState<ApiFailCode | undefined>(
    undefined
  );
  const [lastMessage, setLastMessage] = useState<string | undefined>(undefined);

  const resetError = useCallback(() => {
    setLastErrorCode(undefined);
    setLastMessage(undefined);
  }, []);

  // Cooldown ticker — runs client-side only
  useEffect(() => {
    if (!isBrowser || resendIn <= 0) return;
    timerRef.current = window.setInterval(() => {
      setResendIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [resendIn]);

  const startCooldown = useCallback(() => {
    setResendIn(COOLDOWN_SEC);
  }, []);

  const phoneLabel = useCallback(
    (raw: string) => `+91 ${raw.replace(/\D/g, "").slice(-10)}`,
    []
  );

  /* -------------------------------- SEND -------------------------------- */

  const sendOtp = useCallback(
    async (target: string, type: OtpChannel): Promise<boolean> => {
      resetError();

      // Basic input guards
      if (type === "phone") {
        const phone = toE164India(target);
        if (!phone) {
          error("Enter a valid 10-digit mobile number.");
          return false;
        }
      } else {
        if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
          error("Enter a valid email address.");
          return false;
        }
      }

      if (!canResend) {
        error(`Wait ${resendIn}s before requesting a new code.`);
        return false;
      }

      setLoading(true);
      try {
        const endpoint =
          type === "phone" ? "/api/auth/phone-otp" : "/api/auth/send-email-otp";
        const payload =
          type === "phone"
            ? { phone: toE164India(target)!, action: "send" }
            : { email: target.trim() };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await safeJson(res);

        if (!res.ok || !(data as any).success) {
          const { code, message } = mapError(res, data);
          setLastErrorCode(code);
          setLastMessage(message);
          error(message);
          if (isBrowser) (navigator as any)?.vibrate?.([80, 40, 80]);
          return false;
        }

        success(
          `OTP sent to ${type === "phone" ? phoneLabel(target) : target}`
        );
        if (isBrowser) (navigator as any)?.vibrate?.(30);
        startCooldown();
        return true;
      } catch (e) {
        setLastErrorCode("SERVER");
        setLastMessage(
          "Could not send OTP. Check your connection and try again."
        );
        error("Could not send OTP. Check your connection and try again.");
        if (isBrowser) (navigator as any)?.vibrate?.([80, 40, 80]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [canResend, error, phoneLabel, resetError, resendIn, startCooldown, success]
  );

  /* ------------------------------- VERIFY ------------------------------- */

  const verifyOtp = useCallback(
    async (otp: string, target: string, type: OtpChannel): Promise<boolean> => {
      resetError();

      // Input guards
      if (!/^\d{6}$/.test(otp)) {
        error("Enter a valid 6-digit code.");
        return false;
      }
      if (type === "phone") {
        if (!toE164India(target)) {
          error("Your phone number looks invalid. Re-enter and try again.");
          return false;
        }
      } else {
        if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
          error("Your email looks invalid. Re-enter and try again.");
          return false;
        }
      }

      setVerifying(true);
      try {
        const endpoint =
          type === "phone"
            ? "/api/auth/phone-otp"
            : "/api/auth/verify-email-otp";
        const payload =
          type === "phone"
            ? { phone: toE164India(target)!, otp, action: "verify" }
            : { email: target.trim(), otp, action: "verify" };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await safeJson(res);
        const ok = res.ok && ((data as any).success || (data as any).verified);

        if (!ok) {
          const { code, message } = mapError(res, data);
          setLastErrorCode(code);
          setLastMessage(message);

          // Enable immediate resend for invalid/expired/not found/mismatch
          if (
            code === "INVALID_OTP" ||
            code === "EXPIRED_OTP" ||
            code === "NOT_FOUND" ||
            code === "EMAIL_MISMATCH"
          ) {
            setResendIn(0);
          }

          error(message);
          if (isBrowser) (navigator as any)?.vibrate?.([120]);
          return false;
        }

        success(
          `${type === "phone" ? "Phone" : "Email"} verified successfully ✅`
        );
        if (isBrowser) (navigator as any)?.vibrate?.([60, 40, 120]);
        return true;
      } catch {
        setLastErrorCode("SERVER");
        setLastMessage("Verification failed. Try again.");
        error("Verification failed. Try again.");
        if (isBrowser) (navigator as any)?.vibrate?.([120]);
        return false;
      } finally {
        setVerifying(false);
      }
    },
    [error, resetError, success]
  );

  /* ------------------------------ Exports ------------------------------ */

  return useMemo(
    () => ({
      sendOtp,
      verifyOtp,
      loading,
      verifying,
      canResend,
      resendIn,
      lastErrorCode,
      lastMessage,
      resetError,
    }),
    [
      sendOtp,
      verifyOtp,
      loading,
      verifying,
      canResend,
      resendIn,
      lastErrorCode,
      lastMessage,
      resetError,
    ]
  );
}
