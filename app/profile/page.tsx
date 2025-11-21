"use client";
/**
 * =============================================================================
 * 📄 FILE: /app/profile/page.tsx
 * 🧩 MODULE: Profile Page v6 — Verified-First, CSS-Vars, LiveSync
 * -----------------------------------------------------------------------------
 * PURPOSE
 *   - Show and edit account info without ever flipping verification flags here.
 *   - Uses UserContext as the single source of truth (no direct localStorage).
 *   - Plays nicely with the new AuthCenterDrawer (OTP flows & error handling).
 *   - Follows global CSS tokens (no hardcoded color values).
 *
 * KEY BEHAVIOR
 *   - Loads from UserContext, then freshens from /api/profile?phone=… (newest row).
 *   - Listens to "profile-updated" and rehydrates state seamlessly.
 *   - “Edit / Verify Account” opens the AuthCenter; address editing is separate.
 *   - Buttons are token-styled and accessibility-friendly.
 *
 * DEPENDENCIES
 *   - components/AuthCenterDrawer (v15+)
 *   - components/MapPicker
 *   - components/layout/SafeViewport
 *   - contexts/UserContext  → { user, setUser, logout, isLoaded }
 *   - /api/profile (v5.4+)  → preserves verified flags on the server
 * =============================================================================
 */

import AuthCenterDrawer from "@/components/AuthCenterDrawer";
import MapPicker from "@/components/MapPicker";
import SafeViewport from "@/components/layout/SafeViewport";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* -------------------------------- Types -------------------------------- */

interface ProfileData {
  id?: string;
  name?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  address?: string;
  latitude?: number;
  longitude?: number;
  role?: string;
}

/* ----------------------------- Utilities ------------------------------- */

function only10(raw?: string): string {
  return (raw || "").replace(/\D/g, "").slice(-10);
}
function normE164(raw?: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("+91") && digits.length === 13) return digits;
  if (digits.length >= 10) return `+91${digits.slice(-10)}`;
  return "";
}

/* =============================== Page ================================== */

