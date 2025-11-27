import HomePageShell from "@/components/home/HomePageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";

// Normalize SITE_URL (no trailing slash)
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://homefix.co.in"
).replace(/\/+$/, "");
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
  alternates: { canonical: "/" },
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
// 🔹 Brand
// ---------------------------------------------------------------------
const HOMEFIX_BRAND = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": `${SITE_URL}#brand`,
  name: "HomeFix",
  url: SITE_URL,
  logo: `${SITE_URL}/images/homefix-logo.png`,
} as const;

// ---------------------------------------------------------------------
// 🔹 Parent org (plain Organization; not a LocalBusiness)
// ---------------------------------------------------------------------
const AH_ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${AH_URL}#org`,
  name: "AestheticHomes",
  url: AH_URL,
} as const;

// ---------------------------------------------------------------------
// 🔹 HomeFix entity (single node, multi-typed)
// ---------------------------------------------------------------------
const HOMEFIX_ENTITY = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": `${SITE_URL}#homefix`,
  name: "HomeFix India",
  url: SITE_URL,
  logo: `${SITE_URL}/images/homefix-logo.png`,
  image: `${SITE_URL}/images/homefix-screenshot.png`,
  description:
    "HomeFix provides turnkey interiors, modular kitchens, wardrobes, carpentry, painting, and renovation with 2D/3D planning in Chennai.",
  // Use strict E.164 for all phone numbers (no dashes/spaces)
  telephone: "+917397330591",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "No 10, Gokul Brindavan Flats, United India Colony, Kodambakkam",
    addressLocality: "Chennai",
    addressRegion: "TN",
    postalCode: "600024",
    addressCountry: "IN",
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
    telephone: "+917397330591",
    email: "admin@aesthetichomes.net",
    areaServed: "IN",
    availableLanguage: ["en", "ta"],
  },
  parentOrganization: { "@id": `${AH_URL}#org` }, // reference only
  sameAs: [
    SITE_URL,
    AH_URL,
    "https://www.instagram.com/aesthetichomes_in",
    "https://www.facebook.com/aesthetichomes.in",
  ],
  brand: { "@id": `${SITE_URL}#brand` },
} as const;

// ---------------------------------------------------------------------
// 🔹 WebSite + WebPage
// ---------------------------------------------------------------------
const HOMEFIX_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  url: SITE_URL,
  name: "HomeFix India",
  description: SEO_DESCRIPTION,
  inLanguage: "en-IN",
  publisher: { "@id": `${SITE_URL}#homefix` },
} as const;

const HOMEFIX_WEBPAGE = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}#home`,
  url: SITE_URL,
  name: SEO_TITLE,
  description: SEO_DESCRIPTION,
  isPartOf: { "@id": `${SITE_URL}#website` },
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
          AH_ORG,
          HOMEFIX_ENTITY,
          HOMEFIX_WEBSITE,
          HOMEFIX_WEBPAGE,
        ]}
      />
      <HomePageShell />
    </>
  );
}
