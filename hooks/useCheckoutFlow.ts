import { useLedgerX } from "@/components/ledgerx/useLedgerX";
import { useProductCartStore } from "@/components/store/cartStore";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useMemo, useState } from "react";

export function useCheckoutFlow() {
  const { user, isLoaded } = useUser();
  const { items, totalPrice, clearCart } = useProductCartStore();
  const { addEntry } = useLedgerX();

  const [state, setState] = useState({
    ready: false,
    loading: false,
    msg: "",
    msgType: "info" as "info" | "success" | "error",
  });

  useEffect(() => {
    if (isLoaded) setState((s) => ({ ...s, ready: true }));
  }, [isLoaded]);

  const hasProducts = items.some((i) => i.type === "product");
  const hasServices = items.some((i) => i.type === "service");
  const total = hasServices && !hasProducts ? 0 : totalPrice;

  const canSubmit = useMemo(() => {
    // simple example
    return !!items.length;
  }, [items.length]);

  async function handleCheckout(payload: any) {
    if (!user?.id) {
      setState({ ...state, msg: "❌ Please log in first.", msgType: "error" });
      return;
    }
    const entry = await addEntry(user.id, "checkout-confirm", payload);
    console.log("LedgerX entry:", entry);
    // … do payment flow
  }

  return {
    user,
    items,
    total,
    hasProducts,
    hasServices,
    canSubmit,
    handleCheckout,
    state,
    setState,
    clearCart,
  };
}
