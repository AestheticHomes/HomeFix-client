"use client";
/**
 * Checkout Success
 * - Supports product vs service flows (Book-now-pay-later)
 * - Confetti, CTA shortcuts, and safe copy for compliance
 */

import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Home, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

declare module "canvas-confetti" {
  interface ConfettiOptions {
    startVelocity?: number;
  }
}

const formatInr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

function CheckoutSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const isServiceFlow = searchParams?.get("type") === "service";
  const total = useMemo(() => {
    if (isServiceFlow) return null;
    const raw = localStorage.getItem("last_checkout_total");
    return raw ? Number(raw) : null;
  }, [isServiceFlow]);

  useEffect(() => {
    setMounted(true);
    const root = getComputedStyle(document.documentElement);
    const colors = [
      root.getPropertyValue("--accent-success").trim() || "#1e3a8a",
      root.getPropertyValue("--accent-primary").trim() || "#1e3a8a",
      root.getPropertyValue("--accent-secondary").trim() || "#ca8a04",
    ];
    const duration = 2000;
    const end = Date.now() + duration;

    (function frame() {
      (confetti as any)({
        particleCount: 4,
        startVelocity: 25,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      (confetti as any)({
        particleCount: 4,
        startVelocity: 25,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    navigator.vibrate?.([25, 50]);
  }, []);

  const ordersLink = isServiceFlow
    ? "/my-bookings?tab=service"
    : "/my-bookings";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[var(--edith-bg)] to-[var(--edith-surface)] px-6 text-center">
      <AnimatePresence>
        {mounted && (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--edith-surface-hover)] rounded-2xl shadow-lg backdrop-blur-xl p-8 w-full sm:max-w-md border border-[var(--edith-border)]"
          >
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-3" />
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              {isServiceFlow ? "Service Visit Booked!" : "Order Confirmed!"}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              {isServiceFlow
                ? "Your technician will reach out shortly. Visit fee is charged only if you decline the quotation."
                : "Your payment was successful. Thank you for choosing HomeFix."}
            </p>

            {!isServiceFlow && total !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 bg-[var(--edith-surface)] rounded-xl p-4 text-left border border-[var(--edith-border)]"
              >
                <p className="text-xs text-[var(--text-secondary)] mb-1">
                  Transaction ID
                </p>
                <p className="font-mono text-[var(--text-primary)] text-sm">
                  MOCK-{new Date().getTime()}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-sm opacity-80">Total</p>
                  <p className="text-lg font-semibold text-green-500">
                    {formatInr(total)}
                  </p>
                </div>
                <p className="text-xs opacity-60 mt-3">
                  {new Date().toLocaleString()}
                </p>
              </motion.div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push(ordersLink)}
                className="flex items-center justify-center gap-2 bg-[var(--accent-success)] hover:bg-[var(--accent-success-hover)] text-white w-full sm:w-auto"
              >
                <Package className="w-4 h-4" />
                View My Orders
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 border-[var(--accent-success)] text-[var(--accent-success)] hover:bg-emerald-50 w-full sm:w-auto"
              >
                <Home className="w-4 h-4" />
                Back Home
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessPageContent />
    </Suspense>
  );
}
