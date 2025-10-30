"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { getCaps } from "@/lib/roles";

export default function AdminSidebar({ role = "user", onLogout }) {
  const caps = getCaps(role);
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { name: "Dashboard", href: "/profile", icon: LayoutDashboard, show: true },
    {
      name: "Bookings",
      href: "/profile/bookings",
      icon: CalendarDays,
      show: caps.canSeeBookings,
    },
    {
      name: "CMS / Goods",
      href: "/profile/content",
      icon: Package,
      show: caps.canSeeCms,
    },
    {
      name: "Users",
      href: "/profile/users",
      icon: Users,
      show: caps.canSeeUsers,
    },
    {
      name: "Settings",
      href: "/profile/settings",
      icon: Settings,
      show: caps.canSeeSettings,
    },
  ].filter((i) => i.show);

  return (
    <aside className="hidden md:flex md:flex-col w-64 h-[100dvh] bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
        <h2 className="text-lg font-bold text-green-600">HomeFix Admin</h2>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin">
        {items.map(({ name, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <button
              key={name}
              onClick={() => router.push(href)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-left transition-colors ${
                active
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <Icon size={18} />
              {name}
            </button>
          );
        })}
      </nav>

      <div className="border-t dark:border-slate-700 p-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
