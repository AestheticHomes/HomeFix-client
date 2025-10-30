/**
 * File: /components/admin/BookingsTable.tsx
 * Purpose: Renders table for latest bookings with inline updates
 * ------------------------------------------------------------
 * ✅ Strongly typed props
 * ✅ Optimistic UI updates
 * ✅ Responsive table layout
 */

"use client";

import { Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// 💡 Define booking structure
export interface AdminBooking {
  id: number;
  created_at: string;
  address?: string | null;
  status?: string | null;
  user_profiles?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  services?: {
    title?: string | null;
  } | null;
}

interface BookingsTableProps {
  bookings: AdminBooking[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleStatusChange: (id: number, newStatus: string, service?: string) => void;
}

export default function BookingsTable({
  bookings,
  searchTerm,
  setSearchTerm,
  handleStatusChange,
}: BookingsTableProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-700 dark:text-gray-200">
            <Clock size={18} /> Latest Bookings
          </h2>

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
              {bookings.length
                ? (
                  bookings.map((b: AdminBooking) => (
                    <tr
                      key={b.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                      <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-200">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                        {b.user_profiles?.name || "—"}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-300">
                        {b.services?.title || "—"}
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
                              b.services?.title || undefined,
                            )}
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
                )
                : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-400">
                      No bookings found
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
