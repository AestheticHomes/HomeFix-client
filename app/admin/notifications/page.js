"use client";
/**
 * File: /app/admin/notifications/page.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Bell,
  Eye,
  X,
  Clipboard,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function NotificationsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchEmails();
    const unsubscribe = subscribeToRealtime();
    return () => unsubscribe && unsubscribe();
  }, []);

  async function fetchEmails() {
    setLoading(true);
    const { data, error } = await supabase
      .from("vw_email_activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) console.error("❌ Fetch error:", error);
    else setEmails(data || []);
    setLoading(false);
  }

  function subscribeToRealtime() {
    const channel = supabase
      .channel("email_logs_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "email_logs" },
        (payload) => {
          const newEmail = payload.new;
          setEmails((prev) => [newEmail, ...prev]);
          toast({
            title: "📨 New Email Sent",
            description: `${newEmail.subject || "Untitled"} to ${
              newEmail.recipient
            }`,
            duration: 4000,
          });
        }
      )
      .subscribe((status) => console.log("Realtime:", status));

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const filteredEmails = useMemo(() => {
    return emails.filter((mail) => {
      const matchesSearch =
        mail.subject?.toLowerCase().includes(search.toLowerCase()) ||
        mail.recipient?.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        filterType === "all" || mail.email_type === filterType;
      const matchesStatus =
        filterStatus === "all" || mail.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [emails, search, filterType, filterStatus]);

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard 📋",
      description: "Email content copied successfully",
      duration: 2500,
    });
  }

  if (loading)
    return (
      <main className="flex flex-col items-center justify-center h-[80vh] text-gray-500 dark:text-gray-300">
        <Clock className="animate-spin mb-3" size={24} />
        Loading notifications...
      </main>
    );

  return (
    <main className="max-w-6xl mx-auto p-6 relative">
      <Toaster />

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
        <div className="flex items-center gap-2">
          <Bell className="text-green-600" size={20} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Notification Activity
          </h1>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search recipient or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 items-center text-sm text-gray-500 dark:text-gray-300">
            <Filter size={14} className="text-green-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 focus:ring-green-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="booking">Booking</option>
              <option value="status_change">Status Change</option>
              <option value="verification">Verification</option>
              <option value="welcome">Welcome</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 focus:ring-green-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email List */}
      <AnimatePresence>
        {filteredEmails.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 mt-8">
            No notifications yet.
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredEmails.map((mail, i) => (
              <motion.div
                key={mail.id || i}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedEmail(mail)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail
                      className="text-green-600 dark:text-green-400"
                      size={18}
                    />
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {mail.subject || "(No Subject)"}
                    </p>
                  </div>
                  <Eye
                    size={16}
                    className="text-gray-400 hover:text-green-600"
                  />
                </div>

                <div className="flex flex-wrap gap-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-semibold">To:</span>{" "}
                    {mail.recipient || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Type:</span>{" "}
                    {mail.email_type || "general"}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    {mail.status === "sent" ? (
                      <span className="inline-flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle2 size={14} className="mr-1" /> Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-500">
                        <AlertCircle size={14} className="mr-1" /> Failed
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Email Preview Modal */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-3xl w-full p-6 relative overflow-hidden"
            >
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                onClick={() => setSelectedEmail(null)}
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                {selectedEmail.subject}
              </h2>
              <p className="text-sm mb-2 text-gray-500">
                Sent to:{" "}
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {selectedEmail.recipient}
                </span>
              </p>

              <div className="relative border-t border-gray-200 dark:border-slate-700 mt-4 pt-4">
                <div
                  className="max-h-[400px] overflow-y-auto text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedEmail.message ||
                      "<p><i>No HTML content available.</i></p>",
                  }}
                />
              </div>

              <div className="flex justify-end mt-4 gap-3">
                <button
                  onClick={() =>
                    copyToClipboard(selectedEmail.message || "")
                  }
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm"
                >
                  <Clipboard size={14} /> Copy HTML
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}