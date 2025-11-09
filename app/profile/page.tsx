"use client";

/**
 * ============================================================
 * 🧩 FILE: /app/profile/page.tsx
 * VERSION: v4.1 — Edith Toast-Safe + VerifiedSync Build 🌿
 * ------------------------------------------------------------
 * ✅ Uses Edith unified toast system (no duplicates)
 * ✅ Fetches live data from /api/profile?phone=...
 * ✅ Syncs instantly after AuthCenterDrawer edits
 * ✅ Offline fallback retained
 * ✅ Logout + location save cleaned
 * ============================================================
 */

import AuthCenterDrawer from "@/components/AuthCenterDrawer";
import MapPicker from "@/components/MapPicker";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { error as logError } from "@/lib/console";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { logout } = useUser();
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
     🧠 Shared: Hydrate data into state + cache
  ------------------------------------------------------------ */
  function hydrate(data: any) {
    const merged = {
      ...data,
      name: data.name || data.full_name,
      email_verified: !!data.email_verified,
      phone_verified: !!data.phone_verified,
    };
    setProfile(merged);
    setAddress(merged.address || "");
    if (merged.latitude && merged.longitude)
      setCoords({ lat: merged.latitude, lng: merged.longitude });
    localStorage.setItem("user", JSON.stringify(merged));
  }

  /* ------------------------------------------------------------
     🔁 Fetch Latest Profile (live from API)
  ------------------------------------------------------------ */
  async function prefetchProfile() {
    console.log("♻️ [Profile] Prefetch initiated...");

    try {
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
      if (!cookiePhone) {
        console.warn("⚠️ [Profile] No cookie phone — using cache fallback");
        const cached = JSON.parse(localStorage.getItem("user") || "null");
        if (cached) {
          hydrate(cached);
          info("📴 Offline Mode: Loaded cached profile.");
        }
        return;
      }

      const resp = await fetch(`/api/profile?phone=${cookiePhone}`, {
        cache: "no-store",
      });
      const json = await resp.json();

      if (json?.user) {
        const fresh = {
          ...json.user,
          email_verified: !!json.user.email_verified,
          phone_verified: !!json.user.phone_verified,
        };
        hydrate(fresh);
        console.log(
          `✅ [Profile] Hydrated from API — Verified: ${
            fresh.email_verified ? "✅" : "❌"
          }`
        );
      } else {
        console.warn("⚠️ [Profile] No user found, fallback to cache");
        const cached = JSON.parse(localStorage.getItem("user") || "null");
        if (cached) hydrate(cached);
      }
    } catch (err) {
      console.error("💥 [Profile] Prefetch failed:", err);
      const cached = JSON.parse(localStorage.getItem("user") || "null");
      if (cached) {
        hydrate(cached);
        info("📴 Offline Mode: Loaded cached profile.");
      }
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------
     🚀 Initial Mount + LiveSync Listener
  ------------------------------------------------------------ */
  useEffect(() => {
    prefetchProfile();

    function handleProfileUpdated() {
      console.log("🔁 [Profile] Received profile-updated event");
      prefetchProfile();
    }

    window.addEventListener("profile-updated", handleProfileUpdated);
    return () =>
      window.removeEventListener("profile-updated", handleProfileUpdated);
  }, []);

  /* ------------------------------------------------------------
     📍 Save Location (and trigger refresh)
  ------------------------------------------------------------ */
  async function saveLocation() {
    if (!profile) return;

    try {
      const updates = { address, latitude: coords.lat, longitude: coords.lng };
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: profile.phone, ...updates }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      hydrate(data.user);
      success("📍 Location saved successfully.");
      navigator.vibrate?.(20);
      setEditingAddress(false);
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e: any) {
      logError("[PROFILE] Save failed", e);
      error("Failed to save location. Try again.");
      navigator.vibrate?.([120]);
    }
  }

  /* ------------------------------------------------------------
     🚪 Logout handler
  ------------------------------------------------------------ */
  async function handleLogout() {
    console.log("🚪 [Profile] logout initiated...");

    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase signOut timeout")), 2000)
      );

      await Promise.race([logout(), timeout])
        .then(() => console.log("✅ [Profile] logout() resolved"))
        .catch((e) => console.warn("⚠️ [Profile] logout fallback:", e.message));

      // 🧹 Clear local cache + cookies
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      document.cookie = "hf_user_phone=; Path=/; Max-Age=0";
      document.cookie = "hf_user_id=; Path=/; Max-Age=0";

      success("You’ve been logged out.");
      navigator.vibrate?.([60, 40, 120]);

      console.log("✅ [Profile] Redirecting → /login");
      router.replace("/login");
    } catch (err) {
      console.error("💥 [Profile] Logout failed:", err);
      error("Logout failed — please retry.");
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
