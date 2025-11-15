"use client";

/**
 * ============================================================
 * 🧩 FILE: /app/profile/page.tsx (FIXED v5.0)
 * ------------------------------------------------------------
 * ⭐ NO MORE direct localStorage writes
 * ⭐ Uses UserContext.setUser() instead
 * ⭐ Does NOT overwrite Supabase/Session user object
 * ⭐ My Orders + LedgerX finally get correct UID
 * ============================================================
 */

import AuthCenterDrawer from "@/components/AuthCenterDrawer";
import MapPicker from "@/components/MapPicker";
import SafeViewport from "@/components/layout/SafeViewport";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout, isLoaded } = useUser();
  const { success, error, info } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: 13.0827, lng: 80.2707 });
  const [address, setAddress] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<
    "form" | "phone-otp" | "email-otp"
  >("form");
  const [editingAddress, setEditingAddress] = useState(false);

  /* ------------------------------------------------------------
     🧠 Safely hydrate WITHOUT overwriting auth/session state
  ------------------------------------------------------------ */
  const hydrate = useCallback(
    (fresh: any, base: any = user) => {
      const merged = {
        ...(base || {}),
        ...(fresh || {}),
      name: fresh?.name || fresh?.full_name || base?.name,
      email_verified: fresh?.email_verified ?? base?.email_verified ?? false,
      phone_verified: fresh?.phone_verified ?? base?.phone_verified ?? false,
    };

    setProfile(merged);
    setUser(merged); // <--- SAFE. Updates React + UserContext + storage.

      if (merged.address) setAddress(merged.address);

      if (merged.latitude && merged.longitude)
        setCoords({ lat: merged.latitude, lng: merged.longitude });
    },
    [setUser, user]
  );

  /* ------------------------------------------------------------
     🔁 Fetch profile from backend
  ------------------------------------------------------------ */
  const prefetchProfile = useCallback(async () => {
    try {
      const phone = user?.phone;
      if (!phone) {
        if (user) hydrate(user, user);
        setLoading(false);
        return;
      }

      const resp = await fetch(`/api/profile?phone=${phone}`, {
        cache: "no-store",
      });

      const json = await resp.json();
      if (json?.user) hydrate(json.user, user);
      else hydrate(user, user);
    } catch (err) {
      console.error("Profile fetch failed:", err);
      hydrate(user, user);
    } finally {
      setLoading(false);
    }
  }, [hydrate, user]);

  const lastFetchedId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      if (!isLoaded) return;
      try {
        const cached = JSON.parse(localStorage.getItem("user") || "null");
        if (cached) {
          hydrate(cached, cached);
          lastFetchedId.current = cached.id ?? null;
        }
      } catch {
        // ignore parse errors
      } finally {
        setLoading(false);
      }
      return;
    }

    if (lastFetchedId.current === user.id) return;
    lastFetchedId.current = user.id ?? null;

    hydrate(user, user);
    prefetchProfile();
  }, [user, isLoaded, hydrate, prefetchProfile]);

  /* ------------------------------------------------------------
     📍 Save Location
  ------------------------------------------------------------ */
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

      hydrate(data.user);

      success("📍 Location saved.");
      navigator.vibrate?.(20);

      setEditingAddress(false);
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e: any) {
      error("Failed to save location.");
      console.error(e);
      navigator.vibrate?.([120]);
    }
  }

  /* ------------------------------------------------------------
     🚪 Logout
  ------------------------------------------------------------ */
  async function handleLogout() {
    await logout().catch(() => {});
    success("Logged out.");
    navigator.vibrate?.([60, 40, 120]);
    router.replace("/login");
  }

  /* ------------------------------------------------------------
     🧱 UI
  ------------------------------------------------------------ */
  if (loading) {
    return (
      <SafeViewport>
        <div className="max-w-5xl mx-auto p-6 text-center text-[var(--text-secondary)]">
          <p className="animate-pulse">Loading your profile...</p>
        </div>
      </SafeViewport>
    );
  }
  const fullyVerified = !!(profile?.email_verified && profile?.phone_verified);

  return (
    <SafeViewport>
      <div className="max-w-5xl mx-auto p-6 space-y-6 pb-[var(--mbnav-h-safe)]">
        {/* Banner */}
        <div
          onClick={() => {
            if (!fullyVerified) {
              setDrawerMode("form");
              setDrawerOpen(true);
            }
          }}
          className={`cursor-pointer rounded-xl px-4 py-3 shadow-sm border flex items-center justify-between ${
            fullyVerified
              ? "bg-[color-mix(in_srgb,var(--accent-success)10%,transparent)] border-[color-mix(in_srgb,var(--accent-success)35%,transparent)] text-[var(--accent-success)]"
              : "bg-[color-mix(in_srgb,var(--accent-danger)10%,transparent)] border-[color-mix(in_srgb,var(--accent-danger)35%,transparent)] text-[var(--accent-danger)]"
          }`}
        >
          <span className="font-medium">
            {fullyVerified ? "Verified Profile ✓" : "Unverified — Verify Now"}
          </span>
          {!fullyVerified && <span className="text-sm underline">Open</span>}
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]">
          My Profile
        </h1>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-[var(--border-soft)] p-5 rounded-2xl shadow-sm bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]"
        >
          <div className="grid gap-3">
            <Field label="Name" value={profile?.name} />
            <Field label="Phone" value={profile?.phone} />
            <Field label="Email" value={profile?.email} />
            <Field label="Address" value={address} />
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-white px-4 py-2 rounded-lg font-medium"
              style={{ background: "var(--accent-primary)" }}
            >
              Edit / Verify Account
            </button>

            <button
              onClick={() => setEditingAddress(true)}
              className="text-white px-4 py-2 rounded-lg font-medium"
              style={{ background: "var(--accent-warning)" }}
            >
              Edit Address
            </button>

            {editingAddress && (
              <button
                onClick={saveLocation}
                className="text-white px-4 py-2 rounded-lg font-medium"
                style={{ background: "var(--accent-success)" }}
              >
                Save Location
              </button>
            )}

            <button
              onClick={handleLogout}
              className="text-white px-4 py-2 rounded-lg font-medium ml-auto"
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
            className="border border-[var(--border-soft)] p-5 rounded-2xl shadow-sm bg-[var(--surface-card)] dark:bg-[var(--surface-card-dark)]"
          >
            <h2 className="font-semibold text-lg mb-2">📍 Update Address</h2>
            <MapPicker
              initialLocation={coords}
              editable
              onLocationChange={(loc, addr) => {
                if (loc) setCoords(loc);
                setAddress(addr ?? "");
              }}
            />

            <p className="text-sm mt-2">
              <strong>Detected Address:</strong>{" "}
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

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-sm text-[var(--text-muted)]">{label}</label>
      <div className="font-medium text-[var(--text-primary)] dark:text-[var(--text-primary-dark)]">
        {value || "—"}
      </div>
    </div>
  );
}
