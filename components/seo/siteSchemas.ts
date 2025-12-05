/**
 * SEO structured data: global business graph referencing the canonical origin.
 */
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

const SITE_URL = CANONICAL_ORIGIN;
const LOGO_URL = `${SITE_URL}/logo-homefix.svg`;
const PARENT_ORG_URL = "https://www.aesthetichomes.net";

/**
 * GlobalBusinessGraph
 * SEO: Canonical brand + local business graph that links HomeFix to Aesthetic Homes.
 */
export const GlobalBusinessGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#homefix-org`,
      name: "HomeFix",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
        width: 512,
        height: 512,
      },
      parentOrganization: {
        "@type": "Organization",
        "@id": `${PARENT_ORG_URL}#aesthetichomes-parent`,
        name: "Aesthetic Homes",
        url: PARENT_ORG_URL,
      },
      sameAs: [
        "https://instagram.com/aesthetichomes_in",
        "https://www.youtube.com/@aesthetichomes.in",
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}#homefix-localbusiness`,
      name: "HomeFix",
      url: SITE_URL,
      image: LOGO_URL,
      telephone: "+917397330591",
      priceRange: "₹₹",
      areaServed: ["Chennai"],
      parentOrganization: {
        "@id": `${PARENT_ORG_URL}#aesthetichomes-parent`,
      },
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "#10, Gokul Brindavan Flats, United India Colony, Circular Road",
        addressLocality: "Chennai",
        addressRegion: "TN",
        postalCode: "600024",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 13.0485,
        longitude: 80.2211,
      },
      sameAs: [
        "https://instagram.com/aesthetichomes_in",
        "https://www.youtube.com/@aesthetichomes.in",
      ],
    },
  ],
};
