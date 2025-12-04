import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Finalizes store/service checkout into bookings_ledger, logs events, queues mail, triggers email-queue-worker.
import { supabaseServer } from "@/lib/supabaseServerClient";
import { triggerEmailQueueWorker } from "@/lib/notifications/triggerEmailQueueWorker";

export const runtime = "nodejs";

type CartItem = {
  price?: number;
  quantity?: number;
};

const computeAmountFromCart = (cart: CartItem[] = []) =>
  cart.reduce((sum, item) => {
    const line =
      Number(item?.price ?? 0) * Math.max(Number(item?.quantity ?? 1), 1);
    return sum + (isNaN(line) ? 0 : line);
  }, 0);

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("hf_user_id")?.value ?? null;
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Ensure the session belongs to a verified phone user
    const { data: profile, error: profileError } = await supabaseServer
      .from("user_profiles")
      .select("phone_verified")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile?.phone_verified) {
      return NextResponse.json({ message: "Phone not verified" }, { status: 401 });
    }

    const body = await req.json();
    const isFree = !!body?.isFree;
    const kind = body?.kind ?? "service";
    const sku = body?.sku ?? "turnkey";
    const hasProducts = kind === "product";

    const amountFromCart = computeAmountFromCart(body?.cart);
    const amount = isFree ? 0 : amountFromCart;
    const totalPayable = amount;

    const addr = body?.address ?? {};
    const receiver = body?.contact ?? {};

    const row = {
      user_id: userId,
      type: kind,
      status: "BOOKED",
      total: amount,
      items: body?.cart ?? [],
      payload: {
        sku,
        notes: body?.notes ?? null,
        gateway: isFree ? "none" : "razorpay",
        channel: body?.channel ?? "web",
        source: body?.source ?? (isFree ? "FREE" : "PAID"),
        free: isFree,
        cart_total: amountFromCart,
      },
      receiver_name: receiver?.name ?? null,
      receiver_phone: receiver?.phone ?? null,
      address: addr?.line1
        ? [addr.line1, addr.line2].filter(Boolean).join(", ")
        : addr?.address ?? null,
      pincode: addr?.pincode ?? null,
      latitude: addr?.latitude ?? null,
      longitude: addr?.longitude ?? null,
      landmark: addr?.landmark ?? addr?.line2 ?? null,
      channel: body?.channel ?? "web",
      source: body?.source ?? (isFree ? "FREE" : "PAID"),
      schema_version: 1,
      device_id: body?.deviceId ?? "web",
      checksum: randomUUID().slice(0, 8),
      event_count: 1,
    };

    const { data, error } = await supabaseServer
      .from("bookings_ledger")
      .insert([row])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    await supabaseServer.from("booking_events").insert([
      {
        booking_id: data.id,
        event: "BOOKED",
        status: "BOOKED",
        meta: { channel: row.channel, mode: isFree ? "FREE" : "PAID", sku },
      },
    ]);

    const receiverEmail = receiver?.email ?? null;
    if (!receiverEmail) {
      console.warn("[checkout/finalize] Skipping notification enqueue: missing receiver email");
    } else {
      const { error: notifErr } = await supabaseServer.from("notification_queue").insert([
        {
          kind: hasProducts ? "store_order" : "booking_created",
          to_email: receiverEmail,
          meta: {
            order_ref: data.id,
            booking_id: data.id,
            total_price: totalPayable,
            customer_name: receiver?.name ?? null,
            kind,
            items: body?.cart ?? [],
            channel: row.channel,
            source: row.source,
            free: isFree,
          },
          status: "pending",
          try_count: 0,
        },
      ]);
      if (notifErr) {
        console.error(
          "[checkout/finalize] notification_queue enqueue error:",
          notifErr?.message || notifErr
        );
      } else {
        await triggerEmailQueueWorker();
      }
    }

    return NextResponse.json({ id: data.id }, { status: 200 });
  } catch (err: any) {
    console.error("💥 finalize checkout error:", err);
    return NextResponse.json(
      { message: err?.message || "Finalize failed" },
      { status: 500 }
    );
  }
}
