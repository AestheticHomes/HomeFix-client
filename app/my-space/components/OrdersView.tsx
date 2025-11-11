"use client";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import OrderCard from "./OrderCard";

export default function OrdersView({ standalone = false }: any) {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id;
    if (!userId || !isLoaded) return;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/invoices/list?user_id=${userId}`);
      const json = await res.json();
      if (json.success) setOrders(json.invoices || []);
      setLoading(false);
    })();
  }, [user?.id, isLoaded]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Loading orders...
      </div>
    );

  return (
    <div className="flex flex-col gap-3 pb-24">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.length ? (
          orders.map((o) => <OrderCard key={o.id} order={o} />)
        ) : (
          <p className="text-center text-gray-400 py-16">No orders found.</p>
        )}
      </div>
    </div>
  );
}
