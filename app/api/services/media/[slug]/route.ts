import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServiceBySlug } from "@/lib/servicesConfig";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BUCKET = "services";

function inferType(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov"))
    return "video";
  return "image";
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  const service = getServiceBySlug(slug);

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const folder = service.mediaFolder;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(folder, { limit: 200, sortBy: { column: "name", order: "asc" } });

  if (error) {
    console.error("MEDIA LIST ERROR", folder, error);
    return NextResponse.json({ files: [] });
  }

  const files =
    data?.map((f) => {
      const path = `${folder}/${f.name}`;
      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return {
        src: publicData.publicUrl,
        type: inferType(f.name),
        alt: f.name,
      };
    }) ?? [];

  return NextResponse.json({ files });
}
