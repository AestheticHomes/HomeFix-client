import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Consultation | HomeFix India",
  description:
    "Schedule a consultation with our interior design experts. Get professional advice for your home renovation and interior needs.",
  openGraph: {
    title: "Book Consultation | HomeFix India",
    description:
      "Expert interior design consultation. Plan your dream home with our professional guidance.",
    url: "https://homefix.co.in/consultation",
  },
};

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
