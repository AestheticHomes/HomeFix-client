import type { Metadata } from "next";

import HomePageShell from "@/components/home/HomePageShell";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homefix.co.in";
const AH_URL = "https://aesthetichomes.in";

const SEO_TITLE =
  "HomeFix India | Turnkey interiors, 2D/3D planning, and execution";

const SEO_DESCRIPTION =
  "Book HomeFix for end-to-end interiors in Chennai: measurement, 2D/3D planning, curated materials, installation, and site supervision with lower waste and fewer errors.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_TITLE,
    template: "%s | HomeFix India",
  },
  description: SEO_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "HomeFix India",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/images/homefix-screenshot.png`,
        width: 1280,
        height: 720,
        alt: "HomeFix India homepage showing turnkey interior services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: [`${SITE_URL}/images/homefix-screenshot.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

// ---------------------------------------------------------------------
// 🔹 Brand node (matches AestheticHomes schema @id)
// ---------------------------------------------------------------------
const HOMEFIX_BRAND = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": `${SITE_URL}#brand`,
  name: "HomeFix",
  url: SITE_URL,
  logo: `${SITE_URL}/images/homefix-logo.png`, // adjust if different
} as const;

// ---------------------------------------------------------------------
// 🔹 LocalBusiness node — concrete service + geo
// ---------------------------------------------------------------------
const HOMEFIX_LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": `${SITE_URL}#homefix`,
  name: "HomeFix India",
  url: SITE_URL,
  image: `${SITE_URL}/images/homefix-screenshot.png`,
  description:
    "HomeFix provides turnkey interiors, modular kitchens, wardrobes, carpentry, painting, and renovation with 2D/3D planning in Chennai.",
  telephone: "+91-7397330591",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "No 10, Gokul Brindavan Flats, United India Colony, Kodambakkam",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    postalCode: "600024",
    addressCountry: {
      "@type": "Country",
      name: "IN",
    },
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 13.0516541,
    longitude: 80.2259754,
  },
  areaServed: ["Chennai", "Greater Chennai"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: "+91-7397330591",
    email: "admin@aesthetichomes.net",
    areaServed: "IN",
    availableLanguage: ["en", "ta"],
  },
  parentOrganization: {
    "@type": ["Organization", "HomeAndConstructionBusiness"],
    "@id": `${AH_URL}#ah`,
    name: "AestheticHomes",
    url: AH_URL,
  },
  sameAs: [
    SITE_URL,
    AH_URL,
    "https://www.instagram.com/aesthetichomes_in",
    "https://www.facebook.com/aesthetichomes.in",
  ],
  brand: {
    "@id": `${SITE_URL}#brand`,
  },
} as const;

// ---------------------------------------------------------------------
// 🔹 Organization node — same @id, extra semantics
// ---------------------------------------------------------------------
const HOMEFIX_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": ["Organization", "HomeAndConstructionBusiness"],
  "@id": `${SITE_URL}#homefix`,
  name: "HomeFix India",
  url: SITE_URL,
  logo: `${SITE_URL}/images/homefix-logo.png`,
  description:
    "HomeFix is AestheticHomes' digital-first interiors platform for 2D/3D planning, curated materials, and managed execution in Chennai.",
  sameAs: [SITE_URL, AH_URL],
  serviceType: "Interior Designer",
  parentOrganization: {
    "@type": ["Organization", "HomeAndConstructionBusiness"],
    "@id": `${AH_URL}#ah`,
    name: "AestheticHomes",
    url: AH_URL,
  },
  brand: {
    "@id": `${SITE_URL}#brand`,
  },
} as const;

// ---------------------------------------------------------------------
// 🔹 WebSite + WebPage nodes (nice-to-have, helps GE/AI & Sitelinks)
// ---------------------------------------------------------------------
const HOMEFIX_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  url: SITE_URL,
  name: "HomeFix India",
  description: SEO_DESCRIPTION,
  inLanguage: "en-IN",
  publisher: {
    "@id": `${SITE_URL}#homefix`,
  },
} as const;

const HOMEFIX_WEBPAGE = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}#home`,
  url: SITE_URL,
  name: SEO_TITLE,
  description: SEO_DESCRIPTION,
  isPartOf: {
    "@id": `${SITE_URL}#website`,
  },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${SITE_URL}/images/homefix-screenshot.png`,
  },
} as const;

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          HOMEFIX_BRAND,
          HOMEFIX_LOCAL_BUSINESS,
          HOMEFIX_ORGANIZATION,
          HOMEFIX_WEBSITE,
          HOMEFIX_WEBPAGE,
        ]}
      />
      <HomePageShell />
    </>
  );
}
