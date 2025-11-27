import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bathroom Renovation Services | HomeFix India",
  description:
    "Complete bathroom renovation services in Chennai. From plumbing to tiling, we handle everything for your dream bathroom.",
};

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Coming soon</h1>
      <p className="opacity-70 mt-2">
        This service page will be designed as part of the new service experience.
      </p>
    </div>
  );
}
