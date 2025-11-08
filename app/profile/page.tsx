"use client";

/**
 * HomeFix India — Profile v3.8 🌿
 * ------------------------------------------------------------
 * ✅ Fixes infinite “Loading your profile…” hang
 * ✅ Adds visible runtime logs (Supabase / Fallback / Logout)
 * ✅ Works offline gracefully with cached user
 * ✅ Logout now clears Supabase + cache + cookies + state
 * ✅ Toast + vibration feedback
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MapPicker from "@/components/MapPicker";
import AuthCenterDrawer from "@/components/AuthCenterDrawer";
import { supabase } from "@/lib/supabaseClient";
import { error as logError, info as logInfo, warn as logWarn } from "@/lib/console";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

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
  const { logout } = useUser(); // ✅ Uses context-aware logout

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: 13.0827, lng: 80.2707 });
  const [address, setAddress] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"form" | "phone-otp" | "email-otp">("form");
  const [editingAddress, setEditingAddress] = useState(false);

  /* ------------------------------------------------------------
     📦 Prefetch Profile (Supabase → Cookie → Cache)
  ------------------------------------------------------------ */
  useEffect(() => {
    let cancelled = false;

    async function prefetchProfile() {
      if (typeof window === "undefined") return;

      console.log("🧭 [Profile] Prefetch started — awaiting Supabase user...");

      try {
        // ⏱ Timeout-safe Supabase getUser
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout: Supabase stalled")), 5000)
        );

        const { data: sb } = (await Promise.race([
          supabase.auth.getUser(),
          timeout,
        ]).catch(() => ({ data: undefined }))) as any;

        const supaUser = sb?.user ?? null;
        const cookies = Object.fromEntries(
          (document.cookie || "")
            .split("; ")
            .filter(Boolean)
            .map((c) => {
              const i = c.indexOf("=");
              return [c.substring(0, i), decodeURIComponent(c.substring(i + 1))];
            })
        );

        const cookiePhone = cookies["hf_user_phone"];
        const cookieId = cookies["hf_user_id"];

        // Case 0️⃣ — No session → try local cache
        if (!supaUser && !cookiePhone && !cookieId) {
          console.log("📦 [Profile] No Supabase/cookie session — using local cache");
          const cached = JSON.parse(localStorage.getItem("user") || "null");
          if (cached) {
            hydrate(cached);
            toast("📴 Offline Mode", { description: "Loaded cached profile." });
          }
          return;
        }

        // Case 1️⃣ — Supabase user found
        if (supaUser?.id) {
          console.log("🔗 [Profile] Found Supabase session:", supaUser.id);
          const { data, error } = await supabase
            .from("user_profiles")
            .select(
              "id,name,full_name,phone,email,email_verified,phone_verified,address,latitude,longitude,role"
            )
            .eq("id", supaUser.id)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            hydrate(data);
            console.log("✅ [Profile] Hydrated from Supabase table");
            return;
          }
        }

        // Case 2️⃣ — Cookie fallback
        if (cookiePhone) {
          console.log("🍪 [Profile] Trying cookie fallback:", cookiePhone);
          const resp = await fetch(`/api/profile?phone=${cookiePhone}`);
          if (resp.ok) {
            const json = await resp.json();
            if (json?.user) {
              hydrate(json.user);
              console.log("✅ [Profile] Hydrated via /api/profile fallback");
              return;
            }
          }
          console.warn("⚠️ [Profile] Cookie fetch failed — falling back to cache");
          const cached = JSON.parse(localStorage.getItem("user") || "null");
          if (cached) {
            hydrate(cached);
            toast("📴 Offline Mode", { description: "Loaded cached profile." });
          }
        }
      } catch (err) {
        console.error("💥 [Profile] Prefetch failed:", err);
        const cached = JSON.parse(localStorage.getItem("user") || "null");
        if (cached) {
          hydrate(cached);
          toast("📴 Offline Mode", { description: "Loaded cached profile." });
        }
      } finally {
        if (!cancelled) {
          console.log("✅ [Profile] Prefetch complete.");
          setLoading(false);
        }
      }
    }

    function hydrate(data: any) {
      const merged = { ...data, name: data.name || data.full_name };
      setProfile(merged);
      setAddress(merged.address || "");
      if (merged.latitude && merged.longitude)
        setCoords({ lat: merged.latitude, lng: merged.longitude });
      localStorage.setItem("user", JSON.stringify(merged));
    }

    prefetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------
     📍 Save Location
  ------------------------------------------------------------ */
  async function saveLocation() {
    if (!profile) return;
    try {
      const updates = { address, latitude: coords.lat, longitude: coords.lng };
      const { error: updateErr } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", profile.id);

      if (updateErr) throw updateErr;

      const updated = { ...profile, ...updates };
      setProfile(updated);
      localStorage.setItem("user", JSON.stringify(updated));

      toast.success("Location saved successfully.");
      logInfo("[PROFILE] Location saved", updates);
      navigator.vibrate?.(20);
      setEditingAddress(false);
    } catch (e) {
      logError("[PROFILE] Save failed", e);
      toast.error("Failed to save location.");
      navigator.vibrate?.([120]);
    }
  }

  /* ------------------------------------------------------------
   🚪 Logout handler — with Supabase fallback fix
------------------------------------------------------------ */
async function handleLogout() {
  console.log("🚪 [Profile] logout initiated...");

  try {
    // Try normal Supabase signout but cap to 2 seconds
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Supabase signOut timeout")), 2000)
    );

    await Promise.race([logout(), timeout])
      .then(() => console.log("✅ [Profile] logout() resolved"))
      .catch((e) => console.warn("⚠️ [Profile] logout fallback:", e.message));

    // Always clear caches regardless
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    document.cookie = "hf_user_phone=; Path=/; Max-Age=0";
    document.cookie = "hf_user_id=; Path=/; Max-Age=0";

    toast.success("You’ve been logged out.");
    navigator.vibrate?.([60, 40, 120]);

    console.log("✅ [Profile] Cache + cookies cleared, redirecting → /login");
    router.replace("/login");
  } catch (err) {
    console.error("💥 [Profile] Logout failed:", err);
    toast.error("Logout failed — please retry.");
  }
}

  /* ------------------------------------------------------------
     🧱 Render
  ------------------------------------------------------------ */
  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-6 text-center">
        <p className="text-gray-500 animate-pulse">Loading your profile…</p>
      </main>
    );
  }

  const fullyVerified = !!(profile?.email_verified && profile?.phone_verified);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 pb-[var(--mbnav-h-safe)]">
      {/* 🪪 Verification Banner */}
      <div
        onClick={() => {
          if (!fullyVerified) {
            setDrawerMode("form");
            setDrawerOpen(true);
          }
        }}
        className={`cursor-pointer rounded-xl px-4 py-3 shadow-sm border ${
          fullyVerified
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-700"
        } flex items-center justify-between`}
      >
        <span className="font-medium">
          {fullyVerified
            ? "Verified Profile ✓"
            : "Unverified Profile — Verify Now"}
        </span>
        {!fullyVerified && <span className="text-sm underline">Open</span>}
      </div>

      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* 💳 Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="border p-5 rounded-2xl shadow-sm bg-white dark:bg-zinc-900"
      >
        <div className="grid gap-3">
          <Field label="Name" value={profile?.name || "—"} />
          <Field label="Phone" value={profile?.phone || "—"} />
          <Field label="Email" value={profile?.email || "—"} />
          <Field label="Address" value={address || "—"} />
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Edit / Verify Account
          </button>

          <button
            onClick={() => setEditingAddress(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Edit Address
          </button>

          {editingAddress && (
            <button
              onClick={saveLocation}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Save Location
            </button>
          )}

          {/* 🚪 Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium ml-auto"
          >
            Logout
          </button>
        </div>
      </motion.div>

      {/* 📍 Address Editor */}
      {editingAddress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="border p-5 rounded-2xl shadow-sm bg-white dark:bg-zinc-900"
        >
          <h2 className="font-semibold text-lg mb-2">📍 Update Address</h2>
          <MapPicker
            initialLocation={coords}
            editable
            onLocationChange={(loc, addr) => {
              setCoords(loc);
              setAddress(addr);
            }}
          />
          <p className="text-sm mt-2">
            <strong>Detected Address:</strong>{" "}
            {address || "Move the pin to detect address"}
          </p>
        </motion.div>
      )}

      {/* 🧩 Auth Center Drawer */}
      <AuthCenterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialMode={drawerMode}
      />
    </main>
  );
}

/* ------------------------------------------------------------
   🧩 Reusable Field
------------------------------------------------------------ */
function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}