export default function ProfilePage() {
  const { user, setUser, logout, isLoaded } = useUser();
  const { success, error } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [coords, setCoords] = useState({ lat: 13.0827, lng: 80.2707 });
  const [address, setAddress] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<
    "form" | "phone-otp" | "email-otp"
  >("form");
  const [editingAddress, setEditingAddress] = useState(false);

  const cachedUser = useMemo(() => {
    try {
      return JSON.parse(
        typeof window !== "undefined"
          ? localStorage.getItem("user") || "null"
          : "null"
      );
    } catch {
      return null;
    }
  }, []);

  /**
   * Safely merge fresh server/user data into UI + UserContext.
   * We DO NOT mutate verification flags here; server is canonical.
   */
  const hydrate = useCallback(
    (fresh: any, base: any = user) => {
      const merged: ProfileData = {
        ...(base || {}),
        ...(fresh || {}),
        name: fresh?.name || fresh?.full_name || base?.name || base?.full_name,
        email_verified: fresh?.email_verified ?? base?.email_verified ?? false,
        phone_verified: fresh?.phone_verified ?? base?.phone_verified ?? false,
      };

      setProfile(merged);
      setUser(merged); // updates React state + your storage layer safely

      if (merged.address) setAddress(merged.address);
      if (merged.latitude && merged.longitude) {
        setCoords({ lat: merged.latitude, lng: merged.longitude });
      }
    },
    [setUser, user]
  );

  /**
   * Fetch latest profile snapshot from API (deduped by newest row).
   * Falls back to current user if API not available or fails.
   */
  const fetchServerProfile = useCallback(async () => {
    try {
      const phoneE164 = normE164(user?.phone || cachedUser?.phone);
      if (!phoneE164) {
        if (user) hydrate(user, user);
        setLoading(false);
        return;
      }

      const resp = await fetch(
        `/api/profile?phone=${encodeURIComponent(phoneE164)}`,
        {
          cache: "no-store",
        }
      );
      const json = await resp.json();

      if (json?.user) hydrate(json.user, user || cachedUser);
      else hydrate(user || cachedUser, user || cachedUser);
    } catch (e) {
      console.error("🔴 /api/profile fetch error:", e);
      hydrate(user || cachedUser, user || cachedUser);
    } finally {
      setLoading(false);
    }
  }, [hydrate, user, cachedUser]);

  // Track last seen id to avoid redundant fetches on every render.
  const lastFetchedId = useRef<string | null>(null);

  useEffect(() => {
    // wait until UserContext decides if there's a session
    if (!isLoaded) return;

    // On first mount or when user changes, hydrate + fetch server copy
    const effective = user || cachedUser;
    if (!effective) {
      setLoading(false);
      return;
    }

    if (lastFetchedId.current === effective.id) return;
    lastFetchedId.current = effective.id ?? null;

    hydrate(effective, effective);
    fetchServerProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoaded]);

  // LiveSync: update immediately when other parts of app modify profile
  useEffect(() => {
    function onProfileUpdated() {
      fetchServerProfile();
    }
    window.addEventListener("profile-updated", onProfileUpdated);
    return () =>
      window.removeEventListener("profile-updated", onProfileUpdated);
  }, [fetchServerProfile]);

  /* ---------------------------- Actions -------------------------------- */

  async function saveLocation() {
    if (!profile?.phone) return;

    try {
      const updates = {
        phone: profile.phone,
        address,
        latitude: coords.lat,
        longitude: coords.lng,
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      hydrate(data.user, profile);
      success("📍 Location saved.");
      navigator.vibrate?.(20);

      setEditingAddress(false);
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e: any) {
      console.error("🔴 saveLocation error:", e?.message || e);
      error("Failed to save location.");
      navigator.vibrate?.([120]);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      /* no-op */
    }
    success("Logged out.");
    navigator.vibrate?.([60, 40, 120]);
    // Don’t push here; your router guards should redirect on auth state change
  }

  /* ------------------------------ UI ----------------------------------- */

  if (loading) {
    return (
      <SafeViewport>
        <div className="max-w-5xl mx-auto p-6">
          <div
            className="rounded-xl p-4 animate-pulse"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-soft)",
              color: "var(--text-secondary)",
            }}
          >
            Loading your profile…
          </div>
        </div>
      </SafeViewport>
    );
  }

  const fullyVerified = !!(profile?.email_verified && profile?.phone_verified);

  return (
    <SafeViewport>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Verification Banner */}
        <button
          onClick={() => {
            if (!fullyVerified) {
              setDrawerMode("form");
              setDrawerOpen(true);
            }
          }}
          className="w-full rounded-xl px-4 py-3 shadow-sm border text-left"
          style={{
            background: fullyVerified
              ? "color-mix(in srgb, var(--accent-success) 10%, transparent)"
              : "color-mix(in srgb, var(--accent-danger) 10%, transparent)",
            border: fullyVerified
              ? "1px solid color-mix(in srgb, var(--accent-success) 35%, transparent)"
              : "1px solid color-mix(in srgb, var(--accent-danger) 35%, transparent)",
            color: fullyVerified
              ? "var(--accent-success)"
              : "var(--accent-danger)",
          }}
          aria-label={
            fullyVerified ? "Verified Profile" : "Unverified — Verify Now"
          }
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {fullyVerified ? "Verified Profile ✓" : "Unverified — Verify Now"}
            </span>
            {!fullyVerified && (
              <span
                className="text-sm underline"
                style={{ color: "var(--text-primary)" }}
              >
                Open
              </span>
            )}
          </div>
        </button>

        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          My Profile
        </h1>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl shadow-sm p-5"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-soft)",
            color: "var(--text-primary)",
          }}
        >
          <div className="grid gap-3">
            <Field label="Name" value={profile?.name} />
            <Field label="Phone" value={profile?.phone} />
            <Field label="Email" value={profile?.email} />
            <Field label="Address" value={address} />
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => {
                setDrawerMode("form");
                setDrawerOpen(true);
              }}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: "var(--accent-primary)" }}
            >
              Edit / Verify Account
            </button>

            <button
              onClick={() => setEditingAddress(true)}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: "var(--accent-warning)" }}
            >
              Edit Address
            </button>

            {editingAddress && (
              <button
                onClick={saveLocation}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ background: "var(--accent-success)" }}
              >
                Save Location
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-medium text-white ml-auto"
              style={{ background: "var(--accent-danger)" }}
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Address Editor */}
        {editingAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl shadow-sm p-5"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-soft)",
            }}
          >
            <h2
              className="font-semibold text-lg mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              📍 Update Address
            </h2>

            <MapPicker
              initialLocation={coords}
              editable
              onLocationChange={(loc, addr) => {
                if (loc) setCoords(loc);
                setAddress(addr ?? "");
              }}
            />

            <p
              className="text-sm mt-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <strong style={{ color: "var(--text-primary)" }}>
                Detected Address:
              </strong>{" "}
              {address || "Move the pin to detect address"}
            </p>
          </motion.div>
        )}

        <AuthCenterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          initialMode={drawerMode}
        />
      </div>
    </SafeViewport>
  );
}

/* ------------------------------ Bits ---------------------------------- */

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-sm" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <div
        className="font-medium"
        style={{ color: "var(--text-primary)" }}
        aria-live="polite"
      >
        {value || "—"}
      </div>
    </div>
  );
}
