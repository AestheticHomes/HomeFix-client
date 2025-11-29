"use client";
/**
 * Profile Page v7 — cookie-based profile sync
 * - Reads profile via /api/profile (auth cookies)
 * - No localStorage fallbacks; Supabase profile is source of truth
 * - Verification flags are server-owned (updated via OTP flows only)
 */

import AuthCenterDrawer from "@/components/AuthCenterDrawer";
import MapPicker from "@/components/MapPicker";
import SafeViewport from "@/components/layout/SafeViewport";
import { useUser } from "@/contexts/UserContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface ProfileData {
  id?: string;
  name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  email_verified?: boolean | null;
  phone_verified?: boolean | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  role?: string | null;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
        {value && value.trim() !== "" ? value : "—"}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const { logout } = useUser();
  const { user, loading: profileLoading, refresh } = useUserProfile();
  const { success, error } = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<
    "form" | "phone-otp" | "email-otp"
  >("form");
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [coords, setCoords] = useState({ lat: 13.0827, lng: 80.2707 });
  const [address, setAddress] = useState("");

  const profile: ProfileData | null = user ?? null;
  const loading = profileLoading;

  const fullyVerified = !!(
    profile?.email_verified && profile?.phone_verified
  );

  useEffect(() => {
    if (profile?.address) setAddress(profile.address);
    if (profile?.latitude && profile?.longitude) {
      setCoords({ lat: profile.latitude, lng: profile.longitude });
    }
  }, [profile]);

  async function saveLocation(next?: { loc?: { lat: number; lng: number } | null; addr?: string }) {
    if (!profile?.phone) return;

    try {
      setSavingAddress(true);
      const updates = {
        phone: profile.phone,
        address: next?.addr ?? address,
        latitude: next?.loc?.lat ?? coords.lat,
        longitude: next?.loc?.lng ?? coords.lng,
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      await refresh();
      success("📍 Location saved.");
      navigator.vibrate?.(20);

      window.dispatchEvent(new Event("profile-updated"));
    } catch (e: any) {
      console.error("🔴 saveLocation error:", e?.message || e);
      error("Failed to save location.");
      navigator.vibrate?.([120]);
    } finally {
      setSavingAddress(false);
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
  }

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
            <Field label="Name" value={profile?.name || profile?.full_name} />
            <Field label="Phone" value={profile?.phone} />
            <Field label="Email" value={profile?.email} />
            <Field label="Address" value={address || profile?.address} />
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

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: "var(--accent-secondary)" }}
            >
              Logout
            </button>
          </div>

          {editingAddress && (
            <div className="mt-4 space-y-3">
              <MapPicker
                initialLocation={coords}
                onLocationChange={async (loc, addr, confirmed) => {
                  if (loc) setCoords(loc);
                  if (addr) setAddress(addr);
                  if (confirmed) {
                    await saveLocation({ loc: loc ?? undefined, addr });
                  }
                }}
                editable
              />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  background: "var(--surface-base)",
                  borderColor: "var(--border-soft)",
                  color: "var(--text-primary)",
                }}
                placeholder="Enter address"
              />
              {savingAddress && (
                <p className="text-xs text-[var(--text-secondary)]">
                  Saving address…
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <AuthCenterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialMode={drawerMode}
      />
    </SafeViewport>
  );
}
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
