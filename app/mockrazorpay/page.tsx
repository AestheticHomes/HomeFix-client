"use client";
import { useLedgerX } from "@/components/ledgerx/useLedgerX";
import {
  useProductCartStore,
  useServiceCartStore,
} from "@/components/store/cartStore";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, SmartphoneNfc } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MockRazorpayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutType =
    searchParams?.get("type") === "service" ? "service" : "product";
  const { addEntry } = useLedgerX();
  const clearProductCart = useProductCartStore((s) => s.clearCart);
  const clearServiceCart = useServiceCartStore((s) => s.clearCart);
  const clearCart =
    checkoutType === "service" ? clearServiceCart : clearProductCart;

  const [stage, setStage] = useState<"processing" | "authorizing" | "success">(
    "processing"
  );

  useEffect(() => {
    const t1 = setTimeout(() => setStage("authorizing"), 1800);
    const t2 = setTimeout(() => {
      setStage("success");
      sessionStorage.setItem("checkoutPaymentStatus", "success");
      localStorage.setItem("checkoutCompleted", "true");

      if (navigator.vibrate) navigator.vibrate([25, 90]);
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [router]);

  useEffect(() => {
    if (stage !== "success") return;

    let cancelled = false;
    let redirectTimer: NodeJS.Timeout | null = null;

    const finalizePayment = async () => {
      try {
        const raw = sessionStorage.getItem("hf_checkout_payload");
        if (!raw) {
          redirectTimer = setTimeout(() => router.push("/my-orders"), 1800);
          return;
        }

        const parsed = JSON.parse(raw);
        const payload = {
          ...(parsed?.payload || {}),
          status: checkoutType === "service" ? "pending" : "paid",
          payment: {
            ...(parsed?.payload?.payment || {}),
            status:
              checkoutType === "service"
                ? "scheduled"
                : parsed?.payload?.payment?.status ?? "success",
            txn_id:
              checkoutType === "service"
                ? undefined
                : parsed?.payload?.payment?.txn_id || `MOCK-${Date.now()}`,
          },
        };

        if (cancelled) return;
        await addEntry(parsed?.uid ?? "guest", "checkout-paid", payload);
        clearCart();

        sessionStorage.removeItem("hf_checkout_payload");
        sessionStorage.removeItem("checkoutPaymentStatus");
        localStorage.removeItem("checkoutCompleted");
        localStorage.removeItem("hf_pending_order_id");
      } catch (err) {
        console.error("[MockRazorpay] finalize payment failed:", err);
      } finally {
        if (!cancelled) {
          redirectTimer = setTimeout(
            () => router.push(`/checkout/success?type=${checkoutType}`),
            1800
          );
        }
      }
    };

    finalizePayment();

    return () => {
      cancelled = true;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [stage, addEntry, clearCart, router, checkoutType]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[var(--edith-bg)] to-[var(--edith-surface)] text-center px-6 relative overflow-hidden">
      {/* Ambient Background Aura */}
      <motion.div
        className="absolute inset-0 opacity-[0.3] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.45),transparent_70%)]"
        animate={{
          backgroundPosition: ["0% 0%", "120% 120%", "0% 0%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: "linear",
        }}
      />

      <AnimatePresence mode="wait">
        {stage === "processing" && (
          <StageCard
            key="processing"
            icon={
              <Loader2 className="w-14 h-14 mx-auto mb-5 animate-spin text-indigo-500" />
            }
            title={
              checkoutType === "service"
                ? "Securing your booking."
                : "Processing payment."
            }
            subtitle={
              checkoutType === "service"
                ? "Reserving your service slot and technician."
                : "Connecting with your bank."
            }
          />
        )}

        {stage === "authorizing" && (
          <StageCard
            key="authorizing"
            icon={
              <SmartphoneNfc className="w-14 h-14 mx-auto mb-5 text-indigo-400" />
            }
            title={
              checkoutType === "service"
                ? "Coordinating visit details"
                : "Awaiting authorization"
            }
            subtitle={
              checkoutType === "service"
                ? "Confirming technician availability for your preferred slot."
                : "Approve payment on your UPI device."
            }
            pulse
          />
        )}

        {stage === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 12 }}
            className="relative z-10 bg-[var(--edith-surface-hover)] border border-emerald-500/40 rounded-3xl p-10 shadow-2xl backdrop-blur-xl max-w-sm w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 100, damping: 8 }}
              className="mb-4"
            >
              <CheckCircle className="w-16 h-16 mx-auto text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
              {checkoutType === "service"
                ? "Visit Confirmed"
                : "Payment Successful"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {checkoutType === "service"
                ? "No charge yet — visit fee applies only if you decline. Redirecting to My Orders."
                : "Redirecting to My Orders."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 text-xs text-[var(--text-secondary)] tracking-wide"
      >
        Secured by{" "}
        <span className="text-indigo-400 font-medium">Edith MockPayT</span>
      </motion.p>
    </div>
  );
}

function StageCard({
  icon,
  title,
  subtitle,
  pulse = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  pulse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`relative z-10 ${
        pulse ? "animate-pulse" : ""
      } bg-[var(--edith-surface-hover)] border border-[var(--edith-border)] rounded-3xl p-10 shadow-2xl backdrop-blur-xl max-w-sm w-full`}
    >
      {icon}
      <h2 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
    </motion.div>
  );
}
