"use client";
/**
 * File: /components/BookingForm.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Reusable Toast
function Toast({ message, type, onClose }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium z-50 ${
            type === "error" ? "bg-red-600" : "bg-green-700"
          }`}
        >
          {message}
          <button onClick={onClose} className="ml-3 text-lg leading-none">
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function BookingForm() {
  const [user, setUser] = useState(null);
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const [usePermanent, setUsePermanent] = useState(false);
  const [site, setSite] = useState({ lat: null, lng: null, landmark: "" });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    booked_for: "",
  });

  // Default booking time — tomorrow 10 AM
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setFormData((p) => ({
      ...p,
      booked_for: tomorrow.toISOString().slice(0, 16),
    }));
  }, []);

  // 🔄 If user toggles “use permanent address”
  useEffect(() => {
    if (usePermanent) {
      const saved = JSON.parse(localStorage.getItem("address"));
      if (saved) {
        setSite({
          lat: saved.lat,
          lng: saved.lng,
          landmark: saved.landmark,
        });
      }
    } else {
      setSite({ lat: null, lng: null, landmark: "" });
    }
  }, [usePermanent]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3000);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 📨 Send OTP
  async function sendOtp(e) {
    e.preventDefault();
    const { name, phone, service, booked_for } = formData;

    if (!name || !phone || !service || !booked_for) {
      showToast("❌ Please fill all fields", "error");
      return;
    }

    try {
      setLoading(true);
      setStatus("Sending OTP...");
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          service,
          booked_for,
          site,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpModal(true);
        showToast("✅ OTP sent successfully");
      } else showToast("❌ " + (data.error || "Failed"), "error");
    } catch {
      showToast("❌ Network error", "error");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Verify OTP
  async function verifyOtp(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          otp,
          action: "verify",
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const userData = { name: formData.name, phone: formData.phone };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        showToast(`✅ Booking confirmed for ${formData.service}`);
        setOtpModal(false);
      } else {
        showToast("❌ Invalid or expired OTP", "error");
      }
    } catch (err) {
      console.error("❌ OTP Verify Error:", err);
      showToast("❌ Server error during verification", "error");
    } finally {
      setLoading(false);
    }
  }

  // 🚪 Logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
    showToast("Logged out");
  };

  // 🧭 If logged in — show confirmation panel
  if (user) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-8 rounded-2xl shadow-md"
        >
          <h2 className="text-2xl font-bold text-gray-800">
            👋 Welcome back, {user.name}
          </h2>
          <p className="text-gray-500 mt-2">
            Manage your bookings or update your profile.
          </p>
          <div className="mt-6 flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={() => (window.location.href = "/bookings")}
              className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800"
            >
              View My Bookings
            </button>
            <button
              onClick={() => (window.location.href = "/profile")}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Edit Profile
            </button>
            <button
              onClick={logout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </motion.div>
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />
      </section>
    );
  }

  // 🧾 Booking Form
  return (
    <section id="booking" className="max-w-6xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-8 rounded-2xl shadow-xl"
      >
        <h3 className="text-2xl font-bold mb-1 text-green-800">
          Book a Service
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Fill your details and verify via OTP to confirm booking.
        </p>

        <form
          onSubmit={sendOtp}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="p-3 border rounded-lg"
            required
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Mobile Number"
            className="p-3 border rounded-lg"
            required
          />
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="p-3 border rounded-lg"
            required
          >
            <option value="">Select Service</option>
            <option>Carpenter</option>
            <option>Painting</option>
            <option>Bathroom Remodel</option>
            <option>False Ceiling</option>
            <option>Interiors</option>
            <option>Repairs</option>
          </select>
          <input
            name="booked_for"
            type="datetime-local"
            value={formData.booked_for}
            onChange={handleChange}
            min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
            className="p-3 border rounded-lg"
            required
          />

          {/* Use Permanent Address Toggle */}
          <div className="md:col-span-2 mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={usePermanent}
              onChange={(e) => setUsePermanent(e.target.checked)}
              className="h-4 w-4 text-green-700 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">
              Use my permanent address as site location
            </label>
          </div>

          {/* Landmark field when not using permanent */}
          {!usePermanent && (
            <div className="md:col-span-2">
              <input
                placeholder="Site Landmark"
                value={site.landmark}
                onChange={(e) =>
                  setSite({ ...site, landmark: e.target.value })
                }
                className="p-3 border rounded-lg w-full"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 rounded-xl text-white font-semibold transition ${
                loading ? "bg-gray-400" : "bg-green-700 hover:bg-green-800"
              }`}
            >
              {loading ? "Processing..." : "Request OTP & Book"}
            </button>
          </div>
        </form>

        {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
      </motion.div>

      {/* OTP Modal */}
      <AnimatePresence>
        {otpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl"
            >
              <h3 className="text-lg font-bold mb-2">Verify Your Number</h3>
              <p className="text-sm text-gray-600">
                We sent an OTP to {formData.phone}
              </p>
              <form onSubmit={verifyOtp} className="space-y-3 mt-3">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Enter OTP"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 rounded text-white font-medium transition ${
                    loading
                      ? "bg-gray-400"
                      : "bg-green-700 hover:bg-green-800"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </form>
              <button
                onClick={() => setOtpModal(false)}
                className="mt-3 text-sm text-gray-500 w-full text-center"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </section>
  );
}