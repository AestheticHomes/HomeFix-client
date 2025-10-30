"use client";
/**
 * File: /app/admin/page.js
 * HomeFix India — Admin Dashboard v5.0 🌿
 * ------------------------------------------------------------
 * ✅ Real booking stats (pending, completed, in-progress)
 * ✅ Booking trend chart (monthly)
 * ✅ Latest bookings table with client + service
 * ✅ Edith-integrated logging + refresh button
 * ✅ Works with Supabase + /api/admin/bookings/list
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  RefreshCcw,
  Database,
  Clock,
  User,
  Layers,
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
import { Button } from "@/components/ui/button";
import * as c from "@/lib/console";
import { supabase } from "@/lib/supabaseClient";

function LoaderScreen({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500 dark:text-gray-400">
      <Database className="animate-spin w-6 h-6 mb-3" />
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------
     📦 Fetch all bookings
  ------------------------------------------------------------ */
  const fetchData = async () => {
    setLoading(true);
    c.info("AdminDashboard", "📊 Fetching dashboard data...");

    try {
      const res = await fetch("/api/admin/bookings/list", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const rows = json.bookings || [];
      setBookings(rows);
      computeStats(rows);
      computeChart(rows);

      c.log("AdminDashboard", `✅ Loaded ${rows.length} bookings`);
    } catch (err) {
      c.error("AdminDashboard", "💥 Failed to fetch dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ------------------------------------------------------------
     📈 Compute summary stats
  ------------------------------------------------------------ */
  const computeStats = (rows) => {
    const pending = rows.filter((b) => b.status === "pending").length;
    const completed = rows.filter((b) => b.status === "completed").length;
    const inProgress = rows.filter((b) => b.status === "in-progress").length;

    setStats({
      total: rows.length,
      pending,
      completed,
      inProgress,
    });
  };

  /* ------------------------------------------------------------
     📅 Compute chart data (monthly trend)
  ------------------------------------------------------------ */
  const computeChart = (rows) => {
    const counts = {};
    rows.forEach((b) => {
      const date = new Date(b.created_at);
      const key = date.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      counts[key] = (counts[key] || 0) + 1;
    });
    const chart = Object.entries(counts).map(([month, count]) => ({ month, count }));
    setChartData(chart.sort((a, b) => new Date(a.month) - new Date(b.month)));
  };

  if (loading) return <LoaderScreen message="Loading Admin Dashboard…" />;

  /* ------------------------------------------------------------
     🧱 UI
  ------------------------------------------------------------ */
  return (
    <main className="p-6 min-h-screen bg-gray-50 dark:bg-slate-900 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.h1
          className="text-3xl font-bold text-slate-800 dark:text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Admin Dashboard
        </motion.h1>
        <Button
          onClick={fetchData}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCcw size={16} /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Bookings" value={stats.total} color="text-blue-600" />
        <StatCard title="Pending" value={stats.pending} color="text-yellow-500" />
        <StatCard title="In Progress" value={stats.inProgress} color="text-indigo-500" />
        <StatCard title="Completed" value={stats.completed} color="text-green-600" />
      </div>

      {/* Trends */}
      <Card className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-700 dark:text-gray-200">
            <Activity size={18} /> Booking Trends
          </h2>
          <div className="h-64">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis allowDecimals={false} stroke="#888" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Database className="w-5 h-5" /> No trend data yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Latest Bookings */}
      <Card className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-700 dark:text-gray-200">
            <Layers size={18} /> Latest Bookings
          </h2>
          {bookings.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-8">
              No bookings found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-slate-700">
                    <th className="py-2 px-3">Client</th>
                    <th className="py-2 px-3">Service</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Slot</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 8).map((b) => (
                    <tr
                      key={b.id}
                      className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition"
                    >
                      <td className="py-2 px-3 flex items-center gap-2">
                        <User size={14} /> {b.user_profiles?.name || "—"}
                      </td>
                      <td className="py-2 px-3 text-green-600 dark:text-green-400">
                        {b.services?.title || "—"}
                      </td>
                      <td className="py-2 px-3 capitalize">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-2 px-3">
                        {b.preferred_date
                          ? new Date(b.preferred_date).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-2 px-3">{b.preferred_slot || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

/* ------------------------------------------------------------
   📊 Stat Card Subcomponent
------------------------------------------------------------ */
function StatCard({ title, value, color }) {
  return (
    <Card className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm">
      <CardContent className="p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------
   🟢 Status Badge Subcomponent
------------------------------------------------------------ */
function StatusBadge({ status }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "in-progress": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    rescheduled: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}
