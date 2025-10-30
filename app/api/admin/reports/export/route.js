import { supabaseServer } from "@/lib/supabaseServerClient";

export async function GET(req) {
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("*");

  if (error) return new Response(JSON.stringify(error), { status: 500 });

  return new Response(JSON.stringify(data), { status: 200 });
}
