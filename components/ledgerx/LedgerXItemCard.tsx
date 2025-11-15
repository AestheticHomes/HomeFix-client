"use client";
import { useProductCartStore } from "@/components/store/cartStore";
import { resolveCartConflict } from "@/components/store/cartGuards";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { LedgerXEntry } from "./useLedgerX";

interface LedgerXItemCardProps {
  entry: LedgerXEntry;
}

export default function LedgerXItemCard({ entry }: LedgerXItemCardProps) {
  const router = useRouter();
  const addItem = useProductCartStore((s) => s.addItem);

  const items = Array.isArray(entry.payload?.cart) ? entry.payload.cart : [];
  const total = entry.payload?.total ?? 0;
  const address =
    entry.payload?.address?.label ??
    entry.payload?.address?.formatted ??
    "Address not set";

  const statusColor =
    entry.status === "pending"
      ? "bg-amber-500"
      : entry.status === "synced"
      ? "bg-emerald-600"
      : "bg-slate-500";

  return (
    <div className="rounded-xl p-3 border border-[var(--edith-border)] bg-[var(--edith-surface-hover)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-sm font-medium">{entry.type}</span>
        </div>
        <span className="text-xs opacity-70">
          {new Date(entry.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="text-sm opacity-80 line-clamp-2">{address}</div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-[var(--edith-surface-hover)] text-xs opacity-80">
            {items.length} items
          </span>
          <span className="px-2 py-1 rounded-md border text-xs opacity-80">
            ₹ {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              if (!resolveCartConflict("product")) return;
              if (items.length)
                items.forEach((it: any) =>
                  addItem({ ...it, type: "product" })
                );
            }}
          >
            Reorder
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (!resolveCartConflict("product")) return;
              if (items.length)
                items.forEach((it: any) =>
                  addItem({ ...it, type: "product" })
                );
            }}
          >
            Reorder
          </Button>
        </div>
      </div>
    </div>
  );
}
