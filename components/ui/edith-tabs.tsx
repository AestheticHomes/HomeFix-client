"use client";
/**
 * ============================================================
 * 🧭 EdithTabs — v7.7 (Built on ButtonGroupPro)
 * ------------------------------------------------------------
 * ✅ Smart tab system for Next.js App Router
 * ✅ Uses ButtonGroupPro for top bar
 * ✅ Persists active tab (localStorage + URL)
 * ✅ Motion fade between tab panels
 * ✅ Light/Dark adaptive (Edith theme)
 * ============================================================
 */

import { ButtonGroupPro } from "@/components/ui/button-group-pro";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";

export interface EdithTabsProps {
  groupKey: string;
  tabs: {
    id: string;
    label: string;
    icon?: React.ElementType;
    content: React.ReactNode;
  }[];
  defaultId?: string;
  syncURL?: boolean;
  className?: string;
  rounded?: boolean;
  fullWidth?: boolean;
}

/**
 * Usage:
 *  <EdithTabs
 *    groupKey="admin-panel"
 *    tabs={[
 *      { id: "orders", label: "Orders", icon: Package2, content: <OrdersTab /> },
 *      { id: "ledger", label: "Ledger", icon: Receipt, content: <LedgerTab /> },
 *      { id: "users", label: "Users", icon: Users, content: <UsersTab /> },
 *    ]}
 *  />
 */
export function EdithTabs({
  groupKey,
  tabs,
  defaultId = tabs[0]?.id,
  syncURL = true,
  className,
  rounded = true,
  fullWidth = true,
}: EdithTabsProps) {
  const [activeId, setActiveId] = React.useState(defaultId);

  const activeTab = tabs.find((t) => t.id === activeId) || tabs[0];

  return (
    <div
      className={clsx(
        "flex flex-col w-full",
        "bg-[var(--edith-surface)] dark:bg-[var(--edith-surface)] rounded-2xl border border-[var(--edith-border)] shadow-sm",
        className
      )}
    >
      {/* 🌗 Tab Header */}
      <div
        className={clsx(
          "p-3 border-b border-[var(--edith-border)] flex justify-center",
          fullWidth ? "w-full" : "w-auto mx-auto"
        )}
      >
        <ButtonGroupPro
          groupKey={groupKey}
          options={tabs.map((t) => ({
            id: t.id,
            label: t.label,
            icon: t.icon,
          }))}
          defaultId={defaultId}
          onChange={setActiveId}
          syncURL={syncURL}
          rounded={rounded}
        />
      </div>

      {/* 🪶 Animated Content */}
      <div className="relative flex-1 min-h-[200px] p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative"
          >
            {activeTab?.content || (
              <p className="text-center text-[var(--text-secondary)]">
                No content for this tab.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default EdithTabs;
