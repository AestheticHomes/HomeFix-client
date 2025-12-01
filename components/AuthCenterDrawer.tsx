"use client";
/**
 * =============================================================================
 * 📦 FILE: /components/AuthCenterDrawer.tsx
 * 🧩 MODULE: Auth Center v15 — Verified-First, CSS-Vars, Graceful OTP UX
 * -----------------------------------------------------------------------------
 * PURPOSE
 *   - Profile editor that respects global CSS tokens and verified flags.
 *   - Never marks verified on "Save" (server remains source of truth).
 *   - Blocks saving if email changed but is not verified.
 *   - OTP flows with resend cooldown, inline errors, and accessible labels.
 *
 * DEPENDENCIES
 *   - hooks/useOtpManager (v3.4+)  → send/resend/verify + cooldown & messages
 *   - contexts/UserContext         → login(updatedUser, true)
 *   - /api/profile                 → preserves flags server-side
 *
 * UX RULES
 *   1) Re-entering *same verified* email keeps pill = Verified.
 *   2) Entering a *new* email shows "Unverified — Verify"; Save disabled.
 *   3) Phone uses +91 E.164; verify logic mirrors email OTP UX.
 *   4) Error messages from OTP manager are shown inline; resend when allowed.
 *
 * EVENTS
 *   - window.dispatchEvent(new Event("profile-updated")) on changes/verification
 *
 * STYLE
 *   - Uses CSS variables (surface/text/border/accent) where sensible.
 *   - No layout paddings tied to header/footer; layout handles chrome.
 * =============================================================================
 */

import OTPInput from "@/components/OTPInput";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useUser, type HomeFixUser } from "@/contexts/UserContext";
import { useUserProfile, refreshProfileSWR } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { useOtpManager } from "@/hooks/useOtpManager";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Mail,
  Phone,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/* -------------------------------- Types ------------------------------- */

type Panel = "form" | "phone-otp" | "email-otp" | "success";

/* ----------------------------- Utilities ------------------------------ */

function normPhoneE164(raw: string): string {
  if (!raw) return "";
  const p = raw.replace(/\D/g, "");
  if (p.startsWith("91") && p.length === 12) return `+${p}`;
  if (p.startsWith("+91") && p.length === 13) return p.slice(0, 13);
  if (p.length >= 10) return `+91${p.slice(-10)}`;
  return "";
}
function only10(raw: string): string {
  return (raw || "").replace(/\D/g, "").slice(-10);
}

/* ============================ Component =============================== */

