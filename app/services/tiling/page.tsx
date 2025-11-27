import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Tiling Services | HomeFix India",
  description:
    "Expert floor and wall tiling services. High-quality installation for bathrooms, kitchens, and living areas.",
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
