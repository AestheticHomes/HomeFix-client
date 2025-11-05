import type { Metadata } from "next";
import EstimatorShell from "@/components/estimator/EstimatorShell";

// ✅ Metadata allowed because this is a Server Component
export const metadata: Metadata = {
  title: "HomeFix Interior Estimator",
  description: "Kitchen & Wardrobe Estimator — HomeFix India · Edith Technologies",
};

export default function EstimatorPage() {
  // EstimatorShell is a client component internally
  return <EstimatorShell />;
}
