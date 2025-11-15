// 🚨 REQUIRED: stops Next from prerendering this route
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata = {
  title: "HomeFix Interior Estimator",
  description:
    "Kitchen & Wardrobe Estimator — HomeFix India · Edith Technologies",
};

export default function EstimatorPage() {
  return (
    <div style={{ padding: "4rem", textAlign: "center" }}>
      Estimator route temporarily disabled for build debugging.
    </div>
  );
}
