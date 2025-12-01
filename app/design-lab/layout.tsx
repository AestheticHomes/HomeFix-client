import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Studio | HomeFix India",
  description:
    "Explore our design studio for inspiration. View our portfolio of completed interior projects and design concepts.",
  openGraph: {
    title: "Design Studio | HomeFix India",
    description:
      "Visual inspiration for your home. Browse our gallery of stunning interior designs.",
    url: "https://homefix.co.in/design-lab",
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
