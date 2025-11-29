export type ServiceCategory = "turnkey" | "essential";

export interface ServiceDefinition {
  slug: string;
  name: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  bulletsLeft: string[];
  bulletsRight?: string[];
  mediaFolder: string;
  category: ServiceCategory;
  seoTitle: string;
  seoDescription: string;
  highlightBadge?: string;
  ctaLabel?: string;
  ctaSubtext?: string;
  checkoutPath?: string;
  heroMedia?: string;
  gallery?: {
    src: string;
    type: "image" | "video";
    alt?: string;
  }[];
  projects?: {
    id: string;
    title: string;
    media: { src: string; type: "image" | "video" }[];
    location?: string;
    scopeLine?: string;
    tags?: string[];
    highlights?: string[];
  }[];
}

const DEFAULT_CTA = "Book free site visit";
const DEFAULT_SUBTEXT = "Free consultation + free site visit";

const LOCAL_SERVICES: ServiceDefinition[] = [
  // TURNKEY SERVICES
  {
    slug: "full-home",
    name: "Full home interiors",
    tagline: "Layouts, modular furniture, finishes, and execution.",
    heroTitle: "Full home interiors with transparent pricing",
    heroSubtitle:
      "From measurement to handover, we design and build every room under one managed turnkey project.",
    bulletsLeft: [
      "Site measurement and layout planning",
      "Modular furniture, finishes, and lighting plan",
      "Factory-built modules with on-site fitout",
    ],
    bulletsRight: [
      "Single point of contact for the entire project",
      "Clear payment milestones and quality checks",
    ],
    mediaFolder: "full-home",
    category: "turnkey",
    seoTitle: "Full Home Interiors | HomeFix",
    seoDescription:
      "Book a free site visit for full-home interiors. Layouts, renders, BOQ, and turnkey execution managed by HomeFix.",
    highlightBadge: "Turnkey",
    ctaLabel: DEFAULT_CTA,
    ctaSubtext: DEFAULT_SUBTEXT,
    checkoutPath:
      "/checkout?type=service&service=full-home&bookingType=site-visit&free=1",
  },
  {
    slug: "modular-kitchens",
    name: "Modular kitchens",
    tagline: "Ergonomic layouts, finishes, and site-ready installation.",
    heroTitle: "Plan your modular kitchen with a free site visit",
    heroSubtitle:
      "Work triangles, storage zones, and finishes tailored to your cooking style as part of a turnkey scope.",
    bulletsLeft: [
      "On-site measurement and layout planning",
      "Module options for base, wall, and tall units",
      "Countertop, sink, and hardware recommendations",
    ],
    bulletsRight: [
      "Factory precision with supervised installation",
      "Transparent pricing and warranty support",
    ],
    mediaFolder: "modular-kitchens",
    category: "turnkey",
    seoTitle: "Modular Kitchens | HomeFix",
    seoDescription:
      "Book a free visit to plan your modular kitchen. Layouts, storage, finishes, and installation under a turnkey project.",
    highlightBadge: "Turnkey",
    ctaLabel: DEFAULT_CTA,
    ctaSubtext: DEFAULT_SUBTEXT,
    checkoutPath:
      "/checkout?type=service&service=modular-kitchens&bookingType=site-visit&free=1",
  },
  {
    slug: "wardrobes",
    name: "Wardrobes & storage",
    tagline: "Sliding, hinged, lofts, and accessories planned to fit.",
    heroTitle: "Custom wardrobes with smart storage",
    heroSubtitle:
      "Plan shutters, internals, and lofts with our designer as part of your turnkey interiors.",
    bulletsLeft: [
      "Space planning for sliding and hinged wardrobes",
      "Accessory layouts for drawers, hangers, and shoe racks",
      "Finish options: laminates, PU, glass, and more",
    ],
    bulletsRight: [
      "Lofts and niche storage for odd spaces",
      "Factory build and clean on-site fitout",
    ],
    mediaFolder: "wardrobes",
    category: "turnkey",
    seoTitle: "Wardrobes & Storage | HomeFix",
    seoDescription:
      "Free site visit to plan wardrobes and storage. Sliding, hinged, lofts, and accessories with factory-built quality.",
    highlightBadge: "Turnkey",
    ctaLabel: DEFAULT_CTA,
    ctaSubtext: DEFAULT_SUBTEXT,
    checkoutPath:
      "/checkout?type=service&service=wardrobes&bookingType=site-visit&free=1",
  },
  {
    slug: "bathroom",
    name: "Bathroom renovation",
    tagline: "Design, plumbing, waterproofing, and fitout handled end-to-end.",
    heroTitle: "Renovate your bathroom with a managed team",
    heroSubtitle:
      "Layouts, tiling, plumbing, waterproofing, and fixtures coordinated inside a turnkey project.",
    bulletsLeft: [
      "On-site assessment and layout plan",
      "Waterproofing, plumbing, and electrical upgrades",
      "Tile, sanitaryware, and hardware selection support",
    ],
    bulletsRight: [
      "Phased execution to reduce downtime",
      "Quality checks at critical stages",
    ],
    mediaFolder: "bathroom",
    category: "turnkey",
    seoTitle: "Bathroom Renovation | HomeFix",
    seoDescription:
      "Book a free site visit for bathroom renovation. Waterproofing, plumbing, tiling, and fixtures managed by HomeFix.",
    highlightBadge: "Turnkey",
    ctaLabel: DEFAULT_CTA,
    ctaSubtext: DEFAULT_SUBTEXT,
    checkoutPath:
      "/checkout?type=service&service=bathroom&bookingType=site-visit&free=1",
  },
  {
    slug: "tiling",
    name: "Tiling & flooring",
    tagline: "Site prep, tile selection, laying, and finishing.",
    heroTitle: "Tiling and flooring with pro supervision",
    heroSubtitle:
      "Substrate checks, tile layout, and execution integrated into your turnkey project schedule.",
    bulletsLeft: [
      "Site survey and substrate readiness checks",
      "Tile patterns, grout lines, and trims planned",
      "Professional laying with level and alignment checks",
    ],
    bulletsRight: [
      "Finishing, cleaning, and handover-ready floors",
      "Material guidance for wet and dry areas",
    ],
    mediaFolder: "tiling",
    category: "turnkey",
    seoTitle: "Tiling & Flooring | HomeFix",
    seoDescription:
      "Free site visit for tiling and flooring. Substrate prep, tile selection, and execution handled by HomeFix.",
    highlightBadge: "Turnkey",
    ctaLabel: DEFAULT_CTA,
    ctaSubtext: DEFAULT_SUBTEXT,
    checkoutPath:
      "/checkout?type=service&service=tiling&bookingType=site-visit&free=1",
  },
  {
    slug: "civil",
    name: "Civil & structural",
    tagline: "Wall changes, openings, and structural-safe retrofits.",
    heroTitle: "Plan civil changes with engineering oversight",
    heroSubtitle:
      "Assess load-bearing elements, demolitions, and openings before you commit to a turnkey layout.",
    bulletsLeft: [
      "Engineer-led site assessment",
      "Wall changes, openings, and lintel design",
      "Scope and BOQ with safety notes and constraints",
    ],
    bulletsRight: [
      "Execution sequencing with safeguards",
      "Coordination with other trades and services",
    ],
    mediaFolder: "civil",
    category: "turnkey",
    seoTitle: "Civil & Structural | HomeFix",
    seoDescription:
      "Book a free site visit for civil and structural changes. Engineer oversight with safe execution.",
    highlightBadge: "Turnkey",
    ctaLabel: DEFAULT_CTA,
    ctaSubtext: DEFAULT_SUBTEXT,
    checkoutPath:
      "/checkout?type=service&service=civil&bookingType=site-visit&free=1",
  },
  {
    slug: "waterproofing",
    name: "Waterproofing",
    tagline:
      "Leak tracing and waterproofing integrated into your project scope.",
    heroTitle: "Waterproofing inspection & treatment",
    heroSubtitle:
      "Identify damp walls, leak paths, and treatment options as part of a managed turnkey project.",
    bulletsLeft: [
      "On-site dampness and leak inspection",
      "Crack filling and surface preparation",
      "Integrated waterproofing scope in the BOQ",
    ],
    bulletsRight: [
      "Chemical / membrane solutions for wet areas",
      "Coordination with tiling and civil works",
    ],
    mediaFolder: "waterproofing",
    category: "turnkey",
    seoTitle: "Waterproofing | HomeFix",
    seoDescription:
      "Book a free site visit for waterproofing inspection. Leak tracing, dampness analysis, and treatment plan by HomeFix.",
    highlightBadge: "Turnkey",
    ctaLabel: DEFAULT_CTA,
    ctaSubtext: DEFAULT_SUBTEXT,
    checkoutPath:
      "/checkout?type=service&service=waterproofing&bookingType=site-visit&free=1",
  },

  // ESSENTIAL SERVICES
  {
    slug: "painter",
    name: "Painter",
    tagline: "Interior and exterior painting with surface prep.",
    heroTitle: "Professional painting service",
    heroSubtitle:
      "Surface prep, putty, primer, and finish coats executed cleanly for occupied homes.",
    bulletsLeft: [
      "Site measurement and shade selection",
      "Putty / primer application and sanding",
      "Finish coats with neat masking and cleanup",
    ],
    mediaFolder: "painter",
    category: "essential",
    seoTitle: "Painter Service | HomeFix",
    seoDescription:
      "Book professional painters with surface prep, primer, and finish coats for your home.",
    ctaLabel: "Book painting",
    ctaSubtext: "Site visit + quote",
  },
  {
    slug: "electrician",
    name: "Electrician",
    tagline: "Repairs, rewiring, and fixture installs.",
    heroTitle: "Electrical services on call",
    heroSubtitle:
      "Certified electricians for repairs, rewiring, and fixture installations with safety-first checks.",
    bulletsLeft: [
      "Safety inspection of wiring and DB",
      "Repairs, rewiring, and MCB/RCB work",
      "Lighting and fixture installation",
    ],
    mediaFolder: "electrician",
    category: "essential",
    seoTitle: "Electrician Service | HomeFix",
    seoDescription:
      "Book certified electricians for electrical repairs, rewiring, and fixture installations.",
    ctaLabel: "Book electrician",
    ctaSubtext: "Quick scheduling",
  },
];

export async function fetchServicesConfig(): Promise<ServiceDefinition[]> {
  return LOCAL_SERVICES;
}

export function getServiceBySlug(slug: string): ServiceDefinition | undefined {
  return LOCAL_SERVICES.find((s) => s.slug === slug);
}
