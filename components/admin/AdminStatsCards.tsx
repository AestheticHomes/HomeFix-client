/**
 * File: /components/admin/AdminStatsCards.tsx
 * Purpose: Displays summary cards (Services / Bookings / Users)
 * ------------------------------------------------------------
 * ✅ Type-safe props (AdminStats)
 * ✅ Framer Motion animation
 * ✅ Dark/light mode compatible
 */

"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface AdminStats {
  services: number;
  bookings: number;
  users: number;
}

interface AdminStatsCardsProps {
  stats: AdminStats;
}

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const router = useRouter();

  const cards = [
    {
      title: "Services",
      icon: "🛠️",
      count: stats.services,
      route: "/profile/services",
    },
    {
      title: "Bookings",
      icon: "📖",
      count: stats.bookings,
      route: "/profile/bookings",
    },
    {
      title: "Users",
      icon: "👥",
      count: stats.users,
      route: "/profile/users",
    },
  ];

  return (
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
              <div className="mb-3 text-3xl">{c.icon}</div>
              <h2 className="text-lg font-semibold text-slate-700 dark:text-white">
                {c.title}
              </h2>
              <p className="text-2xl font-bold text-green-600">{c.count}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
