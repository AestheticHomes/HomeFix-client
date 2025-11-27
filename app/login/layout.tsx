import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | HomeFix India",
  description:
    "Login to your HomeFix account to manage bookings, view orders, and access personalized home services.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
