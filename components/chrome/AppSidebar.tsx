"use client";

import Sidebar from "@/components/layout/Sidebar";

export default function AppSidebar() {
  return (
    <div
      className="hidden md:block fixed left-0 overflow-y-auto overflow-x-hidden"
      style={{
        top: "var(--hf-header-height,72px)",
        height: "calc(100vh - var(--hf-header-height,72px))",
        width: "var(--hf-sidebar-width,256px)",
        zIndex: "var(--z-header)",
      }}
    >
      <Sidebar />
    </div>
  );
}
