import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cost Estimator | HomeFix India",
  description:
    "Calculate the estimated cost for your home interior project. Get a quick quote for modular kitchens, wardrobes, and more.",
  openGraph: {
    title: "Interior Cost Estimator | HomeFix India",
    description:
      "Get an instant estimate for your home interiors. Transparent pricing for all your renovation needs.",
    url: "https://homefix.co.in/instant-quote",
  },
};

export default function EstimatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
