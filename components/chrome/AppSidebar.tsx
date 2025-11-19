"use client";

import Sidebar from "@/components/layout/Sidebar";

export default function AppSidebar() {
  return (
    <div className="hidden md:block fixed inset-y-0 left-0 w-[256px] z-40">
      <Sidebar />
    </div>
  );
}
