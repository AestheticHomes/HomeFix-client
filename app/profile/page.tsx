"use client";
/**
 * HomeFix India — Profile v3.4 🌿
 * ------------------------------------------------------------
 * ✅ Prefetches user data via Supabase, cookies, or localStorage
 * ✅ Auto-syncs verified flags after AuthCenterDrawer closes
 * ✅ KYC banner with “Verified ✓ / Verify Now” logic
 * ✅ MapPicker opens only when “Edit Address” clicked
 * ✅ Seamless PWA persistence across refreshes
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MapPicker from "@/components/MapPicker";
import AuthCenterDrawer from "@/components/AuthCenterDrawer";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { error, info } from "@/lib/console";

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
  const { toast } = useToast();
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
     📦 Prefetch profile (auth → cookie → local fallback)
  ------------------------------------------------------------ */
  useEffect(() => {
    async function prefetchProfile() {
      try {
        const { data: sb } = await supabase.auth.getUser().catch(() => ({
          data: undefined,
        }));
        const supaUser = sb?.user ?? null;

        const cookies = Object.fromEntries(
          (document.cookie || "")
            .split("; ")
            .filter(Boolean)
            .map((c) => {
              const i = c.indexOf("=");
              return [
                c.substring(0, i),
                decodeURIComponent(c.substring(i + 1)),
              ];
            }),
        );

        const cookiePhone = cookies["hf_user_phone"];
        const cookieId = cookies["hf_user_id"];

        if (!supaUser && !cookiePhone && !cookieId) {
          const cached = JSON.parse(localStorage.getItem("user") || "null");
          if (cached) hydrate(cached);
          setLoading(false);
          return;
        }

        // Case 1️⃣ — Supabase Auth user
        if (supaUser?.id) {
          const { data, error: profileErr } = await supabase
            .from("user_profiles")
            .select(
              "id,name,full_name,phone,email,email_verified,phone_verified,address,latitude,longitude,role",
            )
            .eq("id", supaUser.id)
            .single();

          if (profileErr) throw profileErr;
          if (data) {
            hydrate(data);
            setLoading(false);
            return;
          }
        }

        // Case 2️⃣ — Cookie fallback
        if (cookiePhone) {
          const resp = await fetch(
            `/api/profile?phone=${encodeURIComponent(cookiePhone)}`,
          );
          const json = await resp.json();
          if (resp.ok && json?.user) {
            hydrate(json.user);
          } else {
            const cached = JSON.parse(localStorage.getItem("user") || "null");
            if (cached) hydrate(cached);
          }
        }
      } catch (err) {
        console.error("[PROFILE] Prefetch failed", err);
        const cached = JSON.parse(localStorage.getItem("user") || "null");
        if (cached) hydrate(cached);
      } finally {
        setLoading(false);
      }
    }

    function hydrate(data: any) {
      const merged = { ...data, name: data.name || data.full_name };
      setProfile(merged);
      setAddress(merged.address || "");
      if (merged.latitude && merged.longitude) {
        setCoords({ lat: merged.latitude, lng: merged.longitude });
      }
      localStorage.setItem("user", JSON.stringify(merged));
    }

    prefetchProfile();
  }, []);

  /* ------------------------------------------------------------
     🔁 Auto rehydrate after drawer closes (reflect OTP/email verify)
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!drawerOpen) {
      const cached = JSON.parse(localStorage.getItem("user") || "null");
      if (cached) setProfile(cached);
    }
  }, [drawerOpen]);

  /* ------------------------------------------------------------
     📍 Save location
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
      toast({ title: "Location saved", variant: "success" });
      info("[PROFILE] Location saved", updates);
      setEditingAddress(false);
    } catch (e) {
      error("[PROFILE] Save failed", e);
      toast({ title: "Save failed", variant: "destructive" });
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
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <div className="font-medium">
              {profile?.email || "—"} {profile?.email_verified
                ? (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
                    ✓ Verified
                  </span>
                )
                : (
                  <button
                    onClick={() => {
                      setDrawerMode("email-otp");
                      setDrawerOpen(true);
                    }}
                    className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    Unverified — Verify
                  </button>
                )}
            </div>
          </div>
          <Field label="Address" value={address || "—"} />
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            onClick={() => {
              setDrawerMode("form");
              setDrawerOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Edit / Verify Account
          </button>
          <button
            onClick={() =>
              setEditingAddress(true)}
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
   🧩 Reusable Field Component
------------------------------------------------------------ */
function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}
