// app/api/invoices/list/route.ts
export const runtime = "nodejs";

import { supabaseService } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

const STORE_FLOW = [
  "Order Placed",
  "Order Received",
  "Order Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
];

const SERVICE_FLOW = [
  "Service Booked",
  "Engineer Assigned",
  "Site Visit",
  "Quotation Sent",
  "Awaiting Approval",
  "Work Started",
  "In Progress",
  "Completion & Handover",
];

const STATUS_HINT: Record<string, number> = {
  pending: 1,
  synced: 6,
  completed: 6,
  failed: 2,
  cancelled: 2,
  rescheduled: 3,
  confirmed: 3,
};

function inferOrderType(row: any) {
  const declaredType =
    row?.type?.toLowerCase?.() ||
    row?.order_type?.toLowerCase?.() ||
    row?.payload?.order_type?.toLowerCase?.();

  if (declaredType === "service") return "service";
  if (declaredType === "product" || declaredType === "store") return "store";

  const payload = row?.payload ?? {};
  if (
    payload.channel === "store" ||
    payload.type === "store" ||
    (Array.isArray(payload.items) &&
      !Array.isArray(payload.services) &&
      !payload.visit_fee)
  ) {
    return "store";
  }
  return "service";
}

function buildItems(payload: any) {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.cart)) return payload.cart;
  if (Array.isArray(payload?.services))
    return payload.services.map((svc: any) => ({
      name: svc?.name || svc?.title || "Service",
      quantity: svc?.quantity || 1,
      price: svc?.price || svc?.amount || 0,
    }));
  return [];
}

function deriveProgress(type: "store" | "service", status?: string | null) {
  const fallbackSteps = type === "store" ? STORE_FLOW : SERVICE_FLOW;
  const hintIndex = status ? STATUS_HINT[status] : undefined;
  if (hintIndex) return Math.min(hintIndex, fallbackSteps.length);
  return type === "store" ? 2 : 3;
}

/**
 * Invoices list endpoint for My Orders.
 *
 * For now, this reads from the `bookings_ledger` table and
 * shapes each row into a lightweight invoice object so the
 * My Orders UI can stay local-first but still backed by Supabase.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing user_id" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();

    const { data, error } = await supabase
      .from("bookings_ledger")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[api/invoices/list] Supabase error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const rawInvoices =
      data?.map((row: any) => {
        const payload = row.payload || {};
        const orderType = inferOrderType(row);
        return {
          id: row.id,
          created_at: row.created_at,
          total:
            payload.total_price ??
            payload.total ??
            row.total ??
            0,
          invoice_url:
            payload.invoice_url ??
            payload.invoice_link ??
            null,
          reference: payload.checkout_id ?? payload.reference ?? row.id,
          invoice_id:
            payload.invoice_number ??
            payload.invoice_id ??
            payload.invoice ??
            row.id,
          order_type: orderType,
          visit_fee: payload.visit_fee ?? null,
          visit_fee_waived: Boolean(payload.visit_fee_waived),
          address:
            payload.address?.formatted ??
            payload.address?.label ??
            payload.site_location?.formatted ??
            payload.site_location?.address ??
            null,
          items: buildItems(payload),
          status: row.status ?? payload.status ?? "pending",
          tracking_steps: orderType === "store" ? STORE_FLOW : SERVICE_FLOW,
          progress: deriveProgress(orderType, row.status ?? payload.status),
          payload,
          raw: row,
        };
      }) ?? [];

    const seen = new Set<string>();
    const invoices = rawInvoices.filter((invoice: any) => {
      const key = String(invoice.invoice_id ?? invoice.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json(
      {
        success: true,
        invoices,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[api/invoices/list] Fatal error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message ?? "Internal error",
      },
      { status: 500 }
    );
  }
}
