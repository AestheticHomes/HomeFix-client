"use client";
/**
 * File: /app/api/book.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
import { useState } from "react";

export default function Book() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [datetime, setDatetime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

const requestOtp = async () => {
  try {
    setLoading(true);
    setMessage("Sending OTP...");

    console.log("Sending data:", { name, phone, service, datetime }); // 👈 add this line

    const res = await fetch("/api/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        service,
        datetime,
      }),
    });

    const data = await res.json();
    console.log("Response:", data);

    if (!res.ok) {
      throw new Error(data.error || "Failed to send OTP");
    }

    setMessage("OTP sent successfully!");
  } catch (err) {
    console.error(err);
    setMessage(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold">Book a Service</h3>
        <p className="text-sm text-gray-500">Quick booking with phone verification.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestOtp();
          }}
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="p-3 border rounded-lg"
            required
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            className="p-3 border rounded-lg"
            required
          />
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="p-3 border rounded-lg"
            required
          >
            <option value="">Select service</option>
            <option>Carpenter</option>
            <option>Painting</option>
            <option>Bathroom Remodel</option>
            <option>False Ceiling</option>
            <option>Interiors</option>
            <option>Repairs</option>
          </select>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="p-3 border rounded-lg"
            required
          />
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-green-700 text-white font-semibold"
            >
              {loading ? "Processing..." : "Request OTP & Book"}
            </button>
          </div>
        </form>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>
    </section>
  );
}