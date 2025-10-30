"use client";
export default function AdminTopbar({ title = "Admin Panel", right = null }) {
  return (
    <header className="sticky top-0 bg-white dark:bg-slate-800 shadow-sm border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-6 py-3 z-30">
      <h1 className="font-semibold text-lg">{title}</h1>
      <div className="text-sm text-gray-500 dark:text-gray-400">{right}</div>
    </header>
  );
}
