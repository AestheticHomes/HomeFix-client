// app/edith/page.tsx
import type { Metadata, Viewport } from "next";
import nextDynamic from "next/dynamic"; // ✅ renamed import to avoid name clash

export const dynamic = "force-dynamic"; // ✅ Next.js runtime flag
export const revalidate = 0;

// ✅ Metadata + viewport
export const metadata: Metadata = {
  title: "Edith Viewer — HomeFix India",
  description: "3D Viewer powered by Edith Technologies",
};

export const viewport: Viewport = {
  themeColor: "#5A5DF0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

// ✅ Dynamically import EdithBot client component
const EdithBot = nextDynamic(() => import("@/components/studio/EdithBot"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen text-[#5A5DF0] dark:text-[#EC6ECF]">
      Loading Edith Viewer...
    </div>
  ),
});

export default function EdithPage() {
  return (
    <main
      className="h-[calc(100vh-72px)] overflow-hidden 
                 bg-gradient-to-br from-[#F8F7FF] to-[#EAE8FF] 
                 dark:from-[#0D0B2B] dark:to-[#1B1545]"
    >
      <EdithBot />
    </main>
  );
}