export default function AuthCenterDrawer({
  open,
  onClose,
  standalone = false,
  initialMode = "form",
  redirectOnSuccess = true,
  onLoginSuccess,
}: {
  open: boolean;
  onClose?: () => void;
  standalone?: boolean;
  initialMode?: Panel | "form";
  /**
   * When false, login stays inline (no redirect) and optionally calls onLoginSuccess.
   * Used for checkout so the user remains on the page after logging in.
   */
  redirectOnSuccess?: boolean;
  onLoginSuccess?: (user: HomeFixUser) => void;
}) {
  const { success, error } = useToast();
  const { login, refreshProfile, setUser } = useUser();
  const { user, refresh } = useUserProfile();

  const {
    sendOtp,
    verifyOtp,
    loading,
    verifying,
    canResend,
    resendIn,
    lastErrorCode,
    lastMessage,
    resetError,
  } = useOtpManager();

  // Base form state
  const [panel, setPanel] = useState<Panel>("form");
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const [phone, setPhone] = useState(""); // 10-digit UI value
  const [origPhoneE164, setOrigPhoneE164] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [otp, setOtp] = useState("");
  const otpRefs = useRef<HTMLInputElement[]>([]);

  // Derivations
  const cachedEmail = (user?.email || "").trim().toLowerCase();
  const phone10 = only10(phone);

  const isPhoneChanged = useMemo(() => {
    const orig10 = only10(origPhoneE164);
    return phone10.length === 10 && phone10 !== orig10;
  }, [phone10, origPhoneE164]);

  const emailChanged = useMemo(() => {
    const next = (email || "").trim().toLowerCase();
    return !!next && next !== cachedEmail;
  }, [email, cachedEmail]);

  /* -------------------------- Prefill data ---------------------------- */
  useEffect(() => {
    if (!open) return;

    const pre = user || {};
    setName(pre.name || pre.full_name || "");
    setEmail(pre.email || "");
    setEmailVerified(!!pre.email_verified);

    const e164 = normPhoneE164(pre.phone || "");
    setOrigPhoneE164(e164 || "");
    setPhone(only10(e164)); // UI shows only 10 digits
    setPhoneVerified(!!pre.phone_verified || pre.loggedOut === false);

    setPanel(initialMode === "form" ? "form" : (initialMode as Panel));
    setOtp("");
    resetError();
  }, [open, user, initialMode]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------- Save (name/email) ------------------------ */
  async function saveNameEmail() {
    setSaving(true);
    try {
      // Require verified phone for identity anchoring
      const phoneE164 =
        normPhoneE164(user?.phone || (phone10 ? `+91${phone10}` : "")) || "";

      if (!phoneE164) {
        error("Verify your phone before saving.");
        setSaving(false);
        return;
      }

      // If email changed but not verified, block save (UX guard)
      if (emailChanged && !emailVerified) {
        error("Please verify your new email before saving.");
        setSaving(false);
        return;
      }

      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phoneE164,
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || "Save failed");

      const updatedUser = { ...(user || {}), ...(data.user || {}) };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      login(updatedUser, true);
      refreshProfile().catch(() => {});
      refresh().catch(() => {});

      window.dispatchEvent(new Event("profile-updated"));
      success("Profile updated successfully!");
      navigator.vibrate?.(20);

      setPanel("success");
      setTimeout(() => {
        setPanel("form");
        onClose?.();
      }, 1000);
    } catch (e: any) {
      console.error("💥 [AuthCenterDrawer.saveNameEmail]", e?.message || e);
      error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  /* ----------------------------- OTP flows ---------------------------- */

  const onSendPhoneOtp = async () => {
    resetError();
    const ok = await sendOtp(phone10, "phone");
    if (ok) setPanel("phone-otp");
  };

  const onVerifyPhoneOtp = async () => {
    resetError();
    const ok = await verifyOtp(otp, phone10, "phone");
    if (ok) {
      const phoneE164 = `+91${phone10}`;
      setPhoneVerified(true);
      setOrigPhoneE164(phoneE164);

      // Treat phone verify as login success: refresh profile and update context
      const latestUser: HomeFixUser = {
        ...(user || {}),
        phone: phoneE164,
        phone_verified: true,
        email_verified: user?.email_verified ? true : undefined,
        loggedIn: true,
      };

      setUser(latestUser);
      refreshProfile().catch(() => {});
      refresh().catch(() => {});

      window.dispatchEvent(new Event("profile-updated"));

      if (!redirectOnSuccess) {
        onLoginSuccess?.(latestUser);
        setPanel("success");
        setTimeout(() => {
          setPanel("form");
          onClose?.();
        }, 800);
        return;
      }

      setPanel("success");
      setTimeout(() => setPanel("form"), 900);
    }
  };

  const onSendEmailOtp = async () => {
    resetError();
    const ok = await sendOtp(email, "email");
    if (ok) setPanel("email-otp");
  };

  const onVerifyEmailOtp = async () => {
    resetError();
    const ok = await verifyOtp(otp, email, "email");
    if (ok) {
      setEmailVerified(true);
      setUser((prev: HomeFixUser | null) =>
        prev ? { ...prev, email_verified: true } : prev
      );
      refreshProfile().catch(() => {});
      refresh().catch(() => {});
      refreshProfileSWR();
      window.dispatchEvent(new Event("profile-updated"));
      setPanel("success");
      setTimeout(() => setPanel("form"), 900);
    }
  };

  /* ---------------------------- Verify pills -------------------------- */

  const EmailVerifyPill = emailVerified ? (
    <span
      className="ml-2 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
      style={{
        background:
          "color-mix(in srgb, var(--accent-success) 18%, transparent)",
        color: "var(--accent-success)",
      }}
      aria-label="Email verified"
    >
      <Check size={14} /> Verified
    </span>
  ) : (
    <button
      onClick={onSendEmailOtp}
      disabled={loading || !email.trim()}
      className="ml-2 text-xs px-2 py-0.5 rounded-full transition"
      style={{
        background:
          "color-mix(in srgb, var(--accent-danger) 16%, transparent)",
        color: "var(--accent-danger)",
      }}
      aria-label="Verify email"
    >
      Unverified — Verify
    </button>
  );

  const PhoneInlineAction = isPhoneChanged ? (
    <button
      onClick={onSendPhoneOtp}
      disabled={loading || phone10.length !== 10}
      className="ml-2 text-xs px-2 py-0.5 rounded-full transition"
      style={{
        background:
          "color-mix(in srgb, var(--accent-warning) 16%, transparent)",
        color: "var(--accent-warning)",
      }}
      aria-label="Verify new phone number"
    >
      Verify new number
    </button>
  ) : phoneVerified ? (
    <span
      className="ml-2 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
      style={{
        background:
          "color-mix(in srgb, var(--accent-success) 18%, transparent)",
        color: "var(--accent-success)",
      }}
      aria-label="Phone verified"
    >
      <Check size={14} /> Verified
    </span>
  ) : (
    <button
      onClick={onSendPhoneOtp}
      disabled={loading || phone10.length !== 10}
      className="ml-2 text-xs px-2 py-0.5 rounded-full transition"
      style={{
        background:
          "color-mix(in srgb, var(--accent-danger) 16%, transparent)",
        color: "var(--accent-danger)",
      }}
      aria-label="Verify phone"
    >
      Verify
    </button>
  );

  /* --------------------------- Inline alerts --------------------------- */

  function InlineOtpError() {
    if (!lastMessage) return null;
    return (
      <div
        className="mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
        style={{
          background:
            "color-mix(in srgb, var(--accent-danger) 10%, transparent)",
          color: "var(--text-primary)",
          border:
            "1px solid color-mix(in srgb, var(--accent-danger) 25%, transparent)",
        }}
        role="alert"
        aria-live="polite"
      >
        <AlertTriangle size={16} className="mt-0.5" />
        <span>{lastMessage}</span>
      </div>
    );
  }

  function ResendRow({
    onResend,
    channel,
  }: {
    onResend: () => void;
    channel: "phone" | "email";
  }) {
    return (
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {canResend
            ? "Didn’t receive a code?"
            : `You can request a new code in ${resendIn}s`}
        </span>
        <button
          onClick={onResend}
          disabled={!canResend}
          className="inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-1 transition"
          style={{
            background: canResend
              ? "color-mix(in srgb, var(--accent-primary) 14%, transparent)"
              : "transparent",
            color: canResend
              ? "var(--accent-primary)"
              : "var(--text-muted)",
            border:
              "1px solid color-mix(in srgb, var(--accent-primary) 25%, transparent)",
          }}
          aria-label={`Resend ${channel} OTP`}
        >
          <RefreshCw size={14} /> Resend
        </button>
      </div>
    );
  }

  /* ----------------------------- Panels ------------------------------- */

  const PanelContent = (
    <AnimatePresence mode="wait">
      {panel === "form" && (
        <motion.div
          key="form"
          className="p-6 sm:p-8"
          style={{
            background: "var(--surface-base)",
            color: "var(--text-primary)",
          }}
        >
          <h2 className="text-lg font-semibold mb-4">Account Center</h2>

          {/* Name */}
          <label className="text-sm" style={{ color: "var(--text-muted)" }}>
            Name
          </label>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
            style={{
              border: "1px solid var(--border-soft)",
              background: "var(--surface-card, transparent)",
            }}
          >
            <UserRound size={18} style={{ color: "var(--accent-success)" }} />
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text-primary)" }}
              aria-label="Name"
            />
          </div>

          {/* Phone */}
          <label className="text-sm" style={{ color: "var(--text-muted)" }}>
            Phone
          </label>
          <div
            className="flex items-center rounded-xl px-3 py-2 mb-3"
            style={{
              border: "1px solid var(--border-soft)",
              background: "var(--surface-card, transparent)",
            }}
          >
            <Phone size={18} style={{ color: "var(--accent-success)" }} />
            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(only10(e.target.value))}
              className="flex-1 bg-transparent outline-none text-sm ml-2"
              style={{ color: "var(--text-primary)" }}
              aria-label="Phone number"
            />
            {PhoneInlineAction}
          </div>

          {/* Email */}
          <label className="text-sm" style={{ color: "var(--text-muted)" }}>
            Email
          </label>
          <div
            className="flex items-center rounded-xl px-3 py-2"
            style={{
              border: "1px solid var(--border-soft)",
              background: "var(--surface-card, transparent)",
            }}
          >
            <Mail size={18} style={{ color: "var(--accent-success)" }} />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                const next = e.target.value.trim();
                setEmail(next);
                // keep pill = Verified when user re-enters the exact same verified email
                if (cachedEmail && next.toLowerCase() === cachedEmail) {
                  setEmailVerified(true);
                } else {
                  setEmailVerified(false);
                }
              }}
              className="flex-1 bg-transparent outline-none text-sm ml-2"
              style={{ color: "var(--text-primary)" }}
              aria-label="Email address"
            />
            {EmailVerifyPill}
          </div>

          {/* Save button + guard note */}
          <button
            onClick={saveNameEmail}
            disabled={saving || (emailChanged && !emailVerified)}
            className="w-full py-3 mt-4 rounded-xl font-semibold active:scale-[0.98] transition"
            style={{
              background: saving
                ? "color-mix(in srgb, var(--accent-success) 50%, black 10%)"
                : "var(--accent-success)",
              color: "white",
              opacity: saving || (emailChanged && !emailVerified) ? 0.7 : 1,
            }}
            aria-disabled={saving || (emailChanged && !emailVerified)}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {emailChanged && !emailVerified && (
            <div
              className="mt-2 text-xs rounded-md px-3 py-2 flex gap-2 items-start"
              style={{
                background:
                  "color-mix(in srgb, var(--accent-warning) 10%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--accent-warning) 22%, transparent)",
                color: "var(--text-primary)",
              }}
            >
              <AlertTriangle size={14} className="mt-0.5" />
              Please verify your new email before saving.
            </div>
          )}
        </motion.div>
      )}

      {/* Phone OTP */}
      {panel === "phone-otp" && (
        <motion.div
          key="phone"
          className="p-6"
          style={{
            background: "var(--surface-base)",
            color: "var(--text-primary)",
          }}
        >
          <h3 className="font-semibold mb-2">Verify Phone</h3>
          <p
            className="text-sm mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Enter the code sent to +91 {phone10}
          </p>

          <OTPInput otp={otp} setOtp={setOtp} refs={otpRefs} />

          <InlineOtpError />
          <ResendRow onResend={onSendPhoneOtp} channel="phone" />

          <button
            onClick={onVerifyPhoneOtp}
            disabled={verifying || otp.length !== 6}
            className="w-full mt-3 py-3 rounded-xl font-semibold transition"
            style={{
              background: "var(--accent-primary)",
              color: "white",
              opacity: verifying || otp.length !== 6 ? 0.7 : 1,
            }}
            aria-disabled={verifying || otp.length !== 6}
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </motion.div>
      )}

      {/* Email OTP */}
      {panel === "email-otp" && (
        <motion.div
          key="email"
          className="p-6"
          style={{
            background: "var(--surface-base)",
            color: "var(--text-primary)",
          }}
        >
          <h3 className="font-semibold mb-2">Verify Email</h3>
          <p
            className="text-sm mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Enter the code sent to {email}
          </p>

          <OTPInput otp={otp} setOtp={setOtp} refs={otpRefs} />

          <InlineOtpError />
          <ResendRow onResend={onSendEmailOtp} channel="email" />

          <button
            onClick={onVerifyEmailOtp}
            disabled={verifying || otp.length !== 6}
            className="w-full mt-3 py-3 rounded-xl font-semibold transition"
            style={{
              background: "var(--accent-primary)",
              color: "white",
              opacity: verifying || otp.length !== 6 ? 0.7 : 1,
            }}
            aria-disabled={verifying || otp.length !== 6}
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </motion.div>
      )}

      {/* Success */}
      {panel === "success" && (
        <motion.div
          key="success"
          className="p-8 text-center"
          style={{
            background: "var(--surface-base)",
            color: "var(--text-primary)",
          }}
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="mx-auto rounded-full flex items-center justify-center shadow-xl"
            style={{
              width: "72px",
              height: "72px",
              background: "var(--accent-success)",
              color: "white",
            }}
            aria-hidden
          >
            <Check size={40} />
          </motion.div>
          <p
            className="mt-3 font-semibold"
            style={{ color: "var(--accent-success)" }}
          >
            Verified Successfully
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ---------------------------- Drawers ------------------------------- */

  if (standalone) {
    return (
      <motion.div
        className="min-h-screen flex items-end sm:items-center justify-center"
        style={{
          background: "color-mix(in srgb, black 40%, transparent)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          className="w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl"
          style={{
            background: "var(--surface-base)",
            color: "var(--text-primary)",
          }}
        >
          {PanelContent}
        </div>
      </motion.div>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent
        className="rounded-t-3xl"
        style={{
          background: "var(--surface-base)",
          color: "var(--text-primary)",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <DrawerHeader>
          <DrawerTitle className="text-center">Account Center</DrawerTitle>
          <DrawerDescription
            className="text-center text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage your profile and verification
          </DrawerDescription>
        </DrawerHeader>
        {PanelContent}
      </DrawerContent>
    </Drawer>
  );
}
