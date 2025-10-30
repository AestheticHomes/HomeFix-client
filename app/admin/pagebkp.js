"use client";
/**
 * HomeFix India — Admin Dashboard v3.9 🌿
 * ---------------------------------------
 * ✅ Stable hook order (no mismatch errors)
 * ✅ Smooth Supabase Realtime listener
 * ✅ Role-based protection via useRoleGuard
 * ✅ Unified LoaderScreen inline fallback
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Hammer,
  User,
  BookOpen,
  Clock,
  MapPin,
  Activity,
  RefreshCcw,
  Loader2,
  Database,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useRoleGuard } from "@/hooks/useRoleGuard";

// 🔗 Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🌿 Inline loader component
function LoaderScreen({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500 dark:text-gray-400">
      <Loader2 className="animate-spin w-6 h-6 mb-3" />
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();

  // 🔒 Role Guard
  const { authorized, isChecking } = useRoleGuard(["admin"]);

  // 🧩 Hooks (declare before conditional returns)
  const [stats, setStats] = useState({ services: 0, bookings: 0, users: 0 });
  const [bookings, setBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔍 Filtered bookings (search client/service/address)
  const filteredBookings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.client_name?.toLowerCase().includes(q) ||
        b.service_name?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q)
    );
  }, [bookings, searchTerm]);

  // 📊 Load Dashboard Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ count: sCount }, { count: bCount }, { count: uCount }] =
        await Promise.all([
          supabase.from("services").select("id", { count: "exact", head: true }),
          supabase.from("bookings").select("id", { count: "exact", head: true }),
          supabase
            .from("user_profiles")
            .select("id", { count: "exact", head: true }),
        ]);

      setStats({
        services: sCount || 0,
        bookings: bCount || 0,
        users: uCount || 0,
      });

      // 🕓 Latest 5 bookings
      const { data: latest } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // 📈 Monthly trend
      const { data: all } = await supabase
        .from("bookings")
        .select("created_at")
        .order("created_at", { ascending: true });

      const grouped =
        all?.reduce((acc, b) => {
          const month = new Date(b.created_at).toLocaleString("en", {
            month: "short",
          });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {}) ?? {};

      setBookings(latest || []);
      setChartData(
        Object.entries(grouped).map(([month, count]) => ({ month, count }))
      );
    } catch (err) {
      console.error("[AdminDashboard] Load failed:", err);
      toast?.({
        title: "Error loading data",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Initial Load
  useEffect(() => {
    if (authorized) loadData();
  }, [authorized, loadData]);

  // 📡 Realtime Listener
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.onLine) return;
    let unsubscribed = false;

    const channel = supabase
      .channel("admin-bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          if (!unsubscribed) loadData();
        }
      )
      .subscribe((status) => {
        if (process.env.NODE_ENV === "development") {
          if (status === "SUBSCRIBED")
            console.log("📡 Realtime connected (bookings)");
          if (status === "CLOSED") console.log("📡 Realtime channel closed");
          if (status === "CHANNEL_ERROR")
            console.warn("⚠️ Realtime channel error");
        }
      });

    return () => {
      unsubscribed = true;
      setTimeout(() => {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }, 200);
    };
  }, [loadData]);

  // 🔁 Update Booking Status
  const handleStatusChange = async (id, newStatus, service) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `${service || "Booking"} → ${newStatus}`,
      });
    }
  };

  // ✅ Summary Cards
  const cards = useMemo(
    () => [
      {
        title: "Services",
        icon: <Hammer className="text-green-600" />,
        count: stats.services,
        route: "/profile/services",
      },
      {
        title: "Bookings",
        icon: <BookOpen className="text-green-600" />,
        count: stats.bookings,
        route: "/profile/bookings",
      },
      {
        title: "Users",
        icon: <User className="text-green-600" />,
        count: stats.users,
        route: "/profile/users",
      },
    ],
    [stats]
  );

  // ---------------------------------------------------
  // 🎨 Conditional Renders
  // ---------------------------------------------------
  if (isChecking) return <LoaderScreen message="Verifying admin access…" />;
  if (!authorized) return null;
  if (loading) return <LoaderScreen message="Loading Admin Dashboard…" />;

  // ---------------------------------------------------
  // 🌿 Dashboard UI
  // ---------------------------------------------------
  return (
    <main className="p-6 min-h-screen bg-gray-50 dark:bg-slate-900 space-y-12">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-slate-800 dark:text-white"
        >
          Admin Dashboard
        </motion.h1>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              onClick={() => router.push(c.route)}
              className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="mb-3">{c.icon}</div>
                <h2 className="text-lg font-semibold text-slate-700 dark:text-white">
                  {c.title}
                </h2>
                <p className="text-2xl font-bold text-green-600">{c.count}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* BOOKING TRENDS */}
      <Card className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-700 dark:text-gray-200">
            <Activity size={18} /> Booking Trends
          </h2>
          <div className="h-64">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Database className="w-5 h-5" /> No data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* LATEST BOOKINGS WITH SEARCH */}
      <Card className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-700 dark:text-gray-200">
              <Clock size={18} /> Latest Bookings
            </h2>

            {/* 🔍 Search Bar */}
            <input
              type="text"
              placeholder="Search client, service, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 text-sm border rounded-md dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Client</th>
                  <th className="py-2 px-3">Service</th>
                  <th className="py-2 px-3">Address</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length ? (
                  filteredBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                      <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-200">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                        {b.client_name || "—"}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-300">
                        {b.service_name || "—"}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                        <MapPin size={14} /> {b.address || "—"}
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={b.status || "upcoming"}
                          onChange={(e) =>
                            handleStatusChange(
                              b.id,
                              e.target.value,
                              b.service_name
                            )
                          }
                          className="border rounded px-2 py-1 text-sm dark:bg-slate-700 dark:text-white"
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-gray-400"
                    >
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FOOTER LINK */}
      <div className="text-center pt-6">
        <Link
          href="/profile/bookings"
          className="inline-flex items-center gap-2 text-green-700 hover:underline"
        >
          View All Bookings →
        </Link>
      </div>
    </main>
  );
}
