"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Start turnkey project", href: "/full-home-packages" },
  { label: "Services", href: "/services" },
  { label: "Store", href: "/store" },
  { label: "Estimator", href: "/instant-quote" },
  { label: "Studio", href: "/design-lab" },
  { label: "My bookings", href: "/my-bookings" },
  { label: "Profile & account", href: "/profile" },
  { label: "Support / help", href: "/support" },
];

type MobileSideNavProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileSideNav({ open, onClose }: MobileSideNavProps) {
  const router = useRouter();

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const handleNav = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-(--overlay-cta) z-120"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed top-0 left-0 bottom-0 w-[82vw] max-w-[340px] z-130 bg-(--edith-surface) text-(--text-primary) pt-5 pb-8 shadow-2xl"
              initial={{ x: -360 }}
              animate={{ x: 0 }}
              exit={{ x: -360 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <div className="flex items-center justify-between px-4 pb-3 mb-2 border-b border-(--border-soft)">
                <span className="text-sm font-semibold">Navigate</span>
                <button
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-(--border-soft)"
                  onClick={onClose}
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-1 px-3">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNav(item.href)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium bg-(--surface-panel) border border-(--border-soft) hover:border-(--accent-primary) transition"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
