// /app/api/edith/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { command, context } = await req.json();

    // Basic built-in commands
    if (command?.toLowerCase() === "ping") {
      return NextResponse.json({ status: "ok", message: "pong" });
    }

    // Safe fallback
    return NextResponse.json({
      status: "ok",
      message: `Edith received your message: "${command}"`,
      context,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
