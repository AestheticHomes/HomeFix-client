import type { Metadata } from "next";

import HomePageShell from "@/components/home/HomePageShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homefix.in";

export const metadata: Metadata = {
  title: "HomeFix India | Turnkey interiors, 2D/3D planning, and execution",
  description:
    "Book HomeFix for end-to-end interiors: measurement, 2D/3D planning, curated materials, installation, and site supervision with lower waste and fewer errors.",
  openGraph: {
    title: "HomeFix India | Turnkey interiors, 2D/3D planning, and execution",
    description:
      "Book HomeFix for end-to-end interiors: measurement, 2D/3D planning, curated materials, installation, and site supervision with lower waste and fewer errors.",
    url: SITE_URL,
    type: "website",
    siteName: "HomeFix India",
    images: [
      {
        url: `${SITE_URL}/images/HomeFix.png`,
        width: 1200,
        height: 630,
        alt: "HomeFix India — turnkey home interiors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeFix India | Turnkey interiors with 2D/3D planning",
    description:
      "From measurement to installation: kitchens, wardrobes, doors, and panels with 2D/3D previews and lower waste.",
    images: [`${SITE_URL}/images/HomeFix.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return <HomePageShell />;
}
