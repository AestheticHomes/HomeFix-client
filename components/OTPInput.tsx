"use client";
/**
 * OTPInput v3.5 — Smart Paste + Haptic Feedback 🌿
 * ------------------------------------------------------------
 * ✅ Accepts otp / setOtp / refs (fully controlled)
 * ✅ Auto-advance and backspace navigation
 * ✅ Paste entire 6-digit OTP at once
 * ✅ Optional onComplete callback
 * ✅ Works seamlessly in dark/light themes
 */

import React, { useEffect } from "react";

interface OTPInputProps {
  otp: string;
  setOtp: (v: string) => void;
  refs: React.MutableRefObject<HTMLInputElement[]>;
  length?: number;
  onComplete?: (otp: string) => void;
}

export default function OTPInput({
  otp,
  setOtp,
  refs,
  length = 6,
  onComplete,
}: OTPInputProps): React.ReactElement {
  /* 📳 Haptic feedback helper */
  const buzz = (ok = true) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(ok ? 20 : [60, 40, 60]);
    }
  };

  /* 🧠 Input handlers */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newOtp = otp.substring(0, i) + val + otp.substring(i + 1);
    setOtp(newOtp);
    if (val && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    i: number,
  ) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(
      0,
      length,
    );
    if (!paste) return;
    setOtp(paste);
    paste.split("").forEach((val, idx) => {
      if (refs.current[idx]) refs.current[idx].value = val;
    });
    buzz(true);
    refs.current[length - 1]?.focus();
    if (onComplete && paste.length === length) onComplete(paste);
  };

  useEffect(() => {
    if (otp.length === length && onComplete) onComplete(otp);
  }, [otp, length, onComplete]);

  /* 🎨 Render */
  return (
    <div className="flex justify-center gap-2 my-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={otp[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-10 h-12 text-center text-lg font-semibold border rounded-xl border-border 
                     focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition bg-[var(--surface-input)] 
                     text-[var(--text-primary)]"
        />
      ))}
    </div>
  );
}
