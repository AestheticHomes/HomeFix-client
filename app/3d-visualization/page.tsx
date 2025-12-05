/**
 * 3D visualization landing page — includes canonical metadata and Service JSON-LD.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { CANONICAL_ORIGIN } from "@/lib/seoConfig";

const PAGE_URL = `${CANONICAL_ORIGIN}/3d-visualization`;

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  title: "3D Home Interior Visualization in Chennai | HomeFix",
  description:
    "See your home in 3D before you build. HomeFix converts your 2D layout into a full 3D interior model so you can finalise layouts, finishes and storage before spending on materials or labour in Chennai.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "3D Home Interior Visualization in Chennai | HomeFix",
    description:
      "Avoid costly rework and material waste. Upload your 2D floor plan and get a complete 3D interior walkthrough for your kitchen or full home.",
    url: PAGE_URL,
    type: "article",
    images: [
      {
        url: `${CANONICAL_ORIGIN}/images/3d-visualization-cover.jpg`,
        width: 1200,
        height: 630,
        alt: "3D interior visualization preview by HomeFix",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Home Interior Visualization in Chennai | HomeFix",
    description:
      "Convert your 2D plan into a full 3D interior walkthrough and avoid costly rework during execution.",
    images: [`${CANONICAL_ORIGIN}/images/3d-visualization-cover.jpg`],
  },
};

export default function VisualizationPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-foreground">
      <section className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold">
          3D Home Interior Visualization in Chennai
        </h1>
        <h2 className="text-2xl sm:text-3xl font-semibold">
          See your home in 3D before you build.
        </h2>
        <p className="text-base text-muted-foreground">
          Renovation becomes expensive when mistakes appear late. Most homeowners only realise problems after tiles, carpentry or electrical lines are installed. By then, changing anything means breaking and rebuilding — increasing labour cost, material waste and project delays.
        </p>
        <p className="text-base text-muted-foreground">
          With HomeFix, you can visualise your kitchen or full home in accurate 3D before any physical work begins.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">
          What You Get with HomeFix 3D Visualisation
        </h2>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Convert your 2D floor plan into 3D</h3>
          <p className="text-muted-foreground">
            Upload your builder plan, old layout, or a hand-drawn sketch. Our design team converts it into a full 3D model of your home.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Experiment with layouts and storage</h3>
          <p className="text-muted-foreground">
            Try multiple arrangements for wardrobes, kitchen counters, lofts, TV units and furniture.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Pick finishes with confidence</h3>
          <p className="text-muted-foreground">
            Preview laminates, colours, tiles, handles and textures before you commit money.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Avoid rework and save cost</h3>
          <p className="text-muted-foreground">
            Every wrong measurement or wrong finish selected on-site causes material waste. 3D previews help eliminate 90% of these.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Transparent BOQ and execution ready</h3>
          <p className="text-muted-foreground">
            Once your 3D is finalised, you receive a clear Bill of Quantities and project timeline.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">No 2D Drawing? We’ll Take Care of It.</h2>
        <p className="text-muted-foreground">
          A HomeFix design expert can visit your home, measure every room, prepare the 2D layout and then convert it into 3D — all before execution starts.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/consultation"
          className="inline-flex items-center justify-center rounded-full px-5 py-2.5 bg-primary text-primary-foreground font-semibold shadow-md hover:brightness-110 transition"
        >
          Talk to a 3D design expert
        </Link>
        <Link
          href="/instant-quote"
          className="inline-flex items-center justify-center rounded-full px-5 py-2.5 border border-primary text-primary bg-transparent font-semibold hover:bg-(--surface-hover) transition"
        >
          Upload my layout
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "3D Interior Visualization",
            provider: {
              "@type": "Organization",
              name: "HomeFix",
              url: CANONICAL_ORIGIN,
              parentOrganization: {
                "@type": "Organization",
                name: "AestheticHomes",
                url: "https://aesthetichomes.net",
              },
            },
            areaServed: "Chennai",
            description:
              "3D interior visualization service that converts 2D floor plans into immersive 3D models, helping homeowners avoid rework and material waste before renovation begins.",
          }),
        }}
      />
    </main>
  );
}
