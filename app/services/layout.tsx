import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HomeFix Services | Plumbing, Electrical, Carpentry & More",
  description:
    "Explore our wide range of home services including plumbing, electrical, carpentry, painting, and full home renovation in Chennai.",
  openGraph: {
    title: "HomeFix Services | Professional Home Maintenance",
    description:
      "Expert home services at your doorstep. Verified professionals for all your home repair and renovation needs.",
    url: "https://homefix.co.in/services",
    type: "website",
    images: [
      {
        url: "https://homefix.co.in/images/homefix-screenshot.png",
        width: 1200,
        height: 630,
        alt: "HomeFix Services",
      },
    ],
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
